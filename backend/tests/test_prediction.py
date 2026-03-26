import sys
from pathlib import Path

from fastapi.testclient import TestClient

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.main import app

client = TestClient(app)


HIGH_RISK_PAYLOAD = {
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

LOW_RISK_PAYLOAD = {
    "shipping_mode": "Same Day",
    "scheduled_days": 1,
    "market": "USCA",
    "order_region": "US Center",
    "category_name": "Camping & Hiking",
    "customer_segment": "Corporate",
    "department_name": "Outdoors",
    "order_month": 3,
    "order_day_of_week": 1,
    "benefit_per_order": 200.0,
    "discount_rate": 0.02,
}


def test_health_check() -> None:
    response = client.get("/")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"


def test_predict_high_risk() -> None:
    response = client.post("/api/v1/predict", json=HIGH_RISK_PAYLOAD)
    assert response.status_code == 200
    body = response.json()
    assert body["prediction"] == 1


def test_predict_low_risk() -> None:
    response = client.post("/api/v1/predict", json=LOW_RISK_PAYLOAD)
    assert response.status_code == 200
    body = response.json()
    assert body["risk_score"] < 70


def test_invalid_input() -> None:
    invalid_payload = {**HIGH_RISK_PAYLOAD, "shipping_mode": "Invalid"}
    response = client.post("/api/v1/predict", json=invalid_payload)
    assert response.status_code == 422


def test_model_info() -> None:
    response = client.get("/api/v1/model-info")
    assert response.status_code == 200
    body = response.json()
    assert "threshold" in body
    assert "model_type" in body
