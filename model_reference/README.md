# Model Reference

This folder documents how `AnnadataAI` uses the pre-trained models and what happens when the app falls back to the local knowledge base.

## Live Backend Files

- `backend/models/load_models.py`
- `backend/routes/analyze.py`
- `backend/services/intelligence.py`
- `backend/services/knowledge_base.py`

## Model Inputs

### Recommendation Model

Expected input fields:

```json
{
  "soil": "Loamy",
  "location": "Agra, Uttar Pradesh",
  "season": "Rabi"
}
```

Expected behavior:

- returns top 3 crops
- includes compatibility scores

Supported interfaces in backend:

- `recommend(features)`
- `predict_proba(features)` with `classes_`
- `predict(features)`

### Prediction Model

Expected input fields:

```json
{
  "crop": "Wheat",
  "location": "Agra, Uttar Pradesh",
  "season": "Rabi"
}
```

Expected behavior:

- returns `price`
- returns `yield`
- returns `risk`
- can optionally return `production`
- can optionally return `sustainability_score`

Supported interfaces in backend:

- `predict_market(features)`
- `predict(features)`

## Error Handling

If model files are missing, the backend does not stop the user flow. It switches to:

- local crop-production data
- local rainfall snapshots
- local mandi snapshots
- soil and crop reference tables

See:

- `error_catalog.json`
- `sample_predictions.json`

## Response Flow

1. User submits `soil`, `location`, `season`, `current_crop`
2. Backend tries to load:
   - `recommendation_model.pkl`
   - `prediction_model.pkl`
3. If models load:
   - run recommendation model
   - run prediction model for current crop and recommended crops
4. If models fail:
   - use `knowledge_base.py`
5. Intelligence layer computes:
   - expected profit
   - best crop
   - insight text
   - sustainability text
   - voice text

## Useful Local Check

Run:

```powershell
python model_reference/run_model_checks.py
```

This reports:

- whether the `.pkl` files exist
- whether demo mode is enabled
- which prediction path will be used

## Important Note

This project does not retrain models inside the app. It currently supports:

- readable Python models in [backend/models/code_models.py](C:/Users/shikh/OneDrive/Desktop/Cropcoders/backend/models/code_models.py)
- optional pre-trained `.pkl` files when `ANNADATA_MODEL_BACKEND=pickle`
- normalized outputs through the intelligence layer
- fallback knowledge-base behavior when needed
