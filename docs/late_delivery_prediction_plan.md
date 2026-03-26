# 🚚 Late Delivery Prediction — Project Plan

## 📌 Tổng quan project

| Thông tin | Chi tiết |
|---|---|
| **Tên project** | Late Delivery Risk Prediction |
| **Dataset** | DataCo Smart Supply Chain (Kaggle) |
| **Nhóm** | 4 người, tất cả Python cơ bản |
| **Thời gian** | 3 buổi tối (~3–4 tiếng/buổi) |
| **Mục tiêu** | EDA + ML Model + FastAPI Backend + Next.js Frontend |
| **Reference** | [PolinaBurova GitHub](https://github.com/PolinaBurova/Predicting-Delivery-Delays-in-Supply-Chain) |

---

## 🎯 Mục tiêu business

> Dự đoán **trước** khi đơn hàng được giao liệu nó có trễ không → logistics team chủ động can thiệp thay vì xử lý sau khi sự cố đã xảy ra.

**Target variable:** `Late_delivery_risk` (0 = On Time, 1 = Late)

---

## 🗂️ Cấu trúc repo

```
late-delivery-prediction/
├── notebooks/
│   ├── 01_eda.ipynb               # Exploratory Data Analysis
│   ├── 02_preprocessing.ipynb     # Feature engineering + cleaning
│   └── 03_training.ipynb          # Train + evaluate + export model
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── prediction.py      # POST /predict route
│   │   ├── schemas/
│   │   │   └── prediction.py      # Pydantic input/output schemas
│   │   ├── services/
│   │   │   └── ml_service.py      # Load model + predict logic
│   │   └── main.py                # FastAPI app + CORS + router mount
│   ├── ml/
│   │   ├── model.pkl              # Trained Random Forest model
│   │   ├── scaler.pkl             # StandardScaler
│   │   └── feature_names.json     # Ordered feature list
│   ├── tests/
│   │   └── test_prediction.py     # API endpoint tests
│   └── requirements.txt
├── data/
│   └── DataCoSupplyChainDataset.csv
├── docs/
│   └── api_contract.md            # Bàn giao cho Frontend
└── README.md
```

---

## 📊 Dataset

**Nguồn:** [DataCo Smart Supply Chain — Kaggle](https://www.kaggle.com/datasets/shashwatwork/dataco-smart-supply-chain-for-big-data-analysis)

**Kích thước:** ~180,000 rows, 50+ columns

### Các cột quan trọng sẽ dùng

| Nhóm | Cột | Mô tả |
|---|---|---|
| **Target** | `Late_delivery_risk` | 0/1 — nhãn cần predict |
| **Shipping** | `Shipping Mode` | First Class, Same Day, Second Class, Standard |
| **Thời gian** | `Days for shipping (real)` | Số ngày giao thực tế |
| **Thời gian** | `Days for shipment (scheduled)` | Số ngày giao dự kiến |
| **Địa lý** | `Market` | LATAM, Europe, Pacific Asia, USCA, Africa |
| **Địa lý** | `Order Region` | Sub-region cụ thể hơn |
| **Sản phẩm** | `Category Name` | Danh mục sản phẩm |
| **Khách hàng** | `Customer Segment` | Consumer, Corporate, Home Office |
| **Thời gian** | `order date (DateOrders)` | Dùng để extract Month, Quarter |
| **Tài chính** | `Benefit per order` | Lợi nhuận mỗi đơn |

---

## 🗓️ Kế hoạch 3 ngày

---

### 📅 NGÀY 1 — EDA & Preprocessing

**Phụ trách:** P1 (bạn — backend lead) + P2

**Mục tiêu cuối ngày:**
- `notebooks/01_eda.ipynb` hoàn chỉnh
- `notebooks/02_preprocessing.ipynb` hoàn chỉnh
- `df_clean.csv` sẵn sàng để train

#### Bước 1.1 — Setup (30 phút)
```python
# Cài thư viện
pip install pandas numpy matplotlib seaborn scikit-learn xgboost fastapi uvicorn pickle5

# Load data
import pandas as pd
df = pd.read_csv('data/DataCoSupplyChainDataset.csv', encoding='cp1252')
print(df.shape)        # (180519, 53)
print(df.info())
print(df.isnull().sum())
```

#### Bước 1.2 — EDA (1.5 tiếng)
```python
# 1. Tỷ lệ Late vs On Time tổng thể
df['Late_delivery_risk'].value_counts(normalize=True)

# 2. Tỷ lệ trễ theo Shipping Mode
df.groupby('Shipping Mode')['Late_delivery_risk'].mean().sort_values()

# 3. Tỷ lệ trễ theo Market
df.groupby('Market')['Late_delivery_risk'].mean().sort_values()

# 4. Tỷ lệ trễ theo tháng
df['Month'] = pd.to_datetime(df['order date (DateOrders)']).dt.month
df.groupby('Month')['Late_delivery_risk'].mean().plot()

# 5. Correlation heatmap với numerical features
import seaborn as sns
sns.heatmap(df[numerical_cols].corr(), annot=True)
```

**Key charts cần có trong EDA:**
- Bar chart: Late rate theo Shipping Mode
- Bar chart: Late rate theo Market
- Line chart: Late rate theo tháng (seasonality)
- Heatmap: correlation matrix
- Boxplot: scheduled days vs real days theo late/on-time

#### Bước 1.3 — Preprocessing (1 tiếng)
```python
# Features dùng để train
FEATURES = [
    'Shipping Mode',           # categorical → encode
    'Days for shipment (scheduled)',  # numerical
    'Market',                  # categorical → encode
    'Order Region',            # categorical → encode
    'Category Name',           # categorical → encode
    'Customer Segment',        # categorical → encode
    'Month',                   # numerical (extract từ date)
    'Benefit per order',       # numerical
]

TARGET = 'Late_delivery_risk'

# Feature engineering
df['Month'] = pd.to_datetime(df['order date (DateOrders)']).dt.month
df['Days_Gap'] = df['Days for shipment (scheduled)'] - df['Days for shipping (real)']
df['High_Season'] = df['Month'].isin([10, 11, 12]).astype(int)

# Encode categoricals
from sklearn.preprocessing import LabelEncoder
cat_cols = ['Shipping Mode', 'Market', 'Order Region', 
            'Category Name', 'Customer Segment']
le = LabelEncoder()
for col in cat_cols:
    df[col + '_encoded'] = le.fit_transform(df[col].astype(str))

# ⚠️ QUAN TRỌNG: Lưu mapping để dùng lại trong API
import json
encoding_map = {}
for col in cat_cols:
    le.fit(df[col].astype(str))
    encoding_map[col] = dict(zip(le.classes_, le.transform(le.classes_)))

with open('backend/ml/encoding_map.json', 'w') as f:
    json.dump(encoding_map, f)

# Scale numerical features
from sklearn.preprocessing import StandardScaler
import pickle

scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

with open('backend/ml/scaler.pkl', 'wb') as f:
    pickle.dump(scaler, f)
```

---

### 📅 NGÀY 2 — Training + FastAPI Backend

**Phụ trách:** Bạn (P1) toàn bộ

**Mục tiêu cuối ngày:**
- `notebooks/03_training.ipynb` hoàn chỉnh
- `backend/ml/model.pkl` exported
- FastAPI chạy được tại `localhost:8000`
- Test được endpoint `/predict` qua Swagger UI

#### Bước 2.1 — Train Models (1 tiếng)
```python
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, roc_auc_score
import xgboost as xgb

X_train, X_test, y_train, y_test = train_test_split(
    X_scaled, y, test_size=0.2, random_state=42, stratify=y
)

# Model 1: Logistic Regression (baseline)
lr = LogisticRegression(max_iter=1000)
lr.fit(X_train, y_train)

# Model 2: Random Forest (final model)
rf = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
rf.fit(X_train, y_train)

# Model 3: XGBoost (bonus nếu có thời gian)
xgb_model = xgb.XGBClassifier(random_state=42, eval_metric='logloss')
xgb_model.fit(X_train, y_train)
```

#### Bước 2.2 — Evaluate + Threshold Tuning (45 phút)
```python
# ⚠️ QUAN TRỌNG: Tối ưu Recall thay vì Accuracy
# Lý do: Bỏ sót đơn trễ (false negative) nguy hiểm hơn cảnh báo nhầm

# Thử threshold 0.3 thay vì 0.5 mặc định
y_prob = rf.predict_proba(X_test)[:, 1]
y_pred_03 = (y_prob >= 0.3).astype(int)

print(classification_report(y_test, y_pred_03))
print(f"AUC-ROC: {roc_auc_score(y_test, y_prob):.4f}")

# So sánh 3 models
for name, model in [('LR', lr), ('RF', rf), ('XGB', xgb_model)]:
    prob = model.predict_proba(X_test)[:, 1]
    pred = (prob >= 0.3).astype(int)
    print(f"\n{name}:")
    print(classification_report(y_test, pred))
```

**Metrics cần đạt (theo PolinaBurova reference):**
- Accuracy: ~97%
- Recall: ~1.0 (không bỏ sót đơn trễ)
- AUC-ROC: > 0.95

#### Bước 2.3 — Export Model (15 phút)
```python
import pickle, json

# Export Random Forest (final model)
with open('backend/ml/model.pkl', 'wb') as f:
    pickle.dump(rf, f)

# Export feature names (thứ tự phải khớp với API input)
feature_names = [
    'shipping_mode_encoded',
    'scheduled_days',
    'market_encoded',
    'order_region_encoded',
    'category_encoded',
    'customer_segment_encoded',
    'month',
    'benefit_per_order',
    'days_gap',
    'high_season'
]
with open('backend/ml/feature_names.json', 'w') as f:
    json.dump(feature_names, f)

print("✅ Model exported successfully")
print(f"   Features: {len(feature_names)}")
print(f"   Model type: {type(rf).__name__}")
```

#### Bước 2.4 — Build FastAPI (1.5 tiếng)

**`backend/app/schemas/prediction.py`**
```python
from pydantic import BaseModel
from typing import Literal

class PredictionInput(BaseModel):
    shipping_mode: Literal["First Class", "Same Day", "Second Class", "Standard Class"]
    scheduled_days: int
    market: Literal["LATAM", "Europe", "Pacific Asia", "USCA", "Africa"]
    order_region: str
    category_name: str
    customer_segment: Literal["Consumer", "Corporate", "Home Office"]
    order_month: int          # 1–12
    benefit_per_order: float

    class Config:
        json_schema_extra = {
            "example": {
                "shipping_mode": "First Class",
                "scheduled_days": 4,
                "market": "LATAM",
                "order_region": "Central America",
                "category_name": "Cleats",
                "customer_segment": "Consumer",
                "order_month": 11,
                "benefit_per_order": 91.25
            }
        }

class PredictionOutput(BaseModel):
    prediction: int           # 0 hoặc 1
    risk_score: float         # 0.0 – 100.0
    label: str                # "On Time" hoặc "Late"
    risk_level: str           # "Low" / "Medium" / "High"
```

**`backend/app/services/ml_service.py`**
```python
import pickle
import json
import numpy as np
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Load artifacts 1 lần khi server start
with open(BASE_DIR / "ml/model.pkl", "rb") as f:
    model = pickle.load(f)

with open(BASE_DIR / "ml/scaler.pkl", "rb") as f:
    scaler = pickle.load(f)

with open(BASE_DIR / "ml/encoding_map.json", "r") as f:
    encoding_map = json.load(f)

THRESHOLD = 0.3  # Tối ưu Recall

def _encode(value: str, col: str) -> int:
    mapping = encoding_map.get(col, {})
    return mapping.get(value, 0)  # 0 nếu không tìm thấy

def predict(input) -> dict:
    # Feature engineering
    high_season = 1 if input.order_month in [10, 11, 12] else 0
    days_gap = input.scheduled_days - 3  # estimate real days = 3

    features = [
        _encode(input.shipping_mode, "Shipping Mode"),
        input.scheduled_days,
        _encode(input.market, "Market"),
        _encode(input.order_region, "Order Region"),
        _encode(input.category_name, "Category Name"),
        _encode(input.customer_segment, "Customer Segment"),
        input.order_month,
        input.benefit_per_order,
        days_gap,
        high_season
    ]

    features_scaled = scaler.transform([features])
    probability = model.predict_proba(features_scaled)[0][1]
    prediction = int(probability >= THRESHOLD)
    risk_score = round(probability * 100, 1)

    if risk_score >= 70:
        risk_level = "High"
    elif risk_score >= 40:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    return {
        "prediction": prediction,
        "risk_score": risk_score,
        "label": "Late" if prediction == 1 else "On Time",
        "risk_level": risk_level
    }
```

**`backend/app/api/prediction.py`**
```python
from fastapi import APIRouter
from app.schemas.prediction import PredictionInput, PredictionOutput
from app.services.ml_service import predict

router = APIRouter()

@router.post("/predict", response_model=PredictionOutput)
def predict_delivery(input: PredictionInput):
    """
    Dự đoán nguy cơ giao hàng trễ.
    - **prediction**: 0 = On Time, 1 = Late
    - **risk_score**: 0–100 (càng cao càng rủi ro)
    - **risk_level**: Low / Medium / High
    """
    return predict(input)
```

**`backend/app/main.py`**
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.prediction import router as prediction_router

app = FastAPI(
    title="Late Delivery Prediction API",
    description="Predict delivery delay risk for supply chain orders",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prediction_router, prefix="/api/v1", tags=["Prediction"])

@app.get("/")
def health_check():
    return {"status": "ok", "service": "Late Delivery Prediction API"}
```

**`backend/requirements.txt`**
```
fastapi==0.111.0
uvicorn==0.30.0
scikit-learn==1.4.2
xgboost==2.0.3
pandas==2.2.2
numpy==1.26.4
pydantic==2.7.1
python-multipart==0.0.9
```

#### Bước 2.5 — Test (15 phút)
```bash
# Chạy server
cd backend
uvicorn app.main:app --reload

# Mở browser → http://localhost:8000/docs
# Test thử endpoint /api/v1/predict với example input
```

---

### 📅 NGÀY 3 — Integration + Polish

**Phụ trách:** Bạn hỗ trợ anh Frontend

**Mục tiêu cuối ngày:**
- Frontend gọi được API thành công
- Demo chạy được end-to-end
- Slide trình bày xong

#### Bước 3.1 — Bàn giao API contract cho Frontend (30 phút đầu)

Tạo file `docs/api_contract.md`:

```markdown
## Endpoint

POST http://localhost:8000/api/v1/predict

## Input
{
  "shipping_mode": "First Class",        // "First Class" | "Same Day" | "Second Class" | "Standard Class"
  "scheduled_days": 4,                   // integer
  "market": "LATAM",                     // "LATAM" | "Europe" | "Pacific Asia" | "USCA" | "Africa"
  "order_region": "Central America",     // string
  "category_name": "Cleats",             // string
  "customer_segment": "Consumer",        // "Consumer" | "Corporate" | "Home Office"
  "order_month": 11,                     // 1–12
  "benefit_per_order": 91.25             // float
}

## Output
{
  "prediction": 1,          // 0 = On Time, 1 = Late
  "risk_score": 78.5,       // 0.0 – 100.0
  "label": "Late",          // "On Time" | "Late"
  "risk_level": "High"      // "Low" | "Medium" | "High"
}
```

#### Bước 3.2 — Fix bugs integration (1–2 tiếng)

**Lỗi thường gặp và cách fix:**

| Lỗi | Nguyên nhân | Fix |
|---|---|---|
| CORS error | Origin không match | Thêm frontend URL vào allow_origins |
| 422 Unprocessable Entity | Input sai format | Kiểm tra Pydantic schema |
| 500 Internal Server Error | Model chưa load | Kiểm tra đường dẫn pkl |
| Feature mismatch | Thứ tự features sai | Kiểm tra feature_names.json |

#### Bước 3.3 — Slide (1 tiếng cuối)

**Cấu trúc slide (5 slides):**
1. **Problem** — Logistics mất bao nhiêu tiền vì giao trễ
2. **Solution** — Late Delivery Risk Score
3. **Data & Approach** — Dataset + ML pipeline
4. **Results** — Accuracy, Recall, key findings
5. **Demo** — Live demo từ frontend

---

## 🧪 Test Cases cho Backend

```python
# Test 1: High risk case
{
  "shipping_mode": "First Class",
  "scheduled_days": 6,
  "market": "LATAM",
  "order_region": "Central America",
  "category_name": "Cleats",
  "customer_segment": "Consumer",
  "order_month": 11,
  "benefit_per_order": 50.0
}
# Expected: risk_level = "High", label = "Late"

# Test 2: Low risk case
{
  "shipping_mode": "Same Day",
  "scheduled_days": 1,
  "market": "USCA",
  "order_region": "US Northeast",
  "category_name": "Electronics",
  "customer_segment": "Corporate",
  "order_month": 3,
  "benefit_per_order": 200.0
}
# Expected: risk_level = "Low", label = "On Time"
```

---

## ⚠️ Những điều quan trọng KHÔNG được bỏ qua

```
1. encoding_map.json PHẢI được save khi preprocessing
   → Nếu không có, API sẽ encode sai toàn bộ

2. Thứ tự features trong API PHẢI khớp với lúc train
   → Sai thứ tự = model cho kết quả vô nghĩa

3. THRESHOLD = 0.3 (không phải 0.5)
   → Tối ưu Recall, tránh bỏ sót đơn trễ

4. Scaler PHẢI được fit trên train set, không phải toàn bộ data
   → Tránh data leakage
```

---

## 📈 Kết quả kỳ vọng

| Metric | Target |
|---|---|
| Accuracy | ~97% |
| Recall (Late class) | ~1.0 |
| Precision | ~0.97 |
| AUC-ROC | > 0.95 |

*Reference: PolinaBurova đạt 97.4% accuracy với cùng dataset*

---

## ⚙️ Config Môi Trường

### 1. Python version
```bash
# Dùng Python 3.10 hoặc 3.11
# KHÔNG dùng 3.12+ vì một số thư viện ML chưa support ổn
python --version
```

### 2. Virtual environment — bắt buộc
```bash
# Tạo env riêng cho project
python -m venv venv

# Activate
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate           # Windows

# Kiểm tra đang trong đúng env
which python
```

> ⚠️ Nếu không dùng venv → dễ conflict thư viện giữa các project, đặc biệt scikit-learn với xgboost

### 3. Vấn đề encoding dataset
```python
# DataCo dataset bị lỗi nếu đọc thẳng
# PHẢI thêm encoding='cp1252'
df = pd.read_csv('data/DataCoSupplyChainDataset.csv', encoding='cp1252')
```

> ⚠️ Quên cái này → lỗi ngay dòng đầu tiên, mất 15–20 phút debug không cần thiết

### 4. `.env` file cho FastAPI
```bash
# backend/.env
APP_ENV=development
MODEL_PATH=ml/model.pkl
SCALER_PATH=ml/scaler.pkl
ENCODING_MAP_PATH=ml/encoding_map.json
FRONTEND_URL=http://localhost:3000
```

```python
# Dùng trong main.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    frontend_url: str = "http://localhost:3000"
    model_path: str = "ml/model.pkl"

    class Config:
        env_file = ".env"

settings = Settings()
```

### 5. `.gitignore` — đừng commit nhầm
```
venv/
__pycache__/
*.pyc
.env
data/DataCoSupplyChainDataset.csv   # file lớn, không commit
backend/ml/model.pkl                 # commit hay không tùy nhóm
*.ipynb_checkpoints
```

> ⚠️ Dataset 180k rows nặng ~30MB — GitHub sẽ reject nếu commit thẳng

### 6. Jupyter kernel phải đúng env
```bash
# Sau khi activate venv, cài kernel
pip install ipykernel
python -m ipykernel install --user --name=venv --display-name "Project Env"

# Mở Jupyter → chọn kernel "Project Env"
# Tránh tình trạng notebook dùng Python khác với FastAPI
```

### 7. Chạy FastAPI đúng cách
```bash
cd backend
uvicorn app.main:app --reload --port 8000

# --reload: tự restart khi sửa code
# Swagger UI: http://localhost:8000/docs  ← test API tại đây
```

### 8. Đồng bộ môi trường cả nhóm
```bash
# Người setup xong chạy lệnh này
pip freeze > requirements.txt

# 3 người còn lại chạy lệnh này
pip install -r requirements.txt
```

> ⚠️ "Chạy được trên máy mình nhưng máy bạn kia báo lỗi" → Nguyên nhân 90%: không dùng chung venv + requirements.txt

---

## 🔗 Resources

- [Dataset — Kaggle](https://www.kaggle.com/datasets/shashwatwork/dataco-smart-supply-chain-for-big-data-analysis)
- [Reference Project](https://github.com/PolinaBurova/Predicting-Delivery-Delays-in-Supply-Chain)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Scikit-learn User Guide](https://scikit-learn.org/stable/user_guide.html)
