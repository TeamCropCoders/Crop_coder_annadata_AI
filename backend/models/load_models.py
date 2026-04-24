from __future__ import annotations

import os
import pickle
from dataclasses import dataclass
from functools import lru_cache
from pathlib import Path
from typing import Any

import joblib


class ModelLoadError(RuntimeError):
    """Raised when a required pre-trained model cannot be loaded."""


@dataclass(frozen=True)
class ModelBundle:
    recommendation_model: Any
    prediction_model: Any


class DemoRecommendationModel:
    """UI-only demo model used when ANNADATA_DEMO_MODE=true."""

    def recommend(self, features: dict[str, Any]) -> list[dict[str, Any]]:
        soil = str(features.get("soil", "")).lower()
        season = str(features.get("season", "")).lower()

        if season == "rabi" or soil == "loamy":
            return [
                {"crop": "Wheat", "compatibility_score": 86.0},
                {"crop": "Potato", "compatibility_score": 81.5},
                {"crop": "Gram", "compatibility_score": 74.0},
            ]

        return [
            {"crop": "Rice", "compatibility_score": 88.5},
            {"crop": "Maize", "compatibility_score": 81.0},
            {"crop": "Gram", "compatibility_score": 73.5},
        ]


class DemoPredictionModel:
    """UI-only demo market model used when ANNADATA_DEMO_MODE=true."""

    def predict_market(self, features: dict[str, Any]) -> dict[str, Any]:
        crop = str(features.get("crop", "")).lower()
        values = {
            "wheat": {"price": 2150, "yield": 3.2, "risk": "Medium"},
            "rice": {"price": 2550, "yield": 4.4, "risk": "High"},
            "maize": {"price": 1900, "yield": 4.8, "risk": "Low"},
            "gram": {"price": 5200, "yield": 1.5, "risk": "Low"},
            "potato": {"price": 950, "yield": 23.0, "risk": "Medium"},
            "sugarcane": {"price": 360, "yield": 72.0, "risk": "High"},
        }
        return values.get(crop, {"price": 1800, "yield": 2.5, "risk": "Medium"})


def model_dir() -> Path:
    return Path(os.getenv("ANNADATA_MODEL_DIR", "backend/models/artifacts"))


def demo_mode_enabled() -> bool:
    return os.getenv("ANNADATA_DEMO_MODE", "").lower() in {"1", "true", "yes", "on"}


def load_pickle_model(path: Path) -> Any:
    if not path.exists():
        raise ModelLoadError(
            f"Missing required model file: {path}. Place the provided .pkl model here or set ANNADATA_MODEL_DIR."
        )

    try:
        return joblib.load(path)
    except Exception:
        with path.open("rb") as file:
            return pickle.load(file)


@lru_cache(maxsize=1)
def get_model_bundle() -> ModelBundle:
    if demo_mode_enabled():
        return ModelBundle(
            recommendation_model=DemoRecommendationModel(),
            prediction_model=DemoPredictionModel(),
        )

    directory = model_dir()
    recommendation_path = directory / "recommendation_model.pkl"
    prediction_path = directory / "prediction_model.pkl"

    return ModelBundle(
        recommendation_model=load_pickle_model(recommendation_path),
        prediction_model=load_pickle_model(prediction_path),
    )


def clear_model_cache() -> None:
    get_model_bundle.cache_clear()
