# Model Backends

The backend now supports two model backends:

1. `code` (default)
2. `pickle`

## Default: Code-Visible Models

By default the API uses readable Python model classes:

- [backend/models/code_models.py](C:/Users/shikh/OneDrive/Desktop/Cropcoders/backend/models/code_models.py)

Set explicitly if needed:

```bash
set ANNADATA_MODEL_BACKEND=code
```

## Optional: `.pkl` Artifacts

If you still want to use pre-trained pickle artifacts, place them here:

```text
backend/models/artifacts/recommendation_model.pkl
backend/models/artifacts/prediction_model.pkl
```

Then switch the backend:

```bash
set ANNADATA_MODEL_BACKEND=pickle
set ANNADATA_MODEL_DIR=C:\path\to\model\folder
```
