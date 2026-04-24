from __future__ import annotations

import os


DEFAULT_VARIETY_WISE_API_KEY = "579b464db66ec23bdd000001b2598073a11f4f387956c1b656989177"
DEFAULT_DISTRICT_WISE_API_KEY = "579b464db66ec23bdd000001b574818f384e420654c5b74b68897a28"
DEFAULT_CROP_PRODUCTION_API_KEY = "579b464db66ec23bdd000001a5895d42530f4ced7c930532a84c4e80"


def get_variety_wise_api_key(explicit_key: str | None = None) -> str:
    return (
        explicit_key
        or os.getenv("VARIETY_WISE_API_KEY")
        or os.getenv("DATA_GOV_API_KEY")
        or DEFAULT_VARIETY_WISE_API_KEY
    )


def get_district_wise_api_key(explicit_key: str | None = None) -> str:
    return (
        explicit_key
        or os.getenv("DISTRICT_WISE_API_KEY")
        or os.getenv("DATA_GOV_API_KEY")
        or DEFAULT_DISTRICT_WISE_API_KEY
    )


def get_crop_production_api_key(explicit_key: str | None = None) -> str:
    return (
        explicit_key
        or os.getenv("CROP_PRODUCTION_API_KEY")
        or os.getenv("DATA_GOV_API_KEY")
        or DEFAULT_CROP_PRODUCTION_API_KEY
    )
