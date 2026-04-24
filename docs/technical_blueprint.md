# Technical Blueprint

## 1. Problem Framing
Crop Coders solves two linked farmer decisions:

- What crop is agronomically suitable right now?
- Which crop is commercially viable in the next market cycle?

The platform combines district-level market intelligence with farm-level soil and weather intelligence, then exposes both through a unified API.

## 2. End-to-End Architecture
### Source systems
- Agricultural census and crop production files
- Historical mandi or market price data
- Soil nutrient readings
- Weather API or historical climate feed
- Manual farmer inputs from frontend form

### Data flow
`Source Files/API -> Raw Storage -> Validation -> Normalized Warehouse -> Feature Store -> ML Models -> FastAPI -> Frontend`

### Key design decision
The two model domains operate at different granularities:

- Market model: typically `district/state/year/season/crop`
- Advisory model: typically `farm/field/current conditions`

The integration layer must therefore map farm observations to district or sub-district geo units using:

- district name standardization, or
- latitude/longitude to district polygon lookup

## 3. Architecture Diagram Description
If you draw this on slides, use six lanes:

### Lane A: Inputs
- Agricultural census CSV
- Market price CSV/API
- Soil profile CSV/API
- Weather API
- Farmer app form

### Lane B: Ingestion
- Batch loader for historical files
- Validation rules for nulls, ranges, units
- Real-time FastAPI endpoint for user soil/weather input

### Lane C: Storage
- Raw data lake for immutable snapshots
- Postgres warehouse for conformed entities
- Feature store tables for model-ready vectors

### Lane D: Processing
- Time-series transforms for market model
- Soil normalization and scoring transforms for advisory model
- Geo join service for district alignment

### Lane E: ML Services
- Forecasting model service
- Recommendation and compatibility engine

### Lane F: Farmer Dashboard
- Recommended crops
- Compatibility score
- Price trend chart
- Production outlook

## 4. Logical Data Model
### Core dimensions
- `dim_crop`
- `dim_location`
- `dim_season`
- `dim_date`

### Core facts
- `fact_market_history`
- `fact_market_prediction`
- `fact_soil_observation`
- `fact_crop_recommendation`

### Reference tables
- `ref_crop_ideal_profile`
- `ref_soil_type_mapping`
- `ref_crop_alias`

## 5. Normalization Strategy
### Why normalize
Agricultural datasets often contain:

- inconsistent crop names
- repeated season labels
- mixed units
- different spellings for districts

Normalization improves model training quality and prevents join failures.

### Recommended standards
- Crop names: uppercase title-normalized canonical value
- Season values: one of `Kharif`, `Rabi`, `Zaid`, `Whole Year`
- Area: hectares
- Production: tonnes
- Yield: tonnes per hectare
- Rainfall: mm
- Temperature: Celsius
- Humidity: percentage
- pH: numeric decimal with one or two precision points

## 6. Feature Engineering by Model
### Model 1: Market Intelligence
Input schema:
- `crop`
- `year`
- `season`
- `area`
- `production`
- `yield`

Derived features:
- previous year production
- 3-year rolling production average
- year-over-year yield growth
- crop-season interaction
- district trend index
- price lag features if price data exists

Suggested training grain:
`district + crop + season + year`

### Model 2: Precision Advisory
Input schema:
- `soil_type`
- `n_value`
- `p_value`
- `k_value`
- `ph_value`
- `rainfall_mm`
- `temperature_c`
- `humidity_pct`

Derived features:
- N:P:K ratio
- pH band class
- rainfall sufficiency score
- heat stress band
- humidity comfort range
- soil texture compatibility flag

Suggested serving grain:
`farm request + timestamp`

## 7. Compatibility Score Design
The compatibility engine should be deterministic and explainable.

### Reference-table approach
Create one row per crop in `ref_crop_ideal_profile`:

| crop | soil_type | N | P | K | pH | rainfall | temperature | humidity |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| Rice | Clayey | 90 | 42 | 43 | 6.2 | 1200 | 28 | 80 |
| Wheat | Loamy | 80 | 40 | 40 | 6.8 | 600 | 22 | 60 |
| Maize | Loamy | 100 | 48 | 40 | 6.5 | 700 | 25 | 65 |

### Scoring method
For each measurable attribute:

`relative_deviation = abs(actual - ideal) / tolerance_base`

Then multiply by a weight:

- N: `0.20`
- P: `0.15`
- K: `0.15`
- pH: `0.20`
- rainfall: `0.10`
- temperature: `0.10`
- humidity: `0.10`

Penalty:

`weighted_penalty = min(relative_deviation, 1.0) * weight * 100`

Soil type mismatch penalty:
- exact match: `0`
- near-compatible type: `5`
- incompatible type: `12`

Final score:

`score = max(0, 100 - total_penalty)`

### Explainability output
Return:
- overall score
- top limiting factors
- exact per-feature deviations

This will help your judges see that the recommendation is not a black box.

## 8. ETL Design
### Batch pipeline for market model
1. Read raw agricultural census files.
2. Validate schema and coerce types.
3. Standardize crop and season values.
4. Generate district-year-season grain.
5. Persist normalized records to warehouse.
6. Generate lag and rolling features.
7. Export training set to Parquet.

### Real-time pipeline for advisory model
1. Receive farm input from FastAPI.
2. Validate numeric ranges.
3. Lookup district via district name or lat/long.
4. Store current soil observation.
5. Join against `ref_crop_ideal_profile`.
6. Rank crops by compatibility score.
7. Pass top candidates to recommendation model or rule engine.

## 9. Data Quality Checks
- reject negative area, production, rainfall
- ensure pH is within a reasonable agronomic range
- deduplicate repeated district-year-season-crop rows
- detect outlier NPK readings
- log missing district mappings
- enforce canonical crop names before feature generation

## 10. Serving Contract
### Example frontend response
```json
{
  "location": {
    "state": "Punjab",
    "district": "Ludhiana"
  },
  "top_recommendations": [
    {"crop": "Wheat", "score": 91.4},
    {"crop": "Maize", "score": 84.8},
    {"crop": "Mustard", "score": 78.6}
  ],
  "selected_crop_analysis": {
    "crop": "Rice",
    "compatibility_score": 63.2,
    "limiting_factors": ["low rainfall", "soil type mismatch"]
  },
  "market_outlook": [
    {
      "crop": "Wheat",
      "predicted_price": 2425.5,
      "predicted_production": 138000.0,
      "trend": "up"
    }
  ]
}
```

## 11. GitHub README Talking Points
As Lead Data Engineer, your pitch should emphasize:

- end-to-end ingestion reliability
- normalized schemas for two different ML problems
- explainable compatibility logic
- geo-aware data integration
- FastAPI-ready serving layer

## 12. Demo Narrative
1. User enters soil and weather details.
2. Platform calculates the top 3 crop fits.
3. User selects a crop they want to grow.
4. Platform shows compatibility score and limiting nutrients.
5. Dashboard overlays market forecast for the same district.
6. Farmer chooses a crop that is both agronomically and commercially viable.
