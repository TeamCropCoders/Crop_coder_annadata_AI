from __future__ import annotations

import argparse
import json
import urllib.parse
import urllib.request
from pathlib import Path

try:
    from scripts.data_gov_config import get_crop_production_api_key
except ModuleNotFoundError:
    from data_gov_config import get_crop_production_api_key


DEFAULT_OUTPUT = Path("data/raw/crop_production/crop_production_api_snapshot.json")


def fetch_crop_production(resource_id: str, api_key: str, limit: int, offset: int) -> dict:
    params = {
        "api-key": api_key,
        "format": "json",
        "limit": str(limit),
        "offset": str(offset),
    }
    url = f"https://api.data.gov.in/resource/{resource_id}?{urllib.parse.urlencode(params)}"
    with urllib.request.urlopen(url, timeout=30) as response:
        return json.loads(response.read().decode("utf-8"))


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Fetch district crop production data from Data.gov.in when a queryable resource id is available."
    )
    parser.add_argument("--resource-id", required=True, help="Data.gov queryable resource UUID.")
    parser.add_argument("--api-key", default=None)
    parser.add_argument("--limit", type=int, default=10)
    parser.add_argument("--offset", type=int, default=0)
    parser.add_argument("--output", default=str(DEFAULT_OUTPUT))
    args = parser.parse_args()

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)

    payload = fetch_crop_production(
        resource_id=args.resource_id,
        api_key=get_crop_production_api_key(args.api_key),
        limit=args.limit,
        offset=args.offset,
    )
    output_path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(json.dumps({"status": payload.get("status"), "output": str(output_path)}, indent=2))


if __name__ == "__main__":
    main()
