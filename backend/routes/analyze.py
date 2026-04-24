from __future__ import annotations

from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from backend.models.load_models import ModelLoadError, get_model_bundle
from backend.services.knowledge_base import (
    predict_from_knowledge_base,
    recommend_from_knowledge_base,
)
from backend.services.intelligence import (
    CropPrediction,
    build_intelligence_response,
    normalize_prediction_output,
    normalize_recommendation_output,
)


router = APIRouter()


class AnalyzeRequest(BaseModel):
    soil: str = Field(..., examples=["loamy"])
    location: str = Field(..., examples=["UP"])
    season: str = Field(..., examples=["kharif"])
    current_crop: str = Field(..., examples=["Wheat"])
    language: str = Field("en", examples=["en", "hi", "pa"])


class AnalyzeResponse(BaseModel):
    recommended: list[dict[str, Any]]
    current_crop: dict[str, Any]
    best_crop: str
    insight: str
    sustainability: str
    voice_text: str
    confidence_score: float
    confidence_label: str
    confidence_reason: str
    comparison: list[dict[str, Any]]
    data_source: str | None = None


@router.get("/sources")
def sources() -> dict[str, Any]:
    return {
        "app_data_mode": "knowledge_base_with_optional_external_refresh",
        "sources": [
            {
                "name": "Mandi Prices API",
                "kind": "external_api",
                "catalog_link": "https://www.data.gov.in/catalog/current-daily-price-various-commodities-various-markets-mandi",
                "resource_link": "https://www.data.gov.in/resource/current-daily-price-various-commodities-various-markets-mandi",
                "api_base": "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070",
                "purpose": "Current daily mandi prices by commodity, market, district, and state.",
            },
            {
                "name": "District Rainfall API",
                "kind": "external_api",
                "catalog_link": "https://www.data.gov.in/resource/daily-district-wise-rainfall-data",
                "api_base": "https://api.data.gov.in/resource/6c05cd1b-ed59-40c2-bc31-e314f39c6971",
                "purpose": "Daily district-wise rainfall used for seasonal rainfall estimation.",
            },
            {
                "name": "District Crop Production Resource",
                "kind": "download_resource",
                "catalog_link": "https://www.data.gov.in/catalog/district-wise-season-wise-crop-production-statistics-0",
                "resource_link": "https://www.data.gov.in/resource/district-wise-season-wise-crop-production-statistics-1997",
                "purpose": "District, crop, season, area, production, and yield history used in the knowledge base.",
            },
            {
                "name": "Local Knowledge Base",
                "kind": "local_dataset",
                "paths": [
                    "data/clean/latest_yield_features.csv",
                    "data/raw/mandi_prices/*.csv",
                    "data/raw/rainfall/*.csv",
                ],
                "purpose": "Primary fallback data used when model files or external APIs are unavailable.",
            },
        ],
    }


@router.post("/analyze", response_model=AnalyzeResponse)
def analyze(request: AnalyzeRequest) -> dict[str, Any]:
    try:
        models = get_model_bundle()
        use_knowledge_base = False
    except ModelLoadError as exc:
        models = None
        use_knowledge_base = True

    recommendation_features = {
        "soil": request.soil,
        "location": request.location,
        "season": request.season,
    }
    prediction_base = {
        "location": request.location,
        "season": request.season,
    }

    try:
        if use_knowledge_base:
            recommended = recommend_from_knowledge_base(
                soil=request.soil,
                location=request.location,
                season=request.season,
                top_n=3,
            )
        else:
            raw_recommendations = predict_recommendations(
                models.recommendation_model,
                recommendation_features,
            )
            recommended = normalize_recommendation_output(raw_recommendations)

        all_predictions: list[CropPrediction] = []
        current_prediction = (
            predict_from_knowledge_base(
                crop=request.current_crop,
                location=request.location,
                season=request.season,
                soil=request.soil,
            )
            if use_knowledge_base
            else predict_crop_market(
                models.prediction_model,
                {**prediction_base, "crop": request.current_crop},
            )
        )
        all_predictions.append(
            normalize_prediction_output(request.current_crop, current_prediction)
        )

        for recommendation in recommended:
            crop = str(recommendation["crop"])
            prediction = (
                predict_from_knowledge_base(
                    crop=crop,
                    location=request.location,
                    season=request.season,
                    soil=request.soil,
                )
                if use_knowledge_base
                else predict_crop_market(
                    models.prediction_model,
                    {**prediction_base, "crop": crop},
                )
            )
            all_predictions.append(normalize_prediction_output(crop, prediction))

        response = build_intelligence_response(
            current_crop=request.current_crop,
            recommended=recommended,
            predictions=all_predictions,
            soil=request.soil,
            location=request.location,
            season=request.season,
            language=request.language,
            data_source="knowledge_base" if use_knowledge_base else "model",
        )
        return response
    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed while using the pre-trained models: {exc}",
        ) from exc


def predict_recommendations(model: Any, features: dict[str, Any]) -> Any:
    if hasattr(model, "recommend"):
        return model.recommend(features)

    if hasattr(model, "predict_proba") and hasattr(model, "classes_"):
        frame = to_model_frame(features)
        probabilities = model.predict_proba(frame)[0]
        ranked = sorted(
            zip(model.classes_, probabilities),
            key=lambda item: float(item[1]),
            reverse=True,
        )[:3]
        return [
            {"crop": str(crop), "compatibility_score": round(float(score) * 100, 2)}
            for crop, score in ranked
        ]

    if hasattr(model, "predict"):
        prediction = model.predict(to_model_frame(features))
        return prediction

    raise TypeError("recommendation_model.pkl must expose recommend(), predict_proba(), or predict().")


def predict_crop_market(model: Any, features: dict[str, Any]) -> Any:
    if hasattr(model, "predict_market"):
        return model.predict_market(features)

    if hasattr(model, "predict"):
        return model.predict(to_model_frame(features))

    raise TypeError("prediction_model.pkl must expose predict_market() or predict().")


def to_model_frame(features: dict[str, Any]) -> Any:
    try:
        import pandas as pd

        return pd.DataFrame([features])
    except Exception:
        return [features]
