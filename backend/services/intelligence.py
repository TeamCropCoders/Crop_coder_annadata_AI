from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Iterable


@dataclass(frozen=True)
class CropPrediction:
    crop: str
    price: float
    yield_value: float
    risk: str

    @property
    def profit(self) -> float:
        return round(self.price * self.yield_value, 2)


def normalize_recommendation_output(raw: Any) -> list[dict[str, Any]]:
    if isinstance(raw, dict) and "recommended" in raw:
        raw = raw["recommended"]

    if isinstance(raw, list):
        recommendations = raw
    elif hasattr(raw, "tolist"):
        recommendations = raw.tolist()
    else:
        recommendations = list(raw)

    normalized: list[dict[str, Any]] = []
    for index, item in enumerate(recommendations[:3], start=1):
        if isinstance(item, dict):
            crop = item.get("crop") or item.get("label") or item.get("name")
            score = (
                item.get("compatibility_score")
                or item.get("score")
                or item.get("probability")
                or 0
            )
        elif isinstance(item, (tuple, list)) and len(item) >= 2:
            crop, score = item[0], item[1]
        else:
            crop, score = item, 0

        score_value = float(score)
        if 0 <= score_value <= 1:
            score_value *= 100

        normalized.append(
            {
                "rank": index,
                "crop": str(crop),
                "compatibility_score": round(score_value, 2),
            }
        )

    if not normalized:
        raise ValueError("Recommendation model returned no crops.")

    return normalized


def normalize_prediction_output(crop: str, raw: Any) -> CropPrediction:
    if hasattr(raw, "to_dict"):
        records = raw.to_dict(orient="records")
        raw = records[0] if records else {}
    elif hasattr(raw, "tolist"):
        raw = raw.tolist()

    if isinstance(raw, list):
        raw = raw[0] if raw else {}

    if isinstance(raw, dict):
        price = raw.get("price") or raw.get("predicted_price") or raw.get("modal_price")
        yield_value = raw.get("yield") or raw.get("predicted_yield") or raw.get("yield_value")
        risk = raw.get("risk") or raw.get("risk_level") or "Medium"
    elif isinstance(raw, (tuple, list)) and len(raw) >= 3:
        price, yield_value, risk = raw[0], raw[1], raw[2]
    else:
        raise ValueError(
            "Prediction model output must include price, yield, and risk."
        )

    return CropPrediction(
        crop=crop,
        price=round(float(price), 2),
        yield_value=round(float(yield_value), 2),
        risk=normalize_risk(risk),
    )


def normalize_risk(value: Any) -> str:
    if isinstance(value, (int, float)):
        if value < 0.34:
            return "Low"
        if value < 0.67:
            return "Medium"
        return "High"
    return str(value).strip().title()


def build_intelligence_response(
    current_crop: str,
    recommended: list[dict[str, Any]],
    predictions: Iterable[CropPrediction],
    soil: str,
    location: str,
    season: str,
) -> dict[str, Any]:
    unique_predictions = deduplicate_predictions(predictions)
    if not unique_predictions:
        raise ValueError("No crop predictions were generated.")

    best = max(unique_predictions, key=lambda item: item.profit)
    current = find_prediction(unique_predictions, current_crop)
    if current is None:
        current = unique_predictions[0]

    profit_increase = calculate_profit_increase(current.profit, best.profit)
    comparison = [
        {
            "crop": item.crop,
            "price": item.price,
            "yield": item.yield_value,
            "risk": item.risk,
            "expected_profit": item.profit,
            "is_current": item.crop.lower() == current_crop.lower(),
            "is_best": item.crop.lower() == best.crop.lower(),
        }
        for item in unique_predictions
    ]

    insight = build_insight_text(current.crop, best.crop, profit_increase)
    sustainability = build_sustainability_text(best.crop, soil, season, location)
    voice_text = (
        f"Namaste. Based on your soil, location and season, {best.crop} looks like the best suggestion. "
        f"It may improve expected profit by {profit_increase:.1f} percent compared with {current.crop}. "
        f"{sustainability}"
    )

    return {
        "recommended": enrich_recommendations(recommended, unique_predictions),
        "current_crop": {
            "crop": current.crop,
            "price": current.price,
            "yield": current.yield_value,
            "risk": current.risk,
            "expected_profit": current.profit,
        },
        "best_crop": best.crop,
        "insight": insight,
        "sustainability": sustainability,
        "voice_text": voice_text,
        "comparison": sorted(
            comparison,
            key=lambda item: item["expected_profit"],
            reverse=True,
        ),
    }


def deduplicate_predictions(predictions: Iterable[CropPrediction]) -> list[CropPrediction]:
    by_crop: dict[str, CropPrediction] = {}
    for prediction in predictions:
        by_crop[prediction.crop.lower()] = prediction
    return list(by_crop.values())


def find_prediction(
    predictions: Iterable[CropPrediction],
    crop: str,
) -> CropPrediction | None:
    for prediction in predictions:
        if prediction.crop.lower() == crop.lower():
            return prediction
    return None


def calculate_profit_increase(current_profit: float, best_profit: float) -> float:
    if current_profit <= 0:
        return 0.0
    return round(((best_profit - current_profit) / current_profit) * 100, 1)


def build_insight_text(current_crop: str, best_crop: str, increase_pct: float) -> str:
    if best_crop.lower() == current_crop.lower() or increase_pct <= 0:
        return f"Your crop {current_crop} is already competitive among the analyzed options."
    return (
        f"Switching from {current_crop} to {best_crop} may increase expected profit by "
        f"about {increase_pct:.1f}% under the current conditions."
    )


def build_sustainability_text(
    crop: str,
    soil: str,
    season: str,
    location: str,
) -> str:
    crop_name = crop.lower()
    soil_name = soil.lower()
    season_name = season.lower()

    if crop_name in {"rice", "paddy", "sugarcane"}:
        return (
            f"{crop} can need higher water. Please check local rainfall and irrigation before sowing in {location}."
        )
    if crop_name in {"gram", "chickpea", "moong", "urad", "arhar", "lentil"}:
        return f"{crop} is pulse-friendly and can help improve soil nitrogen over time."
    if crop_name in {"millet", "bajra", "jowar", "ragi"}:
        return f"{crop} is generally climate-resilient and suitable for lower-water conditions."
    if soil_name == "loamy" and season_name == "rabi":
        return f"{crop} is a practical Rabi option for loamy soil when nutrients are managed well."
    return f"{crop} looks suitable, but use a soil test report before final sowing."


def enrich_recommendations(
    recommendations: list[dict[str, Any]],
    predictions: list[CropPrediction],
) -> list[dict[str, Any]]:
    enriched: list[dict[str, Any]] = []
    for recommendation in recommendations:
        prediction = find_prediction(predictions, str(recommendation["crop"]))
        row = dict(recommendation)
        if prediction:
            row.update(
                {
                    "price": prediction.price,
                    "yield": prediction.yield_value,
                    "risk": prediction.risk,
                    "expected_profit": prediction.profit,
                }
            )
        enriched.append(row)
    return enriched
