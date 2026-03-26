from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class PredictionInput(BaseModel):
    shipping_mode: Literal["First Class", "Same Day", "Second Class", "Standard Class"]
    scheduled_days: int = Field(ge=1, le=30)
    market: Literal["LATAM", "Europe", "Pacific Asia", "USCA", "Africa"]
    order_region: str
    category_name: str
    customer_segment: Literal["Consumer", "Corporate", "Home Office"]
    department_name: str
    order_month: int = Field(ge=1, le=12)
    order_day_of_week: int = Field(ge=0, le=6)
    benefit_per_order: float
    discount_rate: float = Field(ge=0.0, le=1.0)

    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "shipping_mode": "First Class",
                "scheduled_days": 5,
                "market": "LATAM",
                "order_region": "Central America",
                "category_name": "Cleats",
                "customer_segment": "Consumer",
                "department_name": "Fan Shop",
                "order_month": 11,
                "order_day_of_week": 2,
                "benefit_per_order": 50.0,
                "discount_rate": 0.1,
            }
        }
    )


class PredictionOutput(BaseModel):
    prediction: int
    risk_score: float = Field(ge=0.0, le=100.0)
    label: str
    risk_level: str
    threshold_used: float
