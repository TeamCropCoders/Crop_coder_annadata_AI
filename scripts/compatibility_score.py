from __future__ import annotations

from dataclasses import dataclass
from typing import Dict, List, Tuple


@dataclass(frozen=True)
class SoilConditions:
    soil_type: str
    n_value: float
    p_value: float
    k_value: float
    ph_value: float
    rainfall_mm: float
    temperature_c: float
    humidity_pct: float


@dataclass(frozen=True)
class CropIdealProfile:
    crop: str
    soil_type: str
    ideal_n: float
    ideal_p: float
    ideal_k: float
    ideal_ph: float
    ideal_rainfall_mm: float
    ideal_temperature_c: float
    ideal_humidity_pct: float


# Replace this with a database or CSV-backed reference table in production.
CROP_IDEAL_PROFILES: Dict[str, CropIdealProfile] = {
    "Rice": CropIdealProfile("Rice", "Clayey", 90, 42, 43, 6.2, 1200, 28, 80),
    "Wheat": CropIdealProfile("Wheat", "Loamy", 80, 40, 40, 6.8, 600, 22, 60),
    "Barley": CropIdealProfile("Barley", "Loamy", 70, 35, 40, 7.0, 350, 20, 55),
    "Gram": CropIdealProfile("Gram", "Loamy", 45, 35, 35, 6.8, 300, 22, 50),
    "Maize": CropIdealProfile("Maize", "Loamy", 100, 48, 40, 6.5, 700, 25, 65),
    "Potato": CropIdealProfile("Potato", "Loamy", 120, 60, 180, 5.8, 500, 19, 75),
    "Rapeseed &Mustard": CropIdealProfile("Rapeseed &Mustard", "Loamy", 75, 40, 45, 6.5, 400, 21, 55),
    "Cotton": CropIdealProfile("Cotton", "Black", 110, 60, 50, 7.0, 650, 30, 55),
    "Sugarcane": CropIdealProfile("Sugarcane", "Loamy", 120, 50, 60, 6.7, 1100, 27, 75),
}


FEATURE_WEIGHTS = {
    "n_value": 0.20,
    "p_value": 0.15,
    "k_value": 0.15,
    "ph_value": 0.20,
    "rainfall_mm": 0.10,
    "temperature_c": 0.10,
    "humidity_pct": 0.10,
}


TOLERANCE_BASE = {
    "n_value": 20.0,
    "p_value": 15.0,
    "k_value": 15.0,
    "ph_value": 0.8,
    "rainfall_mm": 250.0,
    "temperature_c": 6.0,
    "humidity_pct": 20.0,
}


SOIL_COMPATIBILITY = {
    ("Loamy", "Sandy Loam"): 5.0,
    ("Sandy Loam", "Loamy"): 5.0,
    ("Clayey", "Loamy"): 8.0,
    ("Loamy", "Clayey"): 8.0,
}


def soil_type_penalty(actual_soil_type: str, ideal_soil_type: str) -> float:
    if actual_soil_type.lower() == ideal_soil_type.lower():
        return 0.0
    return SOIL_COMPATIBILITY.get((actual_soil_type, ideal_soil_type), 12.0)


def compute_compatibility_score(
    actual: SoilConditions,
    crop_profile: CropIdealProfile,
) -> Tuple[float, Dict[str, float]]:
    penalties: Dict[str, float] = {}

    comparisons = {
        "n_value": (actual.n_value, crop_profile.ideal_n),
        "p_value": (actual.p_value, crop_profile.ideal_p),
        "k_value": (actual.k_value, crop_profile.ideal_k),
        "ph_value": (actual.ph_value, crop_profile.ideal_ph),
        "rainfall_mm": (actual.rainfall_mm, crop_profile.ideal_rainfall_mm),
        "temperature_c": (actual.temperature_c, crop_profile.ideal_temperature_c),
        "humidity_pct": (actual.humidity_pct, crop_profile.ideal_humidity_pct),
    }

    total_penalty = soil_type_penalty(actual.soil_type, crop_profile.soil_type)
    penalties["soil_type"] = total_penalty

    for feature_name, (actual_value, ideal_value) in comparisons.items():
        deviation = abs(actual_value - ideal_value) / TOLERANCE_BASE[feature_name]
        weighted_penalty = min(deviation, 1.0) * FEATURE_WEIGHTS[feature_name] * 100
        penalties[feature_name] = round(weighted_penalty, 2)
        total_penalty += weighted_penalty

    score = max(0.0, 100.0 - total_penalty)
    return round(score, 2), penalties


def recommend_top_crops(
    actual: SoilConditions,
    top_n: int = 3,
) -> List[Dict[str, object]]:
    ranked: List[Dict[str, object]] = []

    for profile in CROP_IDEAL_PROFILES.values():
        score, penalties = compute_compatibility_score(actual, profile)
        limiting_factors = sorted(
            [item for item in penalties.items() if item[1] > 0],
            key=lambda item: item[1],
            reverse=True,
        )[:3]
        ranked.append(
            {
                "crop": profile.crop,
                "compatibility_score": score,
                "limiting_factors": [name for name, _ in limiting_factors] or ["none"],
            }
        )

    ranked.sort(key=lambda item: item["compatibility_score"], reverse=True)
    return ranked[:top_n]


if __name__ == "__main__":
    farmer_soil = SoilConditions(
        soil_type="Loamy",
        n_value=85,
        p_value=38,
        k_value=41,
        ph_value=6.7,
        rainfall_mm=640,
        temperature_c=24,
        humidity_pct=62,
    )

    selected_crop = CROP_IDEAL_PROFILES["Wheat"]
    score, penalty_breakdown = compute_compatibility_score(farmer_soil, selected_crop)

    print("Selected crop:", selected_crop.crop)
    print("Compatibility score:", score)
    print("Penalty breakdown:", penalty_breakdown)
    print("Top 3 recommendations:", recommend_top_crops(farmer_soil))
