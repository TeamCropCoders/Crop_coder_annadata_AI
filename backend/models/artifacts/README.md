# Model Artifacts

Place the provided pre-trained model files here:

```text
backend/models/artifacts/recommendation_model.pkl
backend/models/artifacts/prediction_model.pkl
```

Do not add training code to this project. The FastAPI backend only loads these `.pkl` files and calls them for predictions.

You can also point the backend to another folder:

```bash
set ANNADATA_MODEL_DIR=C:\path\to\model\folder
```
