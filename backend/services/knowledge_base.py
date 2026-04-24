from __future__ import annotations

import csv
import json
import os
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any
import urllib.parse
import urllib.request

from scripts.data_gov_config import get_variety_wise_api_key


YIELD_DATA_PATH = Path("data/clean/latest_yield_features.csv")
MANDI_DATA_DIR = Path("data/raw/mandi_prices")
RAINFALL_DATA_DIR = Path("data/raw/rainfall")
STATE_SOIL_DISTRIBUTION_PATH = Path("data/reference/state_soil_distribution.csv")
CROP_SOIL_PROFILES_PATH = Path("data/reference/crop_soil_profiles.csv")
SOIL_TYPE_REFERENCE_PATH = Path("data/reference/soil_type_reference.csv")
CROP_CATALOG_PATH = Path("data/reference/crop_catalog.csv")

STATE_ALIASES = {
    "up": "uttar pradesh",
    "uttar pradesh": "uttar pradesh",
}

SOIL_COMPATIBILITY = {
    "alluvial": {"wheat": 90, "rice": 85, "maize": 80, "potato": 84, "sugarcane": 76},
    "black": {"cotton": 94, "sugarcane": 84, "mango": 80, "gram": 72, "maize": 70},
    "clayey": {"rice": 92, "wheat": 74, "sugarcane": 72, "gram": 60, "banana": 68},
    "laterite": {"coconut": 88, "cashew": 84, "coffee": 75, "mango": 72},
    "loamy": {"wheat": 92, "potato": 90, "gram": 84, "barley": 82, "maize": 78, "rice": 70, "sugarcane": 65, "mango": 76},
    "red": {"groundnut": 82, "millet": 76, "maize": 74, "mango": 80, "arhar/tur": 73},
    "sandy": {"gram": 78, "bajra": 82, "groundnut": 76, "wheat": 58, "watermelon": 72},
}

BASELINE_PRICES = {
    "wheat": 2150.0,
    "potato": 950.0,
    "gram": 5200.0,
    "barley": 1850.0,
    "rapeseed &mustard": 6100.0,
    "maize": 1900.0,
    "rice": 2550.0,
    "sugarcane": 360.0,
}

MANDI_API_RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"
MANDI_API_BASE_URL = f"https://api.data.gov.in/resource/{MANDI_API_RESOURCE_ID}"


@dataclass(frozen=True)
class KnowledgeCropRow:
    state: str
    district: str
    crop: str
    season: str
    year_end: int
    area_hectare: float
    production: float
    yield_per_hectare: float


@dataclass(frozen=True)
class CropSoilProfile:
    crop: str
    avg_n: float
    avg_p: float
    avg_k: float
    avg_temperature: float
    avg_humidity: float
    avg_ph: float
    avg_rainfall: float


@dataclass(frozen=True)
class SoilTypeReference:
    soil_type: str
    n_value: float
    p_value: float
    k_value: float
    ph_value: float
    temperature_c: float
    humidity_pct: float


@dataclass(frozen=True)
class CropCatalogEntry:
    crop: str
    preferable_season: str
    preferable_soils: tuple[str, ...]


def _normalize_text(value: str) -> str:
    return " ".join(str(value).strip().lower().split())


def _normalize_state(value: str) -> str:
    normalized = _normalize_text(value)
    return STATE_ALIASES.get(normalized, normalized)


@lru_cache(maxsize=1)
def load_yield_rows() -> list[KnowledgeCropRow]:
    rows: list[KnowledgeCropRow] = []
    if not YIELD_DATA_PATH.exists():
        return rows

    with YIELD_DATA_PATH.open("r", newline="", encoding="utf-8") as file:
        for row in csv.DictReader(file):
            if not row.get("yield_per_hectare"):
                continue
            rows.append(
                KnowledgeCropRow(
                    state=_normalize_state(row["state"]),
                    district=_normalize_text(row["district"]),
                    crop=row["crop"].strip(),
                    season=_normalize_text(row["season"]),
                    year_end=int(float(row["year_end"])),
                    area_hectare=float(row["area_hectare"]),
                    production=float(row["production"]),
                    yield_per_hectare=float(row["yield_per_hectare"]),
                )
            )
    return rows


@lru_cache(maxsize=1)
def load_mandi_rows() -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    if not MANDI_DATA_DIR.exists():
        return rows

    for csv_path in MANDI_DATA_DIR.glob("*.csv"):
        with csv_path.open("r", newline="", encoding="utf-8") as file:
            for row in csv.DictReader(file):
                rows.append(row)
    return rows


@lru_cache(maxsize=1)
def load_rainfall_rows() -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    if not RAINFALL_DATA_DIR.exists():
        return rows

    for csv_path in RAINFALL_DATA_DIR.glob("*.csv"):
        with csv_path.open("r", newline="", encoding="utf-8") as file:
            rows.extend(csv.DictReader(file))
    return rows


@lru_cache(maxsize=1)
def load_state_soil_distribution() -> dict[str, str]:
    mapping: dict[str, str] = {}
    if not STATE_SOIL_DISTRIBUTION_PATH.exists():
        return mapping

    with STATE_SOIL_DISTRIBUTION_PATH.open("r", newline="", encoding="utf-8") as file:
        for row in csv.DictReader(file):
            mapping[_normalize_state(row["state"])] = _normalize_text(row["dominant_soil_type"])
    return mapping


@lru_cache(maxsize=1)
def load_crop_soil_profiles() -> dict[str, CropSoilProfile]:
    profiles: dict[str, CropSoilProfile] = {}
    if not CROP_SOIL_PROFILES_PATH.exists():
        return profiles

    with CROP_SOIL_PROFILES_PATH.open("r", newline="", encoding="utf-8") as file:
        for row in csv.DictReader(file):
            profiles[_normalize_text(row["crop"])] = CropSoilProfile(
                crop=row["crop"],
                avg_n=float(row["avg_n"]),
                avg_p=float(row["avg_p"]),
                avg_k=float(row["avg_k"]),
                avg_temperature=float(row["avg_temperature"]),
                avg_humidity=float(row["avg_humidity"]),
                avg_ph=float(row["avg_ph"]),
                avg_rainfall=float(row["avg_rainfall"]),
            )
    return profiles


@lru_cache(maxsize=1)
def load_soil_type_references() -> dict[str, SoilTypeReference]:
    references: dict[str, SoilTypeReference] = {}
    if not SOIL_TYPE_REFERENCE_PATH.exists():
        return references

    with SOIL_TYPE_REFERENCE_PATH.open("r", newline="", encoding="utf-8") as file:
        for row in csv.DictReader(file):
            references[_normalize_text(row["soil_type"])] = SoilTypeReference(
                soil_type=row["soil_type"],
                n_value=float(row["n_value"]),
                p_value=float(row["p_value"]),
                k_value=float(row["k_value"]),
                ph_value=float(row["ph_value"]),
                temperature_c=float(row["temperature_c"]),
                humidity_pct=float(row["humidity_pct"]),
            )
    return references


@lru_cache(maxsize=1)
def load_crop_catalog() -> dict[str, CropCatalogEntry]:
    catalog: dict[str, CropCatalogEntry] = {}
    if not CROP_CATALOG_PATH.exists():
        return catalog

    with CROP_CATALOG_PATH.open("r", newline="", encoding="utf-8") as file:
        for row in csv.DictReader(file):
            crop_key = _normalize_text(row["crop"])
            catalog[crop_key] = CropCatalogEntry(
                crop=row["crop"],
                preferable_season=_normalize_text(row["preferable_season"]),
                preferable_soils=tuple(
                    _normalize_text(item) for item in row["preferable_soil"].split("|")
                ),
            )
    return catalog


def season_months(season: str) -> set[int]:
    season_name = _normalize_text(season)
    if season_name == "rabi":
        return {10, 11, 12, 1, 2, 3}
    if season_name == "kharif":
        return {6, 7, 8, 9, 10}
    if season_name == "summer":
        return {3, 4, 5, 6}
    return set(range(1, 13))


def resolve_location(location: str) -> tuple[str | None, str | None]:
    text = _normalize_text(location)
    if "," in text:
        district_part, state_part = [part.strip() for part in text.split(",", 1)]
        return _normalize_state(state_part), district_part

    normalized_state = STATE_ALIASES.get(text)
    if normalized_state:
        return normalized_state, None

    # Try to find a matching district in yield data.
    districts = {row.district: row.state for row in load_yield_rows()}
    if text in districts:
        return districts[text], text

    return text, None


def district_and_state_rows(location: str, season: str) -> tuple[list[KnowledgeCropRow], list[KnowledgeCropRow], str | None, str | None]:
    state, district = resolve_location(location)
    normalized_season = _normalize_text(season)
    rows = [
        row for row in load_yield_rows()
        if row.season == normalized_season
    ]
    district_rows = [
        row for row in rows
        if district and row.district == district and row.state == state
    ]
    state_rows = [
        row for row in rows
        if state and row.state == state
    ]
    return district_rows, state_rows, state, district


def recommendation_score(crop: str, soil: str, season: str, location: str, yield_value: float) -> float:
    normalized_crop = _normalize_text(crop)
    normalized_soil = _normalize_text(soil)
    catalog = load_crop_catalog().get(normalized_crop)
    soil_reference = load_soil_type_references().get(normalized_soil)
    crop_profile = load_crop_soil_profiles().get(normalized_crop)
    rainfall = seasonal_rainfall(location, season)

    soil_score = SOIL_COMPATIBILITY.get(normalized_soil, {}).get(normalized_crop)
    if soil_score is None:
        state_profile_score = infer_soil_score_from_crop_profile(normalized_crop, normalized_soil)
        soil_score = state_profile_score if state_profile_score is not None else 60

    season_score = 18 if catalog and catalog.preferable_season == _normalize_text(season) else 8
    preferred_soil_bonus = 15 if catalog and normalized_soil in catalog.preferable_soils else 0
    profile_score = profile_compatibility_score(soil_reference, crop_profile, rainfall)
    yield_bonus = min(yield_value * 4, 25)
    total = (soil_score * 0.35) + (profile_score * 0.35) + season_score + preferred_soil_bonus + (yield_bonus * 0.3)
    return round(min(total, 99.0), 2)


def infer_soil_score_from_crop_profile(crop: str, soil: str) -> float | None:
    profile = load_crop_soil_profiles().get(crop)
    if profile is None:
        return None

    soil_adjustments = {
        "black": 6 if profile.avg_ph >= 6.5 else -3,
        "red": 5 if profile.avg_rainfall >= 80 else -2,
        "alluvial": 6 if profile.avg_n >= 40 else 1,
        "loamy": 7 if 5.8 <= profile.avg_ph <= 7.2 else 0,
        "clayey": 4 if profile.avg_humidity >= 70 else -2,
        "laterite": 3 if profile.avg_rainfall >= 100 else -3,
        "sandy": 4 if profile.avg_rainfall < 90 else -4,
    }
    return float(66 + soil_adjustments.get(soil, 0))


def profile_compatibility_score(
    soil_reference: SoilTypeReference | None,
    crop_profile: CropSoilProfile | None,
    rainfall: float | None,
) -> float:
    if soil_reference is None or crop_profile is None:
        return 60.0

    n_score = max(0.0, 100 - abs(soil_reference.n_value - crop_profile.avg_n) * 0.9)
    p_score = max(0.0, 100 - abs(soil_reference.p_value - crop_profile.avg_p) * 1.0)
    k_score = max(0.0, 100 - abs(soil_reference.k_value - crop_profile.avg_k) * 0.8)
    ph_score = max(0.0, 100 - abs(soil_reference.ph_value - crop_profile.avg_ph) * 22.0)
    rainfall_score = 60.0 if rainfall is None else max(0.0, 100 - abs(rainfall - crop_profile.avg_rainfall) * 0.18)

    return round((n_score * 0.22) + (p_score * 0.18) + (k_score * 0.18) + (ph_score * 0.22) + (rainfall_score * 0.20), 2)


def recommend_from_knowledge_base(soil: str, location: str, season: str, top_n: int = 3) -> list[dict[str, Any]]:
    district_rows, state_rows, state, _ = district_and_state_rows(location, season)
    if _normalize_text(soil) in {"", "unknown"} and state:
        soil = load_state_soil_distribution().get(state, soil)
    source_rows = district_rows or state_rows
    best_by_crop: dict[str, KnowledgeCropRow] = {}

    for row in source_rows:
        crop_key = _normalize_text(row.crop)
        existing = best_by_crop.get(crop_key)
        if existing is None or row.yield_per_hectare > existing.yield_per_hectare:
            best_by_crop[crop_key] = row

    ranked = sorted(
        best_by_crop.values(),
        key=lambda row: recommendation_score(row.crop, soil, season, location, row.yield_per_hectare),
        reverse=True,
    )[:top_n]

    recommendations: list[dict[str, Any]] = []
    for index, row in enumerate(ranked, start=1):
        recommendations.append(
            {
                "rank": index,
                "crop": row.crop,
                "compatibility_score": recommendation_score(row.crop, soil, season, location, row.yield_per_hectare),
                "source": "knowledge_base",
                "latest_year": row.year_end,
                "historical_production": row.production,
                "preferable_season": load_crop_catalog().get(_normalize_text(row.crop)).preferable_season
                if load_crop_catalog().get(_normalize_text(row.crop))
                else None,
                "preferable_soil": list(load_crop_catalog().get(_normalize_text(row.crop)).preferable_soils)
                if load_crop_catalog().get(_normalize_text(row.crop))
                else [],
                "sustainability_score": sustainability_score(row.crop, soil, season, location),
            }
        )
    return recommendations


def estimate_price(crop: str, state: str | None, district: str | None) -> tuple[float, str]:
    live_price = fetch_live_mandi_price(crop, state, district)
    if live_price is not None:
        return live_price, "live_api"

    normalized_crop = _normalize_text(crop)
    mandi_rows = load_mandi_rows()
    matches = [
        row for row in mandi_rows
        if _normalize_text(row.get("commodity", "")) == normalized_crop
    ]
    if district:
        district_matches = [
            row for row in matches
            if _normalize_text(row.get("district", "")) == district
            and _normalize_state(row.get("state", "")) == state
        ]
        if district_matches:
            avg = sum(float(row["modal_price"]) for row in district_matches) / len(district_matches)
            return round(avg, 2), "local_snapshot"
    if matches:
        avg = sum(float(row["modal_price"]) for row in matches) / len(matches)
        return round(avg, 2), "local_snapshot"
    return BASELINE_PRICES.get(normalized_crop, 1800.0), "baseline"


@lru_cache(maxsize=256)
def fetch_live_mandi_price(crop: str, state: str | None, district: str | None) -> float | None:
    api_key = os.getenv("DATA_GOV_API_KEY") or os.getenv("VARIETY_WISE_API_KEY")
    if not api_key:
        return None

    try:
        records = fetch_live_mandi_records(
            api_key=get_variety_wise_api_key(api_key),
            commodity=crop,
            state=state,
            district=district,
            limit=10,
        )
        district_prices = [
            float(row["modal_price"])
            for row in records
            if row.get("modal_price")
            and (district is None or _normalize_text(row.get("district", "")) == district)
            and (state is None or _normalize_state(row.get("state", "")) == state)
        ]
        if district_prices:
            return round(sum(district_prices) / len(district_prices), 2)

        prices = [float(row["modal_price"]) for row in records if row.get("modal_price")]
        if prices:
            return round(sum(prices) / len(prices), 2)
    except Exception:
        return None

    return None


def fetch_live_mandi_records(
    api_key: str,
    commodity: str,
    state: str | None,
    district: str | None,
    limit: int = 10,
) -> list[dict[str, Any]]:
    params = {
        "api-key": api_key,
        "format": "json",
        "limit": str(limit),
        "filters[commodity]": commodity,
    }
    if district:
        params["filters[district]"] = district.title()
    if state:
        params["filters[state]"] = state.title()

    url = f"{MANDI_API_BASE_URL}?{urllib.parse.urlencode(params)}"
    request = urllib.request.Request(
        url,
        headers={
            "User-Agent": "AnnadataAI/1.0"
        },
    )
    with urllib.request.urlopen(request, timeout=40) as response:
        payload = json.loads(response.read().decode("utf-8"))
    return payload.get("records", [])


def estimate_yield(crop: str, location: str, season: str) -> float:
    district_rows, state_rows, state, district = district_and_state_rows(location, season)
    normalized_crop = _normalize_text(crop)
    exact = [
        row for row in district_rows
        if _normalize_text(row.crop) == normalized_crop
    ]
    if exact:
        return round(sum(row.yield_per_hectare for row in exact) / len(exact), 2)

    state_matches = [
        row for row in state_rows
        if _normalize_text(row.crop) == normalized_crop
    ]
    if state_matches:
        return round(sum(row.yield_per_hectare for row in state_matches) / len(state_matches), 2)

    profile = load_crop_soil_profiles().get(normalized_crop)
    if profile:
        return round(max(profile.avg_rainfall / 40.0, 2.0), 2)
    return 2.5


def estimate_production(crop: str, location: str, season: str) -> float:
    district_rows, state_rows, _, _ = district_and_state_rows(location, season)
    normalized_crop = _normalize_text(crop)
    exact = [row for row in district_rows if _normalize_text(row.crop) == normalized_crop]
    if exact:
        return round(sum(row.production for row in exact) / len(exact), 2)
    state_matches = [row for row in state_rows if _normalize_text(row.crop) == normalized_crop]
    if state_matches:
        return round(sum(row.production for row in state_matches) / len(state_matches), 2)
    return round(estimate_yield(crop, location, season), 2)


def seasonal_rainfall(location: str, season: str) -> float | None:
    state, district = resolve_location(location)
    months = season_months(season)
    matches = [
        row for row in load_rainfall_rows()
        if _normalize_state(row.get("State", "")) == state
        and (district is None or _normalize_text(row.get("District", "")) == district)
        and int(float(row.get("Month", 0))) in months
    ]
    if not matches:
        return None
    latest_year = max(int(float(row["Year"])) for row in matches)
    latest_rows = [row for row in matches if int(float(row["Year"])) == latest_year]
    return round(sum(float(row["Avg_rainfall"]) for row in latest_rows), 2)


def estimate_risk(crop: str, location: str, season: str) -> str:
    rainfall = seasonal_rainfall(location, season)
    crop_name = _normalize_text(crop)
    if rainfall is None:
        return "Medium"
    if crop_name in {"rice", "sugarcane"} and rainfall < 200:
        return "High"
    if crop_name in {"gram", "barley", "wheat", "rapeseed &mustard"} and rainfall < 80:
        return "Low"
    if rainfall < 100:
        return "Medium"
    return "Low"


def sustainability_score(crop: str, soil: str, season: str, location: str) -> float:
    normalized_crop = _normalize_text(crop)
    normalized_soil = _normalize_text(soil)
    catalog = load_crop_catalog().get(normalized_crop)
    rainfall = seasonal_rainfall(location, season)

    score = 55.0
    if catalog and catalog.preferable_season == _normalize_text(season):
        score += 20
    if catalog and normalized_soil in catalog.preferable_soils:
        score += 15
    if normalized_crop in {"rice", "sugarcane"} and rainfall is not None and rainfall < 200:
        score -= 20
    if normalized_crop in {"gram", "barley", "wheat"} and rainfall is not None and rainfall < 100:
        score += 8
    return round(max(0.0, min(score, 100.0)), 2)


def predict_from_knowledge_base(crop: str, location: str, season: str, soil: str) -> dict[str, Any]:
    state, district = resolve_location(location)
    price, price_source = estimate_price(crop, state, district)
    return {
        "price": price,
        "price_source": price_source,
        "yield": estimate_yield(crop, location, season),
        "production": estimate_production(crop, location, season),
        "risk": estimate_risk(crop, location, season),
        "sustainability_score": sustainability_score(crop, soil, season, location),
        "source": "knowledge_base",
    }
