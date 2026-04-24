from __future__ import annotations

import csv
from collections import defaultdict
from pathlib import Path


INPUT_PATH = Path(r"C:\Users\shikh\Downloads\Crop_recommendation.csv")
OUTPUT_PATH = Path("data/reference/crop_soil_profiles.csv")


def canonical_crop(label: str) -> str:
    mapping = {
        "chickpea": "Gram",
        "mungbean": "Moong",
        "blackgram": "Urad",
        "pigeonpeas": "Arhar/Tur",
        "kidneybeans": "Rajma",
        "mothbeans": "Moth Beans",
    }
    text = label.strip().lower()
    return mapping.get(text, label.strip().title())


def main() -> None:
    profiles: dict[str, dict[str, float]] = defaultdict(
        lambda: {"count": 0, "n": 0.0, "p": 0.0, "k": 0.0, "temperature": 0.0, "humidity": 0.0, "ph": 0.0, "rainfall": 0.0}
    )

    with INPUT_PATH.open("r", newline="", encoding="utf-8") as file:
        reader = csv.DictReader(file)
        for row in reader:
            crop = canonical_crop(row["label"])
            profile = profiles[crop]
            profile["count"] += 1
            profile["n"] += float(row["N"])
            profile["p"] += float(row["P"])
            profile["k"] += float(row["K"])
            profile["temperature"] += float(row["temperature"])
            profile["humidity"] += float(row["humidity"])
            profile["ph"] += float(row["ph"])
            profile["rainfall"] += float(row["rainfall"])

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_PATH.open("w", newline="", encoding="utf-8") as file:
        fieldnames = [
            "crop",
            "sample_count",
            "avg_n",
            "avg_p",
            "avg_k",
            "avg_temperature",
            "avg_humidity",
            "avg_ph",
            "avg_rainfall",
        ]
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()

        for crop in sorted(profiles):
            profile = profiles[crop]
            count = profile["count"]
            writer.writerow(
                {
                    "crop": crop,
                    "sample_count": count,
                    "avg_n": round(profile["n"] / count, 2),
                    "avg_p": round(profile["p"] / count, 2),
                    "avg_k": round(profile["k"] / count, 2),
                    "avg_temperature": round(profile["temperature"] / count, 2),
                    "avg_humidity": round(profile["humidity"] / count, 2),
                    "avg_ph": round(profile["ph"] / count, 2),
                    "avg_rainfall": round(profile["rainfall"] / count, 2),
                }
            )

    print({"output": str(OUTPUT_PATH), "rows": len(profiles)})


if __name__ == "__main__":
    main()
