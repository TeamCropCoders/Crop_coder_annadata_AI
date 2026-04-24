from __future__ import annotations

import json
import sys
from pathlib import Path


sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.main import AdvisoryRequest, advisory


if __name__ == "__main__":
    demo_request = AdvisoryRequest(
        state="Uttar Pradesh",
        district="Agra",
        season="Rabi",
        soil_type="Loamy",
        crop="Potato",
        area_hectare=1.0,
    )
    response = advisory(demo_request)
    print(json.dumps(response.model_dump(), indent=2))
