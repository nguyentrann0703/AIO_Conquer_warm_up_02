# API Contract - Late Delivery Prediction

## Base URL

`http://localhost:8000`

## Endpoint: Predict

- Method: `POST`
- URL: `/api/v1/predict`
- Headers: `Content-Type: application/json`

### Request Body

```json
{
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
  "discount_rate": 0.1
}
```

### Enum Values

- `shipping_mode`:
  - `First Class`
  - `Same Day`
  - `Second Class`
  - `Standard Class`
- `market`:
  - `LATAM`
  - `Europe`
  - `Pacific Asia`
  - `USCA`
  - `Africa`
- `customer_segment`:
  - `Consumer`
  - `Corporate`
  - `Home Office`

### Response Body

```json
{
  "prediction": 1,
  "risk_score": 83.24,
  "label": "Late",
  "risk_level": "High",
  "threshold_used": 0.3
}
```

## Endpoint: Model Info

- Method: `GET`
- URL: `/api/v1/model-info`

Response example:

```json
{
  "model_type": "RandomForestClassifier",
  "threshold": 0.3,
  "n_features": 13
}
```

## cURL Example

```bash
curl -X POST http://localhost:8000/api/v1/predict \
  -H "Content-Type: application/json" \
  -d '{
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
    "discount_rate": 0.1
  }'
```

## Response Examples

### High Risk

```json
{
  "prediction": 1,
  "risk_score": 81.67,
  "label": "Late",
  "risk_level": "High",
  "threshold_used": 0.3
}
```

### Low Risk

```json
{
  "prediction": 0,
  "risk_score": 28.14,
  "label": "On Time",
  "risk_level": "Low",
  "threshold_used": 0.3
}
```
