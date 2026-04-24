from __future__ import annotations

from typing import Dict, List


def _to_title(value: str) -> str:
    return str(value).strip().title()


def _to_float(value: object) -> float:
    return float(value)


def standardize_market_data(market_rows: List[Dict[str, object]]) -> List[Dict[str, object]]:
    cleaned_rows: List[Dict[str, object]] = []

    for row in market_rows:
        cleaned_rows.append(
            {
                "District": _to_title(row["District"]),
                "Crop": _to_title(row["Crop"]),
                "Year": int(row["Year"]),
                "Season": _to_title(row["Season"]),
                "Area": _to_float(row["Area"]),
                "Production": _to_float(row["Production"]),
                "Yield": _to_float(row["Yield"]),
                "PredictedPrice": _to_float(row["PredictedPrice"]),
            }
        )

    return cleaned_rows


def standardize_soil_data(soil_rows: List[Dict[str, object]]) -> List[Dict[str, object]]:
    cleaned_rows: List[Dict[str, object]] = []

    for row in soil_rows:
        cleaned_rows.append(
            {
                "District": _to_title(row["District"]),
                "SoilType": _to_title(row["SoilType"]),
                "N": _to_float(row["N"]),
                "P": _to_float(row["P"]),
                "K": _to_float(row["K"]),
                "pH": _to_float(row["pH"]),
                "Rainfall": _to_float(row["Rainfall"]),
                "Temperature": _to_float(row["Temperature"]),
                "Humidity": _to_float(row["Humidity"]),
                "ObservationTimestamp": str(row["ObservationTimestamp"]),
            }
        )

    return cleaned_rows


def latest_soil_by_district(soil_rows: List[Dict[str, object]]) -> Dict[str, Dict[str, object]]:
    latest: Dict[str, Dict[str, object]] = {}

    for row in sorted(soil_rows, key=lambda item: item["ObservationTimestamp"]):
        latest[row["District"]] = row

    return latest


def build_dashboard_dataset(
    market_rows: List[Dict[str, object]],
    soil_rows: List[Dict[str, object]],
) -> List[Dict[str, object]]:
    market = standardize_market_data(market_rows)
    soil = standardize_soil_data(soil_rows)
    soil_lookup = latest_soil_by_district(soil)

    dashboard_rows: List[Dict[str, object]] = []
    for market_row in market:
        district_soil = soil_lookup.get(market_row["District"], {})
        predicted_price = market_row["PredictedPrice"]
        market_outlook = "Bullish" if predicted_price >= 2500 else "Stable"

        dashboard_rows.append(
            {
                "District": market_row["District"],
                "Crop": market_row["Crop"],
                "Year": market_row["Year"],
                "Season": market_row["Season"],
                "Area": market_row["Area"],
                "Production": market_row["Production"],
                "Yield": market_row["Yield"],
                "PredictedPrice": predicted_price,
                "MarketOutlook": market_outlook,
                "SoilType": district_soil.get("SoilType"),
                "N": district_soil.get("N"),
                "P": district_soil.get("P"),
                "K": district_soil.get("K"),
                "pH": district_soil.get("pH"),
                "Rainfall": district_soil.get("Rainfall"),
                "Temperature": district_soil.get("Temperature"),
                "Humidity": district_soil.get("Humidity"),
                "ProductionPerArea": round(
                    market_row["Production"] / market_row["Area"], 2
                ),
            }
        )

    return dashboard_rows


if __name__ == "__main__":
    market_history = [
        {
            "District": "Ludhiana",
            "Crop": "wheat",
            "Year": 2025,
            "Season": "rabi",
            "Area": 1200,
            "Production": 3600,
            "Yield": 3.0,
            "PredictedPrice": 2425,
        },
        {
            "District": "Ludhiana",
            "Crop": "maize",
            "Year": 2025,
            "Season": "kharif",
            "Area": 800,
            "Production": 2480,
            "Yield": 3.1,
            "PredictedPrice": 2680,
        },
    ]

    soil_observations = [
        {
            "District": "Ludhiana",
            "SoilType": "loamy",
            "N": 84,
            "P": 39,
            "K": 42,
            "pH": 6.7,
            "Rainfall": 620,
            "Temperature": 24,
            "Humidity": 61,
            "ObservationTimestamp": "2026-04-23T10:15:00",
        }
    ]

    dashboard_view = build_dashboard_dataset(market_history, soil_observations)
    print(dashboard_view)
