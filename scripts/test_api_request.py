from __future__ import annotations

import json
import sys
from pathlib import Path

from fastapi.testclient import TestClient


sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.main import app


if __name__ == "__main__":
    client = TestClient(app)
    response = client.post(
        "/advisory",
        json={
            "state": "Uttar Pradesh",
            "district": "Agra",
            "season": "Rabi",
            "soil_type": "Loamy",
            "crop": "Potato",
            "area_hectare": 1.0,
        },
    )
    print("Status:", response.status_code)
    print(json.dumps(response.json(), indent=2))
