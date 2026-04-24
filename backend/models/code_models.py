from __future__ import annotations

from typing import Any

from backend.services.knowledge_base import (
    predict_from_knowledge_base,
    recommend_from_knowledge_base,
)


class CodeRecommendationModel:
    """
    Readable Python implementation of the recommendation model contract.

    This keeps the same interface expected by the API layer, but the logic
    is transparent and inspectable in source code instead of a .pkl artifact.
    """

    def recommend(self, features: dict[str, Any]) -> list[dict[str, Any]]:
        return recommend_from_knowledge_base(
            soil=str(features.get("soil", "")),
            location=str(features.get("location", "")),
            season=str(features.get("season", "")),
            top_n=3,
        )


class CodePredictionModel:
    """
    Readable Python implementation of the prediction model contract.

    This mirrors the expected predict_market(...) interface and uses the
    knowledge-base estimation pipeline under the hood.
    """

    def predict_market(self, features: dict[str, Any]) -> dict[str, Any]:
        return predict_from_knowledge_base(
            crop=str(features.get("crop", "")),
            location=str(features.get("location", "")),
            season=str(features.get("season", "")),
            soil=str(features.get("soil", "Loamy")),
        )
