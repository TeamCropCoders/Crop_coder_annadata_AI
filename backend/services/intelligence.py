from __future__ import annotations

from dataclasses import dataclass
from typing import Any, Iterable


SUPPORTED_LANGUAGES = {"en", "hi", "pa"}

CROP_LABELS = {
    "wheat": {"en": "Wheat", "hi": "गेहूं", "pa": "ਗੈਂਹੂੰ"},
    "rice": {"en": "Rice", "hi": "धान", "pa": "ਧਾਨ"},
    "maize": {"en": "Maize", "hi": "मक्का", "pa": "ਮੱਕੀ"},
    "gram": {"en": "Gram", "hi": "चना", "pa": "ਚਣਾ"},
    "barley": {"en": "Barley", "hi": "जौ", "pa": "ਜੌ"},
    "rapeseed &mustard": {"en": "Rapeseed & Mustard", "hi": "सरसों", "pa": "ਸਰੋਂ"},
    "sugarcane": {"en": "Sugarcane", "hi": "गन्ना", "pa": "ਗੰਨਾ"},
    "potato": {"en": "Potato", "hi": "आलू", "pa": "ਆਲੂ"},
    "mango": {"en": "Mango", "hi": "आम", "pa": "ਆਮ"},
    "banana": {"en": "Banana", "hi": "केला", "pa": "ਕੇਲਾ"},
    "cotton": {"en": "Cotton", "hi": "कपास", "pa": "ਕਪਾਹ"},
    "groundnut": {"en": "Groundnut", "hi": "मूंगफली", "pa": "ਮੂੰਗਫਲੀ"},
}

SOIL_LABELS = {
    "loamy": {"en": "Loamy", "hi": "दोमट", "pa": "ਦੋਮਟ"},
    "black": {"en": "Black", "hi": "काली", "pa": "ਕਾਲੀ"},
    "red": {"en": "Red", "hi": "लाल", "pa": "ਲਾਲ"},
    "alluvial": {"en": "Alluvial", "hi": "जलोढ़", "pa": "ਜਲੋੜ"},
    "laterite": {"en": "Laterite", "hi": "लेटराइट", "pa": "ਲੇਟਰਾਈਟ"},
}

SEASON_LABELS = {
    "rabi": {"en": "Rabi", "hi": "रबी", "pa": "ਰਬੀ"},
    "kharif": {"en": "Kharif", "hi": "खरीफ", "pa": "ਖਰੀਫ"},
}

RISK_LABELS = {
    "low": {"en": "Low", "hi": "कम", "pa": "ਘੱਟ"},
    "medium": {"en": "Medium", "hi": "मध्यम", "pa": "ਦਰਮਿਆਨਾ"},
    "high": {"en": "High", "hi": "उच्च", "pa": "ਉੱਚਾ"},
}


@dataclass(frozen=True)
class CropPrediction:
    crop: str
    price: float
    yield_value: float
    risk: str
    production: float = 0.0
    sustainability_score: float | None = None
    price_source: str | None = None

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
        production = (
            raw.get("production")
            or raw.get("predicted_production")
            or raw.get("production_value")
            or yield_value
        )
        sustainability_score = raw.get("sustainability_score")
        price_source = raw.get("price_source")
    elif isinstance(raw, (tuple, list)) and len(raw) >= 3:
        price, yield_value, risk = raw[0], raw[1], raw[2]
        production = raw[3] if len(raw) >= 4 else yield_value
        sustainability_score = raw[4] if len(raw) >= 5 else None
        price_source = raw[5] if len(raw) >= 6 else None
    else:
        raise ValueError("Prediction model output must include price, yield, and risk.")

    return CropPrediction(
        crop=crop,
        price=round(float(price), 2),
        yield_value=round(float(yield_value), 2),
        risk=normalize_risk(risk),
        production=round(float(production), 2),
        sustainability_score=None if sustainability_score is None else round(float(sustainability_score), 2),
        price_source=None if price_source is None else str(price_source),
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
    language: str = "en",
    data_source: str = "model",
) -> dict[str, Any]:
    active_language = resolve_language(language)
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
            "crop_label": translate_crop(item.crop, active_language),
            "price": item.price,
            "price_source": item.price_source,
            "yield": item.yield_value,
            "risk": item.risk,
            "risk_label": translate_risk(item.risk, active_language),
            "production": item.production,
            "sustainability_score": item.sustainability_score,
            "expected_profit": item.profit,
            "is_current": item.crop.lower() == current_crop.lower(),
            "is_best": item.crop.lower() == best.crop.lower(),
        }
        for item in unique_predictions
    ]

    insight = build_insight_text(current.crop, best.crop, profit_increase, active_language)
    sustainability = build_sustainability_text(best.crop, soil, season, location, active_language)
    confidence_score, confidence_label, confidence_reason = build_confidence_summary(
        recommended=recommended,
        predictions=unique_predictions,
        data_source=data_source,
        language=active_language,
    )
    voice_text = build_voice_text(
        current_crop=current.crop,
        best_crop=best.crop,
        profit_increase=profit_increase,
        sustainability=sustainability,
        language=active_language,
    )

    return {
        "recommended": enrich_recommendations(recommended, unique_predictions, active_language),
        "current_crop": {
            "crop": current.crop,
            "crop_label": translate_crop(current.crop, active_language),
            "price": current.price,
            "price_source": current.price_source,
            "yield": current.yield_value,
            "risk": current.risk,
            "risk_label": translate_risk(current.risk, active_language),
            "production": current.production,
            "sustainability_score": current.sustainability_score,
            "expected_profit": current.profit,
        },
        "best_crop": best.crop,
        "best_crop_label": translate_crop(best.crop, active_language),
        "insight": insight,
        "sustainability": sustainability,
        "voice_text": voice_text,
        "confidence_score": confidence_score,
        "confidence_label": confidence_label,
        "confidence_reason": confidence_reason,
        "comparison": sorted(comparison, key=lambda item: item["expected_profit"], reverse=True),
        "data_source": data_source,
    }


def deduplicate_predictions(predictions: Iterable[CropPrediction]) -> list[CropPrediction]:
    by_crop: dict[str, CropPrediction] = {}
    for prediction in predictions:
        by_crop[prediction.crop.lower()] = prediction
    return list(by_crop.values())


def find_prediction(predictions: Iterable[CropPrediction], crop: str) -> CropPrediction | None:
    for prediction in predictions:
        if prediction.crop.lower() == crop.lower():
            return prediction
    return None


def calculate_profit_increase(current_profit: float, best_profit: float) -> float:
    if current_profit <= 0:
        return 0.0
    return round(((best_profit - current_profit) / current_profit) * 100, 1)


def build_insight_text(current_crop: str, best_crop: str, increase_pct: float, language: str) -> str:
    current_label = translate_crop(current_crop, language)
    best_label = translate_crop(best_crop, language)

    if best_crop.lower() == current_crop.lower() or increase_pct <= 0:
        if language == "hi":
            return f"आपकी फसल {current_label} पहले से ही देखे गए विकल्पों में मजबूत स्थिति में है।"
        if language == "pa":
            return f"ਤੁਹਾਡੀ ਫਸਲ {current_label} ਪਹਿਲਾਂ ਹੀ ਵੇਖੇ ਗਏ ਵਿਕਲਪਾਂ ਵਿੱਚ ਮਜ਼ਬੂਤ ਸਥਿਤੀ ਵਿੱਚ ਹੈ।"
        return f"Your crop {current_label} is already competitive among the analyzed options."

    if language == "hi":
        return (
            f"मौजूदा परिस्थितियों में {current_label} से {best_label} पर जाने से अपेक्षित मुनाफा "
            f"लगभग {increase_pct:.1f}% बढ़ सकता है।"
        )
    if language == "pa":
        return (
            f"ਮੌਜੂਦਾ ਹਾਲਾਤਾਂ ਵਿੱਚ {current_label} ਤੋਂ {best_label} ਵੱਲ ਜਾਣ ਨਾਲ ਉਮੀਦਿਤ ਨਫਾ "
            f"ਲਗਭਗ {increase_pct:.1f}% ਵੱਧ ਸਕਦਾ ਹੈ।"
        )
    return (
        f"Switching from {current_label} to {best_label} may increase expected profit by "
        f"about {increase_pct:.1f}% under the current conditions."
    )


def build_sustainability_text(
    crop: str,
    soil: str,
    season: str,
    location: str,
    language: str,
) -> str:
    crop_name = crop.lower()
    soil_name = soil.lower()
    season_name = season.lower()
    crop_label = translate_crop(crop, language)
    soil_label = translate_soil(soil, language)
    season_label = translate_season(season, language)

    if crop_name in {"rice", "paddy", "sugarcane"}:
        if language == "hi":
            return f"{crop_label} को अधिक पानी चाहिए हो सकता है। बुवाई से पहले वर्षा और सिंचाई ज़रूर जांचें।"
        if language == "pa":
            return f"{crop_label} ਨੂੰ ਹੋਰ ਪਾਣੀ ਦੀ ਲੋੜ ਹੋ ਸਕਦੀ ਹੈ। ਬਿਜਾਈ ਤੋਂ ਪਹਿਲਾਂ ਮੀਂਹ ਅਤੇ ਸਿੰਚਾਈ ਜ਼ਰੂਰ ਚੈੱਕ ਕਰੋ।"
        return f"{crop_label} can need higher water. Please check local rainfall and irrigation before sowing in {location}."

    if crop_name in {"gram", "chickpea", "moong", "urad", "arhar", "lentil"}:
        if language == "hi":
            return f"{crop_label} दलहनी फसल है और समय के साथ मिट्टी में नाइट्रोजन सुधारने में मदद कर सकती है।"
        if language == "pa":
            return f"{crop_label} ਦਾਲਾਂ ਵਾਲੀ ਫਸਲ ਹੈ ਅਤੇ ਸਮੇਂ ਦੇ ਨਾਲ ਮਿੱਟੀ ਵਿੱਚ ਨਾਈਟ੍ਰੋਜਨ ਸੁਧਾਰਣ ਵਿੱਚ ਮਦਦ ਕਰ ਸਕਦੀ ਹੈ।"
        return f"{crop_label} is pulse-friendly and can help improve soil nitrogen over time."

    if crop_name in {"millet", "bajra", "jowar", "ragi"}:
        if language == "hi":
            return f"{crop_label} सामान्यतः कम पानी वाली परिस्थितियों में टिकाऊ मानी जाती है।"
        if language == "pa":
            return f"{crop_label} ਆਮ ਤੌਰ ਤੇ ਘੱਟ ਪਾਣੀ ਵਾਲੀਆਂ ਹਾਲਾਤਾਂ ਵਿੱਚ ਵੀ ਟਿਕਾਊ ਮੰਨੀ ਜਾਂਦੀ ਹੈ।"
        return f"{crop_label} is generally climate-resilient and suitable for lower-water conditions."

    if soil_name == "loamy" and season_name == "rabi":
        if language == "hi":
            return f"{soil_label} मिट्टी और {season_label} मौसम में पोषक तत्व संतुलित रखें तो {crop_label} एक अच्छा विकल्प है।"
        if language == "pa":
            return f"{soil_label} ਮਿੱਟੀ ਅਤੇ {season_label} ਮੌਸਮ ਵਿੱਚ ਪੋਸ਼ਕ ਤੱਤ ਠੀਕ ਰੱਖੇ ਜਾਣ ਤਾਂ {crop_label} ਚੰਗਾ ਵਿਕਲਪ ਹੈ।"
        return f"{crop_label} is a practical {season_label} option for {soil_label.lower()} soil when nutrients are managed well."

    if language == "hi":
        return f"{crop_label} उपयुक्त लग रही है, लेकिन अंतिम बुवाई से पहले मिट्टी जांच रिपोर्ट देख लें।"
    if language == "pa":
        return f"{crop_label} ਠੀਕ ਵਿਕਲਪ ਲੱਗਦੀ ਹੈ, ਪਰ ਅੰਤਿਮ ਬਿਜਾਈ ਤੋਂ ਪਹਿਲਾਂ ਮਿੱਟੀ ਦੀ ਜਾਂਚ ਰਿਪੋਰਟ ਦੇਖ ਲਵੋ।"
    return f"{crop_label} looks suitable, but use a soil test report before final sowing."


def build_voice_text(
    current_crop: str,
    best_crop: str,
    profit_increase: float,
    sustainability: str,
    language: str,
) -> str:
    current_label = translate_crop(current_crop, language)
    best_label = translate_crop(best_crop, language)

    if language == "hi":
        return (
            f"नमस्ते। आपकी मिट्टी, स्थान और मौसम के आधार पर {best_label} सबसे अच्छा सुझाव दिख रहा है। "
            f"यह {current_label} की तुलना में अपेक्षित मुनाफा लगभग {profit_increase:.1f} प्रतिशत बढ़ा सकता है। "
            f"{sustainability}"
        )
    if language == "pa":
        return (
            f"ਸਤ ਸ੍ਰੀ ਅਕਾਲ। ਤੁਹਾਡੀ ਮਿੱਟੀ, ਥਾਂ ਅਤੇ ਮੌਸਮ ਦੇ ਆਧਾਰ ਤੇ {best_label} ਸਭ ਤੋਂ ਵਧੀਆ ਸੁਝਾਅ ਲੱਗਦਾ ਹੈ। "
            f"ਇਹ {current_label} ਨਾਲੋਂ ਉਮੀਦਿਤ ਨਫਾ ਲਗਭਗ {profit_increase:.1f} ਪ੍ਰਤੀਸ਼ਤ ਵਧਾ ਸਕਦਾ ਹੈ। "
            f"{sustainability}"
        )
    return (
        f"Namaste. Based on your soil, location and season, {best_label} looks like the best suggestion. "
        f"It may improve expected profit by {profit_increase:.1f} percent compared with {current_label}. "
        f"{sustainability}"
    )


def build_confidence_summary(
    recommended: list[dict[str, Any]],
    predictions: list[CropPrediction],
    data_source: str,
    language: str,
) -> tuple[float, str, str]:
    score = 82.0
    reasons: list[str] = []

    ranked_scores = sorted(
        [float(item.get("compatibility_score", 0.0)) for item in recommended],
        reverse=True,
    )
    if len(ranked_scores) >= 2:
        score_gap = ranked_scores[0] - ranked_scores[1]
        if score_gap < 5:
            score -= 18
            reasons.append("tight_margin")
        elif score_gap < 10:
            score -= 10
            reasons.append("moderate_margin")
        else:
            reasons.append("clear_margin")

    profit_rows = sorted([item.profit for item in predictions], reverse=True)
    if len(profit_rows) >= 2 and profit_rows[0] > 0:
        profit_gap_pct = ((profit_rows[0] - profit_rows[1]) / profit_rows[0]) * 100
        if profit_gap_pct < 8:
            score -= 10
            reasons.append("profit_gap_small")
        elif profit_gap_pct > 20:
            score += 4
            reasons.append("profit_gap_clear")

    if data_source == "knowledge_base":
        score -= 15
        reasons.append("fallback_data")
    else:
        score += 4
        reasons.append("trained_model")

    score = round(max(35.0, min(score, 95.0)), 1)
    label = confidence_label(score, language)
    reason = confidence_reason(reasons, language)
    return score, label, reason


def confidence_label(score: float, language: str) -> str:
    if score >= 80:
        if language == "hi":
            return "उच्च भरोसा"
        if language == "pa":
            return "ਉੱਚ ਭਰੋਸਾ"
        return "High confidence"
    if score >= 60:
        if language == "hi":
            return "मध्यम भरोसा"
        if language == "pa":
            return "ਦਰਮਿਆਨਾ ਭਰੋਸਾ"
        return "Moderate confidence"
    if language == "hi":
        return "कम भरोसा"
    if language == "pa":
        return "ਘੱਟ ਭਰੋਸਾ"
    return "Low confidence"


def confidence_reason(reasons: list[str], language: str) -> str:
    if "fallback_data" in reasons:
        if language == "hi":
            return "यह सलाह स्थानीय नॉलेज बेस पर आधारित है, इसलिए भरोसा थोड़ा कम है।"
        if language == "pa":
            return "ਇਹ ਸਲਾਹ ਸਥਾਨਕ ਨੋਲੇਜ ਬੇਸ 'ਤੇ ਆਧਾਰਿਤ ਹੈ, ਇਸ ਲਈ ਭਰੋਸਾ ਕੁਝ ਘੱਟ ਹੈ।"
        return "This advice is based on the local knowledge base, so confidence is slightly lower."

    if "tight_margin" in reasons or "profit_gap_small" in reasons:
        if language == "hi":
            return "शीर्ष विकल्प एक-दूसरे के काफी करीब हैं, इसलिए अंतिम सुझाव में कुछ अनिश्चितता है।"
        if language == "pa":
            return "ਮੁੱਖ ਵਿਕਲਪ ਇਕ ਦੂਜੇ ਦੇ ਕਾਫੀ ਨੇੜੇ ਹਨ, ਇਸ ਲਈ ਅੰਤਿਮ ਸੁਝਾਅ ਵਿੱਚ ਕੁਝ ਅਣਸ਼ਚਿਤਤਾ ਹੈ।"
        return "The top options are close to each other, so there is some uncertainty in the final suggestion."

    if language == "hi":
        return "शीर्ष फसल बाकी विकल्पों से साफ़ आगे है, इसलिए सुझाव पर भरोसा बेहतर है।"
    if language == "pa":
        return "ਸਭ ਤੋਂ ਵਧੀਆ ਫਸਲ ਬਾਕੀ ਵਿਕਲਪਾਂ ਤੋਂ ਸਾਫ਼ ਅੱਗੇ ਹੈ, ਇਸ ਲਈ ਸੁਝਾਅ 'ਤੇ ਭਰੋਸਾ ਵਧੀਆ ਹੈ।"
    return "The top crop is clearly ahead of the other options, so confidence is stronger."


def enrich_recommendations(
    recommendations: list[dict[str, Any]],
    predictions: list[CropPrediction],
    language: str,
) -> list[dict[str, Any]]:
    enriched: list[dict[str, Any]] = []
    for recommendation in recommendations:
        prediction = find_prediction(predictions, str(recommendation["crop"]))
        row = dict(recommendation)
        row["crop_label"] = translate_crop(str(recommendation["crop"]), language)
        if prediction:
            row.update(
                {
                    "price": prediction.price,
                    "price_source": prediction.price_source,
                    "yield": prediction.yield_value,
                    "risk": prediction.risk,
                    "risk_label": translate_risk(prediction.risk, language),
                    "production": prediction.production,
                    "sustainability_score": prediction.sustainability_score,
                    "expected_profit": prediction.profit,
                }
            )
        enriched.append(row)
    return enriched


def resolve_language(language: str | None) -> str:
    candidate = (language or "en").strip().lower()
    return candidate if candidate in SUPPORTED_LANGUAGES else "en"


def translate_crop(crop: str, language: str) -> str:
    return translate_lookup(CROP_LABELS, crop, language)


def translate_soil(soil: str, language: str) -> str:
    return translate_lookup(SOIL_LABELS, soil, language)


def translate_season(season: str, language: str) -> str:
    return translate_lookup(SEASON_LABELS, season, language)


def translate_risk(risk: str, language: str) -> str:
    return translate_lookup(RISK_LABELS, risk, language)


def translate_lookup(table: dict[str, dict[str, str]], value: str, language: str) -> str:
    key = str(value).strip().lower()
    record = table.get(key)
    if not record:
        return str(value)
    return record.get(language) or record.get("en") or str(value)
