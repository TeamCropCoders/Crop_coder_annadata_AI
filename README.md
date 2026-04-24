# Crop Coders: Integrated Market & Soil Intelligence Platform

## Overview
Crop Coders is a decision-support platform for farmers that combines:

- `Market Intelligence`: predicts crop prices and production trends from historical agricultural data.
- `Precision Advisory`: recommends the top 3 crops for current soil and weather conditions.
- `Compatibility Scoring`: compares a farmer's selected crop against actual soil conditions and returns a `0-100%` fit score.

This repository is structured for a hackathon-ready demo with a strong Data Engineering narrative: clean ingestion, normalized storage, reusable features, and API-first serving.

## Architecture Diagram Description
Use the following system blocks in your presentation diagram:

1. `Data Sources`
- Historical agricultural census data: `crop, year, season, area, production, yield`
- Soil intelligence data: `soil_type, N, P, K, pH, rainfall, temperature, humidity`
- Geo reference data: `district, state, latitude, longitude`
- User input stream from frontend/mobile app

2. `Ingestion Layer`
- Batch ingestion for historical market and production files using Python and pandas.
- Incremental ingestion for new yearly agricultural records.
- Real-time request capture for soil/weather inputs through FastAPI.

3. `Storage Layer`
- Raw zone: CSV/Parquet snapshots from source systems.
- Clean zone: standardized, validated datasets with normalized keys.
- Relational warehouse: dimension and fact tables for analytics and model training.
- Feature store: curated crop-soil-weather features for recommendation and compatibility scoring.

4. `Processing & Feature Engineering`
- Time-series feature generation for market model:
  - lag production
  - rolling averages
  - seasonality encodings
  - yield growth trends
- Soil feature engineering for advisory model:
  - nutrient balance ratios
  - pH deviation
  - rainfall adequacy
  - weather comfort bands
- Geo harmonization layer joins district-level market data with farm-level advisory data.

5. `ML Serving Layer`
- Model 1: price and production forecasting service.
- Model 2: crop recommendation and compatibility scoring service.
- FastAPI orchestrates inference requests and returns a unified JSON response.

6. `Frontend Dashboard`
- Top 3 crop recommendations
- Compatibility score for selected crop
- Predicted market price and production trend
- Regional insights by district/state

## Recommended GitHub Structure
```text
Cropcoders/
  README.md
  docs/
    technical_blueprint.md
  scripts/
    compatibility_score.py
    unified_etl.py
  sql/
    schema.sql
```

## Data Schema & Normalization
### Relational model

`dim_crop`
- `crop_id` (PK)
- `crop_name`
- `crop_category`

`dim_location`
- `location_id` (PK)
- `state_name`
- `district_name`
- `latitude`
- `longitude`

`dim_season`
- `season_id` (PK)
- `season_name`

`dim_soil_profile`
- `soil_profile_id` (PK)
- `soil_type`
- `n_value`
- `p_value`
- `k_value`
- `ph_value`
- `rainfall_mm`
- `temperature_c`
- `humidity_pct`

`fact_market_history`
- `market_fact_id` (PK)
- `crop_id` (FK)
- `location_id` (FK)
- `season_id` (FK)
- `year`
- `area_hectare`
- `production_tonnes`
- `yield_tonne_per_hectare`
- `avg_market_price`

`fact_farm_observation`
- `farm_obs_id` (PK)
- `location_id` (FK)
- `soil_profile_id` (FK)
- `observation_ts`
- `source_type` (`sensor`, `manual`, `api`)

`ref_crop_ideal_profile`
- `crop_id` (FK)
- `ideal_soil_type`
- `ideal_n`
- `ideal_p`
- `ideal_k`
- `ideal_ph`
- `ideal_rainfall_mm`
- `ideal_temperature_c`
- `ideal_humidity_pct`
- `n_tolerance_pct`
- `p_tolerance_pct`
- `k_tolerance_pct`
- `ph_tolerance_pct`

### Flat-file layout
Use partitioned Parquet in a lake-style structure:

```text
data/raw/market/year=2024/state=Punjab/*.parquet
data/raw/soil/ingest_date=2026-04-23/*.parquet
data/clean/market/year=2024/*.parquet
data/clean/soil/soil_type=Loamy/*.parquet
data/features/market_features/model_date=2026-04-23/*.parquet
data/features/advisory_features/model_date=2026-04-23/*.parquet
```

### Normalization rules
- Standardize crop names into a single canonical vocabulary.
- Store seasons in a lookup table rather than repeated free text.
- Convert all area units to hectares and production to tonnes.
- Separate mutable observations from stable crop/location dimensions.
- Use district or lat/long as the common bridge between the two model domains.

## Compatibility Logic
The compatibility score should be rule-based and explainable.

Formula idea:

1. Compute percentage deviation between actual and ideal crop requirements.
2. Weight each factor by agronomic importance.
3. Penalize soil type mismatch with a fixed deduction.
4. Convert total variance into an inverse score:

`compatibility_score = max(0, 100 - weighted_total_penalty)`

This keeps the result interpretable for judges and farmers.

See [scripts/compatibility_score.py](C:/Users/shikh/OneDrive/Desktop/Cropcoders/scripts/compatibility_score.py) for a runnable version.

## Unified ETL
The ETL pattern is:

1. Clean market history data.
2. Clean soil profile and live farm input data.
3. Map both datasets with a common geo key.
4. Aggregate latest soil conditions by district.
5. Merge market predictions and advisory features into one dashboard-ready dataset.

See [scripts/unified_etl.py](C:/Users/shikh/OneDrive/Desktop/Cropcoders/scripts/unified_etl.py) for a sample implementation.

## Price API Ingestion
Use the Data.gov.in mandi price API for current wholesale market prices.

- Source: `Current Daily Price of Various Commodities from Various Markets (Mandi)`
- Resource id: `9ef84268-d588-465a-a308-a864a43d0070`
- Fields: `state`, `district`, `market`, `commodity`, `variety`, `grade`, `arrival_date`, `min_price`, `max_price`, `modal_price`
- Price unit: INR per quintal

Example monthly fetch:

```bash
python scripts/fetch_mandi_prices.py --commodity Wheat --period monthly --output data/raw/mandi_prices/wheat_monthly.csv
```

Example yearly fetch:

```bash
python scripts/fetch_mandi_prices.py --commodity Wheat --period yearly --output data/raw/mandi_prices/wheat_yearly.csv
```

Add filters when the frontend sends district/state:

```bash
python scripts/fetch_mandi_prices.py --commodity Wheat --state Gujarat --district Ahmedabad --period monthly
```

The sample public API key is useful for demos but returns only a small number of records per request. For the hackathon demo, generate your own Data.gov.in API key if you need more rows.

Set your API key once before running API fetch scripts:

```bash
set DATA_GOV_API_KEY=your_data_gov_api_key_here
```

Or set source-specific keys:

```bash
set VARIETY_WISE_API_KEY=your_mandi_key
set DISTRICT_WISE_API_KEY=your_rainfall_key
set CROP_PRODUCTION_API_KEY=your_crop_production_key
```

## Rainfall API Ingestion
Fetch district-wise rainfall snapshots:

```bash
python scripts/fetch_rainfall.py --state "Uttar Pradesh" --district Agra --year 2025 --output data/raw/rainfall/agra_rainfall.csv
```

The FastAPI app reads `data/raw/rainfall/*.csv` and calculates season-level rainfall for compatibility scoring. If the rainfall API fails, it uses stored rainfall CSV snapshots.

## Crop Production API Refresh
When you have a queryable Data.gov resource UUID for crop production, you can refresh it with:

```bash
python scripts/fetch_crop_production_api.py --resource-id YOUR_RESOURCE_UUID
```

## 2026 Stack Recommendation
- Ingestion: `Python`, `pandas`, `PyArrow`, optional `Dagster` or `Airflow`
- Storage: `PostgreSQL` for normalized data, `Parquet` for analytics/features
- Feature Store: `Feast`-style logical design or lightweight Postgres feature tables
- Serving: `FastAPI`
- Model tracking: `MLflow`
- Visualization: `React` or a lightweight dashboard frontend

## Hackathon Pitch Angle
This project looks professional because it separates:

- reliable batch history ingestion
- real-time advisory serving
- explainable compatibility logic
- geo-linked analytics across district and farm layers

That makes the system feel like a deployable agri-data platform, not just two disconnected ML notebooks.

## FastAPI Demo
Install API dependencies:

```bash
pip install -r requirements.txt
```

Run the API:

```bash
uvicorn app.main:app --reload
```

Example request:

```bash
curl -X POST "http://127.0.0.1:8000/advisory" ^
  -H "Content-Type: application/json" ^
  -d "{\"state\":\"Uttar Pradesh\",\"district\":\"Agra\",\"season\":\"Rabi\",\"soil_type\":\"Loamy\",\"crop\":\"Potato\",\"area_hectare\":1}"
```

The endpoint returns market price, predicted yield, production estimate, compatibility score, and top crop recommendations.

## Production Data Preprocessing
The crop production `.xls` from Data.gov can be normalized into model-ready features:

```bash
python scripts/preprocess_production.py
```

Outputs:

- `data/clean/production_features.csv`
- `data/clean/latest_yield_features.csv`

These files convert the wide crop-year report into rows like:

```text
state, district, crop, season, year_start, year_end, area_hectare, production, yield_per_hectare
```

See [docs/data_sources.md](C:/Users/shikh/OneDrive/Desktop/Cropcoders/docs/data_sources.md) for raw data links for soil, weather, production, and mandi prices.

---

# AnnadataAI Full-Stack App

AnnadataAI is a FastAPI + React application that uses provided pre-trained ML models to recommend crops and compare expected profit.

Important: this app does not train models. It only loads:

```text
backend/models/artifacts/recommendation_model.pkl
backend/models/artifacts/prediction_model.pkl
```

## Folder Structure

```text
Cropcoders/
  backend/
    main.py
    routes/
      analyze.py
    models/
      load_models.py
      artifacts/
        recommendation_model.pkl
        prediction_model.pkl
    services/
      intelligence.py
  frontend/
    index.html
    package.json
    tailwind.config.js
    postcss.config.js
    src/
      App.jsx
      main.jsx
      styles.css
      components/
        Navbar.jsx
        InputForm.jsx
        RecommendationCard.jsx
        ComparisonTable.jsx
        ProfitChart.jsx
        InsightBox.jsx
        SustainabilityBox.jsx
        VoiceButton.jsx
```

## Backend Setup

Install dependencies:

```bash
python -m pip install -r requirements.txt
```

Place the two provided model files:

```text
backend/models/artifacts/recommendation_model.pkl
backend/models/artifacts/prediction_model.pkl
```

Run FastAPI:

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

To run the UI without the real ML files, enable demo mode first:

```bash
set ANNADATA_DEMO_MODE=true
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

Demo mode is only for viewing the app flow. For the final submission, place the real `.pkl` files and run with demo mode disabled.

API endpoint:

```text
POST http://localhost:8000/api/analyze
```

Example request:

```json
{
  "soil": "loamy",
  "location": "UP",
  "season": "kharif",
  "current_crop": "Wheat"
}
```

Example response shape:

```json
{
  "recommended": [],
  "current_crop": {},
  "best_crop": "Rice",
  "insight": "Switching from Wheat to Rice may increase expected profit by about 18.2%.",
  "sustainability": "Rice can need higher water. Please check local rainfall and irrigation before sowing in UP.",
  "voice_text": "Namaste. Based on your soil, location and season...",
  "comparison": []
}
```

## Model Output Contract

The recommendation model should return one of these:

```python
[{"crop": "Rice", "compatibility_score": 88.5}, ...]
```

or expose `predict_proba()` with `classes_`.

The prediction model should return one of these for each crop:

```python
{"price": 2400, "yield": 3.8, "risk": "Medium"}
```

or:

```python
[2400, 3.8, "Medium"]
```

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Open:

```text
http://localhost:5173
```

By default the frontend proxies API requests to the FastAPI backend on `127.0.0.1:8000`.

Optional frontend env:

```text
frontend/.env
VITE_API_BASE_URL=
```

## Voice Feature

The `VoiceButton` component uses:

```javascript
window.speechSynthesis
```

It speaks the `voice_text` returned by the backend.
