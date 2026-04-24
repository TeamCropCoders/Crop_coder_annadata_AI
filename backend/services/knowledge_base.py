from __future__ import annotations

import csv
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any


YIELD_DATA_PATH = Path("data/clean/latest_yield_features.csv")
MANDI_DATA_DIR = Path("data/raw/mandi_prices")
RAINFALL_DATA_DIR = Path("data/raw/rainfall")

STATE_ALIASES = {
    "up": "uttar pradesh",
    "uttar pradesh": "uttar pradesh",
}

SOIL_COMPATIBILITY = {
    "loamy": {
        "wheat": 92,
        "potato": 90,
        "gram": 84,
        "barley": 82,
        "rapeseed &mustard": 80,
        "maize": 78,
        "rice": 70,
        "sugarcane": 65,
    },
    "clayey": {
        "rice": 92,
        "wheat": 74,
        "sugarcane": 72,
        "gram": 60,
    },
    "sandy": {
        "gram": 78,
        "bajra": 82,
        "groundnut": 76,
        "wheat": 58,
    },
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


def recommendation_score(crop: str, soil: str, yield_value: float) -> float:
    normalized_crop = _normalize_text(crop)
    normalized_soil = _normalize_text(soil)
    soil_score = SOIL_COMPATIBILITY.get(normalized_soil, {}).get(normalized_crop, 60)
    yield_bonus = min(yield_value * 4, 25)
    return round(min(soil_score + yield_bonus, 99.0), 2)


def recommend_from_knowledge_base(soil: str, location: str, season: str, top_n: int = 3) -> list[dict[str, Any]]:
    district_rows, state_rows, _, _ = district_and_state_rows(location, season)
    source_rows = district_rows or state_rows
    best_by_crop: dict[str, KnowledgeCropRow] = {}

    for row in source_rows:
        crop_key = _normalize_text(row.crop)
        existing = best_by_crop.get(crop_key)
        if existing is None or row.yield_per_hectare > existing.yield_per_hectare:
            best_by_crop[crop_key] = row

    ranked = sorted(
        best_by_crop.values(),
        key=lambda row: recommendation_score(row.crop, soil, row.yield_per_hectare),
        reverse=True,
    )[:top_n]

    recommendations: list[dict[str, Any]] = []
    for index, row in enumerate(ranked, start=1):
        recommendations.append(
            {
                "rank": index,
                "crop": row.crop,
                "compatibility_score": recommendation_score(row.crop, soil, row.yield_per_hectare),
                "source": "knowledge_base",
                "latest_year": row.year_end,
            }
        )
    return recommendations


def estimate_price(crop: str, state: str | None, district: str | None) -> float:
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
            return round(avg, 2)
    if matches:
        avg = sum(float(row["modal_price"]) for row in matches) / len(matches)
        return round(avg, 2)
    return BASELINE_PRICES.get(normalized_crop, 1800.0)


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

    return 2.5


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


def predict_from_knowledge_base(crop: str, location: str, season: str) -> dict[str, Any]:
    state, district = resolve_location(location)
    return {
        "price": estimate_price(crop, state, district),
        "yield": estimate_yield(crop, location, season),
        "risk": estimate_risk(crop, location, season),
        "source": "knowledge_base",
    }
