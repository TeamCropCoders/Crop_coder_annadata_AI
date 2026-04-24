from __future__ import annotations

import json
import os
import sys
from pathlib import Path

import joblib
from fastapi.testclient import TestClient


sys.path.append(str(Path(__file__).resolve().parents[1]))


class DemoRecommendationModel:
    def recommend(self, features):
        return [
            {"crop": "Rice", "compatibility_score": 88.5},
            {"crop": "Maize", "compatibility_score": 81.0},
            {"crop": "Gram", "compatibility_score": 73.5},
        ]


class DemoPredictionModel:
    def predict_market(self, features):
        crop = features["crop"].lower()
        values = {
            "wheat": {"price": 2150, "yield": 3.2, "risk": "Medium"},
            "rice": {"price": 2550, "yield": 4.4, "risk": "High"},
            "maize": {"price": 1900, "yield": 4.8, "risk": "Low"},
            "gram": {"price": 5200, "yield": 1.5, "risk": "Low"},
        }
        return values.get(crop, {"price": 1800, "yield": 2.5, "risk": "Medium"})


def prepare_demo_models() -> Path:
    demo_dir = Path("backend/models/demo_artifacts")
    demo_dir.mkdir(parents=True, exist_ok=True)
    joblib.dump(DemoRecommendationModel(), demo_dir / "recommendation_model.pkl")
    joblib.dump(DemoPredictionModel(), demo_dir / "prediction_model.pkl")
    return demo_dir


if __name__ == "__main__":
    demo_model_dir = prepare_demo_models()
    os.environ["ANNADATA_MODEL_DIR"] = str(demo_model_dir)

    from backend.models.load_models import clear_model_cache
    from backend.main import app

    clear_model_cache()
    client = TestClient(app)
    response = client.post(
        "/api/analyze",
        json={
            "soil": "loamy",
            "location": "UP",
            "season": "kharif",
            "current_crop": "Wheat",
        },
    )

    print("Status:", response.status_code)
    print(json.dumps(response.json(), indent=2))
