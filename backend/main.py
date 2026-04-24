from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routes.analyze import router as analyze_router


app = FastAPI(
    title="AnnadataAI API",
    description="Crop recommendation and market intelligence API using pre-trained ML models.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze_router, prefix="/api", tags=["Analyze"])


@app.get("/")
def root() -> dict[str, str]:
    return {"app": "AnnadataAI", "status": "running"}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
