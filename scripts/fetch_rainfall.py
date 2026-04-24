from __future__ import annotations

import argparse
import csv
import json
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Dict, List, Optional

try:
    from scripts.data_gov_config import get_district_wise_api_key
except ModuleNotFoundError:
    from data_gov_config import get_district_wise_api_key


RAINFALL_RESOURCE_ID = "6c05cd1b-ed59-40c2-bc31-e314f39c6971"
RAINFALL_API_URL = f"https://api.data.gov.in/resource/{RAINFALL_RESOURCE_ID}"
DEFAULT_RAINFALL_SNAPSHOT = Path("data/raw/rainfall/district_rainfall.csv")


def fetch_rainfall_page(
    api_key: str,
    state: Optional[str],
    district: Optional[str],
    year: Optional[int],
    limit: int,
    offset: int,
) -> Dict[str, object]:
    params = {
        "api-key": api_key,
        "format": "json",
        "limit": str(limit),
        "offset": str(offset),
    }
    if state:
        params["filters[State]"] = state
    if district:
        params["filters[District]"] = district
    if year:
        params["filters[Year]"] = str(year)

    url = f"{RAINFALL_API_URL}?{urllib.parse.urlencode(params)}"
    with urllib.request.urlopen(url, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def fetch_rainfall_records(
    api_key: str,
    state: Optional[str],
    district: Optional[str],
    year: Optional[int],
    limit: int,
    max_pages: int,
) -> List[Dict[str, object]]:
    records: List[Dict[str, object]] = []
    for page in range(max_pages):
        payload = fetch_rainfall_page(
            api_key=api_key,
            state=state,
            district=district,
            year=year,
            limit=limit,
            offset=page * limit,
        )
        page_records = payload.get("records", [])
        if not page_records:
            break
        records.extend(page_records)
    return records


def read_snapshot(path: Path) -> List[Dict[str, object]]:
    if not path.exists():
        return []
    with path.open("r", newline="", encoding="utf-8") as file:
        return list(csv.DictReader(file))


def write_snapshot(path: Path, records: List[Dict[str, object]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = ["State", "District", "Date", "Year", "Month", "Avg_rainfall", "Agency_name"]
    with path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        for row in records:
            writer.writerow({field: row.get(field) for field in fieldnames})


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Fetch district-wise rainfall records from Data.gov.in."
    )
    parser.add_argument("--state", default="Uttar Pradesh")
    parser.add_argument("--district", default="Agra")
    parser.add_argument("--year", type=int)
    parser.add_argument("--limit", type=int, default=100)
    parser.add_argument("--max-pages", type=int, default=5)
    parser.add_argument("--api-key", default=None)
    parser.add_argument("--output", default=str(DEFAULT_RAINFALL_SNAPSHOT))
    args = parser.parse_args()

    output_path = Path(args.output)
    source = "live_api"
    try:
        records = fetch_rainfall_records(
            api_key=get_district_wise_api_key(args.api_key),
            state=args.state,
            district=args.district,
            year=args.year,
            limit=args.limit,
            max_pages=args.max_pages,
        )
    except Exception as exc:
        records = read_snapshot(output_path)
        source = "stored_snapshot"
        if not records:
            raise RuntimeError(
                f"Live rainfall API failed and no stored snapshot exists at {output_path}"
            ) from exc

    if not records and output_path.exists():
        records = read_snapshot(output_path)
        source = "stored_snapshot"

    write_snapshot(output_path, records)
    print(
        json.dumps(
            {
                "source": source,
                "record_count": len(records),
                "output": str(output_path),
            },
            indent=2,
        )
    )


if __name__ == "__main__":
    main()
