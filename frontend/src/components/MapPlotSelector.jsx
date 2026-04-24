import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  getDistrictOptions,
  getStateFromLocation,
  getStateOptions
} from "../data/formOptions.js";

const DEFAULT_CENTER = [26.8467, 80.9462];
const DEFAULT_ZOOM = 6;
const REQUIRED_POINTS = 4;

export default function MapPlotSelector({ language, copy, locationValue, onLocationChange }) {
  const mapElementRef = useRef(null);
  const mapRef = useRef(null);
  const polygonRef = useRef(null);
  const previewLineRef = useRef(null);
  const pointMarkersRef = useRef([]);
  const drawModeRef = useRef(false);
  const polygonPointsRef = useRef([]);
  const selectedDistrictRef = useRef(locationValue);

  const [selectedState, setSelectedState] = useState(getStateFromLocation(locationValue));
  const [mapStatus, setMapStatus] = useState("");
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [drawMode, setDrawMode] = useState(false);

  const stateOptions = useMemo(() => getStateOptions(language), [language]);
  const districtOptions = useMemo(
    () => getDistrictOptions(language, selectedState),
    [language, selectedState]
  );

  useEffect(() => {
    setSelectedState(getStateFromLocation(locationValue));
    selectedDistrictRef.current = locationValue;
  }, [locationValue]);

  useEffect(() => {
    drawModeRef.current = drawMode;
  }, [drawMode]);

  useEffect(() => {
    polygonPointsRef.current = polygonPoints;
  }, [polygonPoints]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    const container = map.getContainer();
    if (drawMode) {
      map.dragging.disable();
      map.doubleClickZoom.disable();
      map.boxZoom.disable();
      container.classList.add("map-drawing");
      setMapStatus(`Select ${REQUIRED_POINTS} points. ${Math.max(REQUIRED_POINTS - polygonPoints.length, 0)} left.`);
    } else {
      map.dragging.enable();
      map.doubleClickZoom.enable();
      map.boxZoom.enable();
      container.classList.remove("map-drawing");
    }

    return () => {
      if (mapRef.current) {
        map.dragging.enable();
        map.doubleClickZoom.enable();
        map.boxZoom.enable();
        map.getContainer().classList.remove("map-drawing");
      }
    };
  }, [drawMode, polygonPoints.length]);

  useEffect(() => {
    if (!mapElementRef.current || mapRef.current) {
      return;
    }

    const map = L.map(mapElementRef.current, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      scrollWheelZoom: true
    });
    mapRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    const handleClick = (event) => {
      if (!drawModeRef.current) {
        return;
      }

      L.DomEvent.stop(event.originalEvent);

      const nextPoints = [...polygonPointsRef.current, event.latlng];
      polygonPointsRef.current = nextPoints;
      setPolygonPoints(nextPoints);
      renderInProgressShape(map, nextPoints);

      if (nextPoints.length >= REQUIRED_POINTS) {
        finalizePolygon(map, nextPoints);
      } else {
        setMapStatus(`Select ${REQUIRED_POINTS} points. ${REQUIRED_POINTS - nextPoints.length} left.`);
      }
    };

    map.on("click", handleClick);

    return () => {
      map.off("click", handleClick);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !locationValue) {
      return;
    }

    if (selectedDistrictRef.current === locationValue) {
      moveToDistrict(locationValue);
    }
  }, [locationValue]);

  async function moveToDistrict(location) {
    const map = mapRef.current;
    if (!map || !location) {
      return;
    }

    setMapStatus(copy.mapLoading);

    try {
      const query = encodeURIComponent(`${location}, India`);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${query}`
      );
      const results = await response.json();
      const first = results?.[0];

      if (!first) {
        throw new Error("No location match");
      }

      if (first.boundingbox?.length === 4) {
        const [south, north, west, east] = first.boundingbox.map(Number);
        map.fitBounds(
          [
            [south, west],
            [north, east]
          ],
          { padding: [24, 24] }
        );
      } else {
        map.setView([Number(first.lat), Number(first.lon)], 11);
      }

      setMapStatus(copy.mapMoved);
    } catch {
      map.setView(DEFAULT_CENTER, DEFAULT_ZOOM);
      setMapStatus(copy.mapUnavailable);
    }
  }

  function handleStateChange(value) {
    setSelectedState(value);
    const firstDistrict = getDistrictOptions(language, value)[0]?.value;
    if (firstDistrict) {
      selectedDistrictRef.current = firstDistrict;
      onLocationChange(firstDistrict);
      moveToDistrict(firstDistrict);
    }
  }

  function handleDistrictChange(value) {
    selectedDistrictRef.current = value;
    onLocationChange(value);
    moveToDistrict(value);
  }

  function startPolygonDraw() {
    clearExistingShape();
    setDrawMode(true);
    setMapStatus(`Select ${REQUIRED_POINTS} points. ${REQUIRED_POINTS} left.`);
  }

  function clearPlot() {
    clearExistingShape();
    setDrawMode(false);
    setMapStatus(copy.plotEmpty);
  }

  function clearExistingShape() {
    const map = mapRef.current;
    if (!map) {
      return;
    }

    if (polygonRef.current) {
      map.removeLayer(polygonRef.current);
      polygonRef.current = null;
    }

    if (previewLineRef.current) {
      map.removeLayer(previewLineRef.current);
      previewLineRef.current = null;
    }

    pointMarkersRef.current.forEach((marker) => map.removeLayer(marker));
    pointMarkersRef.current = [];
    polygonPointsRef.current = [];
    setPolygonPoints([]);
  }

  function renderInProgressShape(map, points) {
    if (previewLineRef.current) {
      map.removeLayer(previewLineRef.current);
      previewLineRef.current = null;
    }

    const latestPoint = points[points.length - 1];
    const marker = L.circleMarker(latestPoint, {
      radius: 5,
      color: "#1b5e20",
      fillColor: "#66bb6a",
      fillOpacity: 0.95,
      weight: 2
    }).addTo(map);
    pointMarkersRef.current.push(marker);

    if (points.length > 1) {
      previewLineRef.current = L.polyline(points, {
        color: "#2e7d32",
        weight: 2,
        dashArray: "5 6"
      }).addTo(map);
    }
  }

  function finalizePolygon(map, points) {
    if (previewLineRef.current) {
      map.removeLayer(previewLineRef.current);
      previewLineRef.current = null;
    }

    if (polygonRef.current) {
      map.removeLayer(polygonRef.current);
    }

    polygonRef.current = L.polygon(points, {
      color: "#1b5e20",
      weight: 2,
      fillColor: "#66bb6a",
      fillOpacity: 0.22
    }).addTo(map);

    setDrawMode(false);
    setMapStatus(copy.plotReady);
  }

  const approxHectares = polygonPoints.length === REQUIRED_POINTS
    ? estimatePolygonAreaHectares(polygonPoints)
    : null;

  return (
    <section className="rounded-[2rem] bg-white/90 p-5 shadow-soft ring-1 ring-mud/10">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-mud">{copy.mapTitle}</h3>
        <p className="mt-1 text-sm text-mud/65">{copy.mapBody}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block text-sm font-bold text-mud">{copy.state}</span>
          <select
            value={selectedState}
            onChange={(event) => handleStateChange(event.target.value)}
            className="w-full rounded-2xl border border-mud/15 bg-beige/60 px-4 py-3 text-mud outline-none transition focus:border-leaf focus:bg-white focus:ring-4 focus:ring-leaf/10"
          >
            {stateOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-2 block text-sm font-bold text-mud">{copy.district}</span>
          <select
            value={locationValue}
            onChange={(event) => handleDistrictChange(event.target.value)}
            className="w-full rounded-2xl border border-mud/15 bg-beige/60 px-4 py-3 text-mud outline-none transition focus:border-leaf focus:bg-white focus:ring-4 focus:ring-leaf/10"
          >
            {districtOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="mt-2 block text-xs text-mud/60">{copy.mapDistrictHint}</span>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={startPolygonDraw}
          className={`rounded-full px-4 py-2 text-sm font-bold transition ${
            drawMode ? "bg-leaf text-white" : "bg-field text-leaf"
          }`}
        >
          {drawMode ? copy.drawingPlot : copy.drawPlot}
        </button>
        <button
          type="button"
          onClick={clearPlot}
          className="rounded-full border border-mud/10 bg-white px-4 py-2 text-sm font-bold text-mud"
        >
          {copy.clearPlot}
        </button>
      </div>

      <div ref={mapElementRef} className="map-shell mt-4 overflow-hidden rounded-[1.5rem] border border-mud/10" />

      <div className="mt-4 rounded-2xl bg-beige/60 px-4 py-3 text-sm text-mud">
        {approxHectares ? (
          <>
            <strong>{copy.plotReady}.</strong> {copy.plotArea}: {approxHectares} ha
          </>
        ) : drawMode ? (
          `Points selected: ${polygonPoints.length}/${REQUIRED_POINTS}`
        ) : (
          copy.plotEmpty
        )}
      </div>

      {mapStatus && <p className="mt-3 text-xs text-mud/60">{mapStatus}</p>}
    </section>
  );
}

function estimatePolygonAreaHectares(points) {
  if (points.length < 3) {
    return null;
  }

  const origin = points[0];
  const projected = points.map((point) => projectPoint(point, origin));
  let area = 0;

  for (let index = 0; index < projected.length; index += 1) {
    const current = projected[index];
    const next = projected[(index + 1) % projected.length];
    area += current.x * next.y - next.x * current.y;
  }

  return (Math.abs(area) / 2 / 10000).toFixed(2);
}

function projectPoint(point, origin) {
  const metersPerDegreeLat = 111320;
  const metersPerDegreeLon = 111320 * Math.cos((origin.lat * Math.PI) / 180);
  return {
    x: (point.lng - origin.lng) * metersPerDegreeLon,
    y: (point.lat - origin.lat) * metersPerDegreeLat
  };
}
