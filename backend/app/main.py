from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic_settings import BaseSettings, SettingsConfigDict

from app.api.prediction import router as prediction_router
from app.services.ml_service import ml_service


class Settings(BaseSettings):
    frontend_url: str = "http://localhost:3000,http://127.0.0.1:3000"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def allow_origins(self) -> list[str]:
        return [origin.strip() for origin in self.frontend_url.split(",") if origin.strip()]


settings = Settings()

app = FastAPI(
    title="Late Delivery Prediction API",
    description="Predict late delivery risk from order-time features",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allow_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prediction_router, prefix="/api/v1", tags=["Prediction"])


@app.on_event("startup")
def on_startup() -> None:
    print("🚀 Late Delivery API started")


@app.get("/")
def health_check() -> dict:
    return {
        "status": "ok",
        "model_loaded": bool(getattr(ml_service, "is_loaded", False)),
    }
