from __future__ import annotations

import json
import os
from pathlib import Path


def demo_mode_enabled() -> bool:
    return os.getenv("ANNADATA_DEMO_MODE", "").lower() in {"1", "true", "yes", "on"}


def model_dir() -> Path:
    return Path(os.getenv("ANNADATA_MODEL_DIR", "backend/models/artifacts"))


def main() -> None:
    directory = model_dir()
    recommendation_path = directory / "recommendation_model.pkl"
    prediction_path = directory / "prediction_model.pkl"

    result = {
        "demo_mode": demo_mode_enabled(),
        "model_dir": str(directory),
        "recommendation_model_exists": recommendation_path.exists(),
        "prediction_model_exists": prediction_path.exists(),
        "active_path": (
            "demo_models"
            if demo_mode_enabled()
            else "trained_models"
            if recommendation_path.exists() and prediction_path.exists()
            else "knowledge_base_fallback"
        ),
    }

    print(json.dumps(result, indent=2))


if __name__ == "__main__":
    main()
