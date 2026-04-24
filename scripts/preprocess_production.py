from __future__ import annotations

import argparse
import re
from pathlib import Path
from typing import Dict, List

import pandas as pd


DEFAULT_INPUT = Path(
    r"C:\Users\shikh\Downloads\horizontal_crop_vertical_year_report (1).xls"
)
DEFAULT_OUTPUT = Path("data/clean/production_features.csv")


def remove_serial_prefix(value: object) -> str:
    text = str(value).strip()
    return re.sub(r"^\d+\.\s*", "", text)


def parse_year_range(value: object) -> Dict[str, int]:
    text = str(value).strip()
    matches = re.findall(r"\d{4}", text)
    if len(matches) >= 2:
        return {"year_start": int(matches[0]), "year_end": int(matches[1])}
    if len(matches) == 1:
        year = int(matches[0])
        return {"year_start": year, "year_end": year}
    return {"year_start": 0, "year_end": 0}


def normalize_metric_name(metric: str) -> str:
    metric = metric.lower()
    if "area" in metric:
        return "area"
    if "production" in metric:
        return "production"
    if "yield" in metric:
        return "yield"
    return metric


def normalize_production_table(input_path: Path) -> pd.DataFrame:
    wide_df = pd.read_html(input_path, header=[0, 1, 2])[0]
    id_columns = wide_df.columns[:3]

    records: List[Dict[str, object]] = []
    for _, row in wide_df.iterrows():
        state = remove_serial_prefix(row[id_columns[0]])
        district = remove_serial_prefix(row[id_columns[1]])
        year_info = parse_year_range(row[id_columns[2]])

        crop_measurements: Dict[tuple[str, str], Dict[str, object]] = {}
        for crop, season, metric in wide_df.columns[3:]:
            metric_key = normalize_metric_name(str(metric))
            crop_key = (str(crop).strip(), str(season).strip())
            crop_measurements.setdefault(crop_key, {})[metric_key] = row[(crop, season, metric)]

        for (crop, season), values in crop_measurements.items():
            area = pd.to_numeric(values.get("area"), errors="coerce")
            production = pd.to_numeric(values.get("production"), errors="coerce")
            yield_value = pd.to_numeric(values.get("yield"), errors="coerce")

            if pd.isna(area) and pd.isna(production) and pd.isna(yield_value):
                continue

            records.append(
                {
                    "state": state,
                    "district": district,
                    "crop": crop,
                    "season": season,
                    "year_start": year_info["year_start"],
                    "year_end": year_info["year_end"],
                    "area_hectare": None if pd.isna(area) else float(area),
                    "production": None if pd.isna(production) else float(production),
                    "yield_per_hectare": None
                    if pd.isna(yield_value)
                    else float(yield_value),
                    "production_unit": "bales" if crop.lower().startswith("cotton") else "tonnes",
                    "yield_unit": "bales/hectare"
                    if crop.lower().startswith("cotton")
                    else "tonnes/hectare",
                }
            )

    long_df = pd.DataFrame(records)
    long_df = long_df.sort_values(
        ["state", "district", "crop", "season", "year_end"],
        kind="stable",
    ).reset_index(drop=True)
    return long_df


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Normalize wide crop production XLS/HTML report into model-ready rows."
    )
    parser.add_argument("--input", default=str(DEFAULT_INPUT))
    parser.add_argument("--output", default=str(DEFAULT_OUTPUT))
    args = parser.parse_args()

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    long_df = normalize_production_table(Path(args.input))
    long_df.to_csv(output_path, index=False)

    latest = (
        long_df.dropna(subset=["yield_per_hectare"])
        .sort_values("year_end")
        .groupby(["state", "district", "crop", "season"], as_index=False)
        .tail(1)
    )
    latest_output = output_path.with_name("latest_yield_features.csv")
    latest.to_csv(latest_output, index=False)

    print(
        {
            "rows": len(long_df),
            "latest_rows": len(latest),
            "output": str(output_path),
            "latest_output": str(latest_output),
        }
    )


if __name__ == "__main__":
    main()
