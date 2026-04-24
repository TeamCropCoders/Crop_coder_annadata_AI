from __future__ import annotations

import csv
from pathlib import Path
from typing import Dict, List, Optional

from fastapi import FastAPI
from pydantic import BaseModel, Field

from scripts.compatibility_score import (
    CROP_IDEAL_PROFILES,
    SoilConditions,
    compute_compatibility_score,
    recommend_top_crops,
)
from scripts.data_gov_config import get_data_gov_api_key
from scripts.fetch_mandi_prices import (
    aggregate_prices,
    fetch_price_records,
    latest_period_records,
    write_csv,
)


app = FastAPI(
    title="Crop Coders API",
    description="Integrated Market and Soil Intelligence API for farmer advisory.",
    version="0.1.0",
)


SOIL_TYPE_BASELINES = {
    "Loamy": {
        "n_value": 75.0,
        "p_value": 38.0,
        "k_value": 55.0,
        "ph_value": 6.7,
    },
    "Clayey": {
        "n_value": 65.0,
        "p_value": 32.0,
        "k_value": 70.0,
        "ph_value": 6.4,
    },
    "Sandy": {
        "n_value": 45.0,
        "p_value": 25.0,
        "k_value": 35.0,
        "ph_value": 6.2,
    },
    "Black": {
        "n_value": 90.0,
        "p_value": 42.0,
        "k_value": 85.0,
        "ph_value": 7.2,
    },
}


DISTRICT_SEASON_WEATHER = {
    ("Uttar Pradesh", "Agra", "Rabi"): {
        "rainfall_mm": 180.0,
        "temperature_c": 20.0,
        "humidity_pct": 58.0,
    },
    ("Uttar Pradesh", "Agra", "Kharif"): {
        "rainfall_mm": 620.0,
        "temperature_c": 31.0,
        "humidity_pct": 72.0,
    },
}

DEFAULT_WEATHER = {
    "Rabi": {
        "rainfall_mm": 220.0,
        "temperature_c": 21.0,
        "humidity_pct": 60.0,
    },
    "Kharif": {
        "rainfall_mm": 700.0,
        "temperature_c": 29.0,
        "humidity_pct": 75.0,
    },
    "Zaid": {
        "rainfall_mm": 120.0,
        "temperature_c": 33.0,
        "humidity_pct": 50.0,
    },
}

LATEST_YIELD_FEATURES_PATH = Path("data/clean/latest_yield_features.csv")
RAINFALL_SNAPSHOT_PATHS = [
    Path("data/raw/rainfall/district_rainfall.csv"),
    Path(r"C:\Users\shikh\Downloads\6c05cd1b-ed59-40c2-bc31-e314f39c6971_d73cb6378cea5150ba42edd1aa05a93c.csv"),
]


class AdvisoryRequest(BaseModel):
    state: str = Field(..., examples=["Uttar Pradesh"])
    district: str = Field(..., examples=["Agra"])
    season: str = Field(..., examples=["Rabi"])
    soil_type: str = Field(..., examples=["Loamy"])
    crop: str = Field(..., examples=["Potato"])
    area_hectare: float = Field(1.0, gt=0)
    n_value: Optional[float] = None
    p_value: Optional[float] = None
    k_value: Optional[float] = None
    ph_value: Optional[float] = None
    rainfall_mm: Optional[float] = None
    temperature_c: Optional[float] = None
    humidity_pct: Optional[float] = None


class AdvisoryResponse(BaseModel):
    input: Dict[str, object]
    market_price: Dict[str, object]
    yield_prediction: Dict[str, object]
    selected_crop_compatibility: Dict[str, object]
    recommendations: List[Dict[str, object]]
    notes: List[str]


def default_soil_conditions(soil_type: str, crop: str) -> SoilConditions:
    soil_baseline = SOIL_TYPE_BASELINES.get(
        soil_type.title(),
        SOIL_TYPE_BASELINES["Loamy"],
    )
    return SoilConditions(
        soil_type=soil_type.title(),
        n_value=soil_baseline["n_value"],
        p_value=soil_baseline["p_value"],
        k_value=soil_baseline["k_value"],
        ph_value=soil_baseline["ph_value"],
        rainfall_mm=DEFAULT_WEATHER["Rabi"]["rainfall_mm"],
        temperature_c=DEFAULT_WEATHER["Rabi"]["temperature_c"],
        humidity_pct=DEFAULT_WEATHER["Rabi"]["humidity_pct"],
    )


def build_soil_conditions(request: AdvisoryRequest) -> SoilConditions:
    defaults = default_soil_conditions(request.soil_type, request.crop)
    weather_baseline = DISTRICT_SEASON_WEATHER.get(
        (request.state.title(), request.district.title(), request.season.title()),
        DEFAULT_WEATHER.get(request.season.title(), DEFAULT_WEATHER["Rabi"]),
    )
    rainfall_from_snapshot = get_seasonal_rainfall_from_snapshot(
        request.state,
        request.district,
        request.season,
    )
    return SoilConditions(
        soil_type=request.soil_type.title(),
        n_value=request.n_value if request.n_value is not None else defaults.n_value,
        p_value=request.p_value if request.p_value is not None else defaults.p_value,
        k_value=request.k_value if request.k_value is not None else defaults.k_value,
        ph_value=request.ph_value if request.ph_value is not None else defaults.ph_value,
        rainfall_mm=(
            request.rainfall_mm
            if request.rainfall_mm is not None
            else rainfall_from_snapshot
            if rainfall_from_snapshot is not None
            else weather_baseline["rainfall_mm"]
        ),
        temperature_c=(
            request.temperature_c
            if request.temperature_c is not None
            else weather_baseline["temperature_c"]
        ),
        humidity_pct=(
            request.humidity_pct
            if request.humidity_pct is not None
            else weather_baseline["humidity_pct"]
        ),
    )


def season_months(season: str) -> set[int]:
    season_name = season.title()
    if season_name == "Rabi":
        return {10, 11, 12, 1, 2, 3}
    if season_name == "Kharif":
        return {6, 7, 8, 9, 10}
    if season_name == "Zaid":
        return {3, 4, 5, 6}
    return set(range(1, 13))


def get_seasonal_rainfall_from_snapshot(
    state: str,
    district: str,
    season: str,
) -> Optional[float]:
    rows: List[Dict[str, str]] = []
    snapshot_paths = [
        *RAINFALL_SNAPSHOT_PATHS,
        *Path("data/raw/rainfall").glob("*.csv"),
    ]
    for path in snapshot_paths:
        if path.exists():
            with path.open("r", newline="", encoding="utf-8") as file:
                rows.extend(csv.DictReader(file))

    months = season_months(season)
    matching_rows = [
        row
        for row in rows
        if row.get("State", "").lower() == state.lower()
        and row.get("District", "").lower() == district.lower()
        and int(float(row.get("Month", 0))) in months
        and row.get("Avg_rainfall") not in (None, "")
    ]
    if not matching_rows:
        return None

    latest_year = max(int(float(row["Year"])) for row in matching_rows)
    latest_rows = [
        row for row in matching_rows if int(float(row["Year"])) == latest_year
    ]
    return round(sum(float(row["Avg_rainfall"]) for row in latest_rows), 2)


def load_latest_yield_rows() -> List[Dict[str, str]]:
    if not LATEST_YIELD_FEATURES_PATH.exists():
        return []

    with LATEST_YIELD_FEATURES_PATH.open("r", newline="", encoding="utf-8") as file:
        return list(csv.DictReader(file))


def find_historical_yield(
    state: str,
    district: str,
    crop: str,
    season: str,
) -> Optional[Dict[str, object]]:
    for row in load_latest_yield_rows():
        if (
            row["state"].lower() == state.lower()
            and row["district"].lower() == district.lower()
            and row["crop"].lower() == crop.lower()
            and row["season"].lower() == season.lower()
            and row["yield_per_hectare"]
        ):
            return {
                "yield_per_hectare": float(row["yield_per_hectare"]),
                "year_end": int(row["year_end"]),
                "area_hectare": float(row["area_hectare"]),
                "production": float(row["production"]),
                "yield_unit": row["yield_unit"],
            }
    return None


def available_reference_crops_for_location(
    state: str,
    district: str,
    season: str,
) -> List[str]:
    available = set()
    for row in load_latest_yield_rows():
        if (
            row["state"].lower() == state.lower()
            and row["district"].lower() == district.lower()
            and row["season"].lower() == season.lower()
            and row["crop"] in CROP_IDEAL_PROFILES
            and row["yield_per_hectare"]
        ):
            available.add(row["crop"])
    return sorted(available)


def predict_yield_tonne_per_hectare(
    crop: str,
    season: str,
    compatibility_score: float,
    historical_yield: Optional[Dict[str, object]] = None,
) -> Optional[float]:
    if historical_yield:
        compatibility_factor = max(0.55, compatibility_score / 100)
        return round(float(historical_yield["yield_per_hectare"]) * compatibility_factor, 2)

    base_yield = {
        "Potato": 24.0,
        "Wheat": 3.4,
        "Rice": 4.2,
        "Maize": 3.8,
        "Cotton": 1.8,
        "Sugarcane": 72.0,
    }.get(crop.title(), 3.0)

    season_factor = 1.0 if season.title() == "Rabi" else 0.95
    compatibility_factor = max(0.55, compatibility_score / 100)
    return round(base_yield * season_factor * compatibility_factor, 2)


def recommend_location_crops(
    actual: SoilConditions,
    state: str,
    district: str,
    season: str,
    top_n: int = 3,
) -> List[Dict[str, object]]:
    ranked: List[Dict[str, object]] = []
    available_crops = available_reference_crops_for_location(state, district, season)

    for crop in available_crops:
        profile = CROP_IDEAL_PROFILES[crop]
        score, penalties = compute_compatibility_score(actual, profile)
        limiting_factors = sorted(
            [item for item in penalties.items() if item[1] > 0],
            key=lambda item: item[1],
            reverse=True,
        )[:3]
        historical_yield = find_historical_yield(state, district, crop, season)
        ranked.append(
            {
                "crop": crop,
                "compatibility_score": score,
                "historical_yield_per_hectare": historical_yield["yield_per_hectare"]
                if historical_yield
                else None,
                "latest_year": historical_yield["year_end"] if historical_yield else None,
                "limiting_factors": [name for name, _ in limiting_factors] or ["none"],
            }
        )

    ranked.sort(
        key=lambda item: (
            item["compatibility_score"],
            item["historical_yield_per_hectare"] or 0,
        ),
        reverse=True,
    )
    return ranked[:top_n]


def fetch_market_price_summary(request: AdvisoryRequest) -> Dict[str, object]:
    output = Path("data/raw/mandi_prices") / (
        f"{request.district.lower()}_{request.crop.lower()}_monthly.csv".replace(" ", "_")
    )

    records = fetch_price_records(
        api_key=get_data_gov_api_key(),
        commodity=request.crop.title(),
        district=request.district.title(),
        state=request.state.title(),
        limit=10,
        max_pages=1,
    )
    period_records = latest_period_records(records, "monthly")
    summary = aggregate_prices(period_records, "monthly")
    if summary["record_count"] == 0:
        fallback = fallback_market_price_summary(request)
        if fallback:
            return fallback

    write_csv(output, period_records, summary)
    summary["output_file"] = str(output)
    return summary


def fallback_market_price_summary(request: AdvisoryRequest) -> Optional[Dict[str, object]]:
    snapshot = Path("data/raw/mandi_prices") / (
        f"{request.district.lower()}_{request.crop.lower()}_monthly.csv".replace(" ", "_")
    )
    if not snapshot.exists():
        return None

    with snapshot.open("r", newline="", encoding="utf-8") as file:
        rows = list(csv.DictReader(file))

    if not rows:
        return None

    modal_prices = [float(row["modal_price"]) for row in rows if row.get("modal_price")]
    min_prices = [float(row["min_price"]) for row in rows if row.get("min_price")]
    max_prices = [float(row["max_price"]) for row in rows if row.get("max_price")]

    return {
        "period": "monthly",
        "record_count": len(rows),
        "avg_min_price": round(sum(min_prices) / len(min_prices), 2) if min_prices else None,
        "avg_max_price": round(sum(max_prices) / len(max_prices), 2) if max_prices else None,
        "avg_modal_price": round(sum(modal_prices) / len(modal_prices), 2) if modal_prices else None,
        "latest_arrival_date": rows[0].get("arrival_date"),
        "output_file": str(snapshot),
        "source": "stored_snapshot",
    }


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.post("/advisory", response_model=AdvisoryResponse)
def advisory(request: AdvisoryRequest) -> AdvisoryResponse:
    crop_name = request.crop.title()
    soil_conditions = build_soil_conditions(request)
    notes = []

    if crop_name not in CROP_IDEAL_PROFILES:
        notes.append("Selected crop not found in reference profile; using Wheat baseline.")
        crop_profile = CROP_IDEAL_PROFILES["Wheat"]
    else:
        crop_profile = CROP_IDEAL_PROFILES[crop_name]

    compatibility_score, penalty_breakdown = compute_compatibility_score(
        soil_conditions,
        crop_profile,
    )
    historical_yield = find_historical_yield(
        request.state,
        request.district,
        crop_name,
        request.season,
    )
    predicted_yield = predict_yield_tonne_per_hectare(
        crop_name,
        request.season,
        compatibility_score,
        historical_yield,
    )
    predicted_production = (
        round(predicted_yield * request.area_hectare, 2)
        if predicted_yield is not None
        else None
    )

    try:
        market_price = fetch_market_price_summary(request)
    except Exception as exc:
        market_price = fallback_market_price_summary(request) or {
            "period": "monthly",
            "record_count": 0,
            "avg_modal_price": None,
            "latest_arrival_date": None,
            "error": str(exc),
        }
        notes.append("Live mandi API failed; response used stored snapshot when available.")

    if not any(
        value is not None
        for value in [
            request.n_value,
            request.p_value,
            request.k_value,
            request.ph_value,
            request.rainfall_mm,
            request.temperature_c,
            request.humidity_pct,
        ]
    ):
        rainfall_source = (
            "stored district rainfall snapshot"
            if get_seasonal_rainfall_from_snapshot(
                request.state,
                request.district,
                request.season,
            )
            is not None
            else "district-season baseline"
        )
        notes.append(
            f"NPK and pH were estimated from soil type; rainfall came from {rainfall_source}; temperature and humidity used seasonal baseline values."
        )
    if historical_yield is None:
        notes.append("No district-season historical yield row was found for the selected crop; yield uses fallback baseline until more production data is available.")

    return AdvisoryResponse(
        input={
            "state": request.state,
            "district": request.district,
            "season": request.season,
            "soil_type": request.soil_type,
            "crop": request.crop,
            "area_hectare": request.area_hectare,
        },
        market_price=market_price,
        yield_prediction={
            "predicted_yield_tonne_per_hectare": predicted_yield,
            "predicted_production_tonnes": predicted_production,
            "historical_yield_found": historical_yield is not None,
            "historical_yield": historical_yield,
        },
        selected_crop_compatibility={
            "crop": crop_name,
            "compatibility_score": compatibility_score,
            "penalty_breakdown": penalty_breakdown,
        },
        recommendations=recommend_location_crops(
            soil_conditions,
            request.state,
            request.district,
            request.season,
            top_n=3,
        )
        or recommend_top_crops(soil_conditions, top_n=3),
        notes=notes,
    )
