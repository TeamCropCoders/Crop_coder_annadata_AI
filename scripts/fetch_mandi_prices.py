from __future__ import annotations

import argparse
import csv
import json
import statistics
import urllib.parse
import urllib.request
from datetime import datetime
from pathlib import Path
from typing import Dict, Iterable, List, Optional

try:
    from scripts.data_gov_config import get_variety_wise_api_key
except ModuleNotFoundError:
    from data_gov_config import get_variety_wise_api_key


API_RESOURCE_ID = "9ef84268-d588-465a-a308-a864a43d0070"
API_BASE_URL = f"https://api.data.gov.in/resource/{API_RESOURCE_ID}"


def parse_arrival_date(value: str) -> datetime:
    return datetime.strptime(value, "%d/%m/%Y")


def fetch_price_page(
    api_key: str,
    commodity: str,
    district: Optional[str],
    state: Optional[str],
    limit: int,
    offset: int,
) -> Dict[str, object]:
    params = {
        "api-key": api_key,
        "format": "json",
        "limit": str(limit),
        "offset": str(offset),
        "filters[commodity]": commodity,
    }

    if district:
        params["filters[district]"] = district
    if state:
        params["filters[state]"] = state

    url = f"{API_BASE_URL}?{urllib.parse.urlencode(params)}"
    with urllib.request.urlopen(url, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def fetch_price_records(
    api_key: str,
    commodity: str,
    district: Optional[str] = None,
    state: Optional[str] = None,
    limit: int = 10,
    max_pages: int = 5,
) -> List[Dict[str, object]]:
    records: List[Dict[str, object]] = []

    for page in range(max_pages):
        payload = fetch_price_page(
            api_key=api_key,
            commodity=commodity,
            district=district,
            state=state,
            limit=limit,
            offset=page * limit,
        )
        page_records = payload.get("records", [])
        if not page_records:
            break
        records.extend(page_records)

    return records


def latest_period_records(
    records: Iterable[Dict[str, object]],
    period: str,
) -> List[Dict[str, object]]:
    valid_records = [
        row for row in records if row.get("arrival_date") and row.get("modal_price")
    ]
    if not valid_records:
        return []

    latest_date = max(parse_arrival_date(str(row["arrival_date"])) for row in valid_records)

    if period == "monthly":
        return [
            row
            for row in valid_records
            if parse_arrival_date(str(row["arrival_date"])).year == latest_date.year
            and parse_arrival_date(str(row["arrival_date"])).month == latest_date.month
        ]

    if period == "yearly":
        return [
            row
            for row in valid_records
            if parse_arrival_date(str(row["arrival_date"])).year == latest_date.year
        ]

    return valid_records


def aggregate_prices(records: List[Dict[str, object]], period: str) -> Dict[str, object]:
    if not records:
        return {
            "period": period,
            "record_count": 0,
            "avg_min_price": None,
            "avg_max_price": None,
            "avg_modal_price": None,
            "latest_arrival_date": None,
        }

    min_prices = [float(row["min_price"]) for row in records if row.get("min_price")]
    max_prices = [float(row["max_price"]) for row in records if row.get("max_price")]
    modal_prices = [float(row["modal_price"]) for row in records if row.get("modal_price")]
    latest_date = max(parse_arrival_date(str(row["arrival_date"])) for row in records)

    return {
        "period": period,
        "record_count": len(records),
        "avg_min_price": round(statistics.mean(min_prices), 2) if min_prices else None,
        "avg_max_price": round(statistics.mean(max_prices), 2) if max_prices else None,
        "avg_modal_price": round(statistics.mean(modal_prices), 2) if modal_prices else None,
        "latest_arrival_date": latest_date.strftime("%Y-%m-%d"),
    }


def write_csv(path: Path, records: List[Dict[str, object]], summary: Dict[str, object]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = [
        "state",
        "district",
        "market",
        "commodity",
        "variety",
        "grade",
        "arrival_date",
        "min_price",
        "max_price",
        "modal_price",
        "period",
        "avg_modal_price",
    ]

    with path.open("w", newline="", encoding="utf-8") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        for row in records:
            output_row = {key: row.get(key) for key in fieldnames}
            output_row["period"] = summary["period"]
            output_row["avg_modal_price"] = summary["avg_modal_price"]
            writer.writerow(output_row)


def read_snapshot_csv(path: Path) -> List[Dict[str, object]]:
    if not path.exists():
        return []

    with path.open("r", newline="", encoding="utf-8") as file:
        return list(csv.DictReader(file))


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Fetch latest mandi prices from Data.gov.in and aggregate them."
    )
    parser.add_argument("--commodity", required=True, help="Commodity name, e.g. Wheat")
    parser.add_argument("--district", help="Optional district filter, e.g. Ahmedabad")
    parser.add_argument("--state", help="Optional state filter, e.g. Gujarat")
    parser.add_argument(
        "--period",
        choices=["monthly", "yearly"],
        default="monthly",
        help="Aggregate over latest available month or latest available year.",
    )
    parser.add_argument("--api-key", default=None)
    parser.add_argument("--limit", type=int, default=10)
    parser.add_argument("--max-pages", type=int, default=5)
    parser.add_argument(
        "--output",
        default="data/raw/mandi_prices/latest_mandi_prices.csv",
        help="CSV output path.",
    )
    args = parser.parse_args()
    output_path = Path(args.output)

    source = "live_api"
    try:
        records = fetch_price_records(
            api_key=get_variety_wise_api_key(args.api_key),
            commodity=args.commodity,
            district=args.district,
            state=args.state,
            limit=args.limit,
            max_pages=args.max_pages,
        )
    except Exception as exc:
        records = read_snapshot_csv(output_path)
        source = "stored_snapshot"
        if not records:
            raise RuntimeError(
                f"Live API failed and no stored snapshot exists at {output_path}"
            ) from exc

    if not records and output_path.exists():
        records = read_snapshot_csv(output_path)
        source = "stored_snapshot"

    period_records = latest_period_records(records, args.period)
    summary = aggregate_prices(period_records, args.period)
    summary["source"] = source

    write_csv(output_path, period_records, summary)

    print(json.dumps({"summary": summary, "output": args.output}, indent=2))


if __name__ == "__main__":
    main()
