from __future__ import annotations

from dataclasses import dataclass, asdict
from typing import Any


@dataclass(frozen=True)
class RecommendationInput:
    soil: str
    location: str
    season: str


@dataclass(frozen=True)
class PredictionInput:
    crop: str
    location: str
    season: str


@dataclass(frozen=True)
class RecommendationOutput:
    crop: str
    compatibility_score: float
    rank: int


@dataclass(frozen=True)
class PredictionOutput:
    crop: str
    price: float
    yield_value: float
    risk: str
    production: float | None = None
    sustainability_score: float | None = None


def recommendation_payload(soil: str, location: str, season: str) -> dict[str, Any]:
    return asdict(RecommendationInput(soil=soil, location=location, season=season))


def prediction_payload(crop: str, location: str, season: str) -> dict[str, Any]:
    return asdict(PredictionInput(crop=crop, location=location, season=season))


def supported_recommendation_interfaces() -> list[str]:
    return [
        "recommend(features)",
        "predict_proba(features) with classes_",
        "predict(features)",
    ]


def supported_prediction_interfaces() -> list[str]:
    return [
        "predict_market(features)",
        "predict(features)",
    ]
