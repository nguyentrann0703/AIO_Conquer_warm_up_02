from fastapi import APIRouter, HTTPException

from app.schemas.prediction import PredictionInput, PredictionOutput
from app.services.ml_service import ml_service

router = APIRouter()


@router.post("/predict", response_model=PredictionOutput)
def predict_delivery(payload: PredictionInput) -> PredictionOutput:
    try:
        if not ml_service.is_loaded:
            raise RuntimeError("Model is not loaded")
        result = ml_service.predict(payload)
        return PredictionOutput(**result)
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc


@router.get("/model-info")
def get_model_info() -> dict:
    try:
        if not ml_service.is_loaded:
            raise RuntimeError("Model is not loaded")

        cfg = ml_service.model_config
        return {
            "model_type": cfg.get("model_type"),
            "threshold": cfg.get("threshold"),
            "n_features": cfg.get("n_features"),
        }
    except RuntimeError as exc:
        raise HTTPException(status_code=500, detail=str(exc)) from exc
