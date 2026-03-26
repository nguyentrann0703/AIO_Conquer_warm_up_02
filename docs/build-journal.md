# Late Delivery Prediction - Build Journal

Tài liệu này được cập nhật theo từng prompt để:

- Theo dõi tiến độ build project
- Làm nguồn viết blog/report nhanh
- Ghi lại quyết định kỹ thuật và output quan trọng theo từng stage

---

## Project Snapshot

- Project: **Late Delivery Risk Prediction**
- Dataset chính: `dataset/DataCoSupplyChainDataset.csv`
- Quy mô dữ liệu: `180,519 rows x 53 columns`
- Target: `Late_delivery_risk` (0 = On Time, 1 = Late)
- Tỷ lệ class 1 (Late): ~`54.83%`

Leakage columns không dùng làm feature:

- `Days for shipping (real)`
- `Delivery Status`
- `shipping date (DateOrders)`
- `Late_delivery_risk` (target)

---

## Prompt Progress

### Prompt 0 - Context Setup

Status: `Completed`

Đã chốt các nguyên tắc:

- Chỉ dùng thông tin có tại thời điểm đặt hàng
- Threshold inference mục tiêu: `0.3`
- Save artifacts bắt buộc: `encoding_map.json`, `feature_names.json`, `scaler.pkl`, model
- Model chiến lược: baseline LR + final RF

---

### Prompt 1 - Project Scaffold

Status: `Completed`

Đã tạo cấu trúc:

- `notebooks/01_eda.ipynb`
- `notebooks/02_preprocessing.ipynb`
- `notebooks/03_training.ipynb`
- `backend/app/...`
- `backend/tests/test_prediction.py`
- `backend/requirements.txt`
- `backend/.env.example`
- `.gitignore`

Ghi chú:

- Đã chuẩn hóa lại đường dẫn dữ liệu thành `dataset/` (không còn tên thư mục có dấu cách cuối).

---

### Prompt 2 - EDA Notebook

Status: `Completed (Notebook drafted)`

File: `notebooks/01_eda.ipynb`

#### Nội dung EDA đã viết

1. Setup + load data (`cp1252`)
2. Target distribution
3. Shipping mode vs late risk
4. Market analysis + heatmap Category x Market
5. Time analysis (Month, Day of Week, peak season 10-12)
6. Scheduled days vs late risk (boxplot)
7. Correlation heatmap (allowed numerical features + target)
8. EDA summary (5 key findings)

#### EDA quick findings (từ dữ liệu đã đọc)

- Target tương đối cân bằng nhưng nghiêng lớp `Late` (~54.83%).
- Shipping mode có khác biệt tỷ lệ trễ rõ rệt.
- Market có mức late risk khác nhau (`LATAM`, `Europe`, `Pacific Asia`, `USCA`, `Africa`).
- Missing lớn ở:
  - `Product Description` (rỗng toàn bộ)
  - `Order Zipcode` (thiếu rất nhiều)
- Time features từ `order date (DateOrders)` có tiềm năng tín hiệu mùa vụ.

#### Issue đã gặp trong lúc chạy notebook

- `FileNotFoundError` do working directory notebook khác project root.
- Đã chỉnh cell load dữ liệu theo hướng path linh hoạt (`dataset/...` và `../dataset/...`).

---

### Prompt 3 - Preprocessing Notebook

Status: `Completed (Notebook drafted, ready to run)`

File: `notebooks/02_preprocessing.ipynb`

#### Pipeline preprocessing đã viết

1. Load data + chỉ giữ cột trong allowed list
2. Feature engineering từ `order date (DateOrders)`:
   - `Month`
   - `Day_of_Week`
   - `Is_Peak_Season`
   - `Quarter`
3. Handle missing:
   - Numerical -> median
   - Categorical -> `'Unknown'`
4. LabelEncoder cho categorical columns:
   - `Shipping Mode`
   - `Market`
   - `Order Region`
   - `Category Name`
   - `Customer Segment`
   - `Department Name`
5. Define `FINAL_FEATURES` (13 features, đúng thứ tự)
6. Split dữ liệu:
   - Train 70%
   - Validation 15%
   - Test 15%
   - `stratify=y`, `random_state=42`
7. Scale numerical bằng `StandardScaler`:
   - fit trên train only
   - transform val/test
8. Verify + save processed data/artifacts

#### Artifacts thiết kế để xuất ra

- `backend/ml/encoding_map.json`
- `backend/ml/feature_names.json`
- `backend/ml/scaler.pkl` (dùng `joblib.dump`)
- `dataset/processed/X_train.csv`
- `dataset/processed/X_val.csv`
- `dataset/processed/X_test.csv`
- `dataset/processed/y_train.csv`
- `dataset/processed/y_val.csv`
- `dataset/processed/y_test.csv`

#### Runtime notes

- Đã fix lỗi notebook serialization gây `SyntaxError: unterminated string literal`.
- Hiện code cell đã được compile-check ở mức cú pháp.
- Nếu IDE còn giữ bản cũ, cần reload notebook trước khi Run All.

---

### Prompt 4 - Training Notebook

Status: `Completed (Notebook drafted, ready to run)`

File: `notebooks/03_training.ipynb`

#### Nội dung training đã viết

1. Load `X_train/X_val/X_test`, `y_train/y_val/y_test` từ `dataset/processed/`
2. Verify feature order bằng `feature_names.json`
3. Train baseline `LogisticRegression` và evaluate trên validation với `threshold=0.3`
4. Train main model `RandomForestClassifier` (`class_weight='balanced'`) và evaluate validation
5. Threshold analysis (0.1 -> 0.9, step 0.05) cho RF với Precision/Recall/F1
6. Feature importance chart (Top 15, top 5 màu đỏ)
7. Final evaluation trên test set + bảng so sánh LR vs RF
8. Export:
   - `backend/ml/model.pkl`
   - `backend/ml/model_config.json`
9. Sanity check: load model + infer 1 sample

#### Key technical choices

- Threshold inference thống nhất: `0.3`
- Metric ưu tiên: Recall lớp `Late` + AUC-ROC
- Tách validation riêng để chọn/tuning trước khi nhìn test
- Export metadata đầy đủ để backend dùng đúng feature order

#### Runtime notes

- Notebook đã được compile-check toàn bộ code cell ở mức cú pháp.
- Notebook có path detection linh hoạt cho cả khi chạy từ root hoặc từ thư mục `notebooks/`.

---

### Prompt 4B - Kaggle Training Notebook

Status: `Completed (Notebook created for cloud training)`

File: `notebooks/04_kaggle_training.ipynb`

#### Mục tiêu

- Train trên Kaggle thay cho local khi máy yếu
- Export toàn bộ artifacts vào 1 file `ml_artifacts.zip` để tải về nhanh

#### Output từ notebook Kaggle

- `model.pkl`
- `scaler.pkl`
- `encoding_map.json`
- `feature_names.json`
- `model_config.json`
- `confusion_matrix.png`
- `feature_importance.png`
- `ml_artifacts.zip`

#### Khác biệt chính so với `03_training.ipynb`

- `03_training.ipynb`: dùng dữ liệu đã preprocess local (`dataset/processed/`) và có validation split riêng.
- `04_kaggle_training.ipynb`: tự preprocess trực tiếp từ dataset gốc trên Kaggle, split train/test 80/20 để chạy gọn nhẹ.
- `04` có cell zip artifacts để download 1 lần từ tab Output.

---

## Blog Notes (Draft)

Bạn có thể dùng khung này để viết blog theo từng phần:

1. Bài toán và ràng buộc leakage trong logistics ML
2. Khám phá dữ liệu: class distribution, shipping/market/time insights
3. Thiết kế preprocessing chuẩn production:
   - feature engineering có kiểm soát leakage
   - encoding map tái sử dụng backend
   - scaler fit đúng train set để tránh data leakage
4. Chuẩn bị artifacts cho model serving
5. Bài học thực chiến: notebook path, sync file, reproducibility

---

## Next Update Target

Prompt kế tiếp cần cập nhật vào tài liệu này:

- Prompt backend/API: schema, service inference, endpoint `/predict`, test API.

---

### Prompt 5 - FastAPI Backend

Status: `Completed and tested`

#### Files implemented

- `backend/app/schemas/prediction.py`
- `backend/app/services/ml_service.py`
- `backend/app/api/prediction.py`
- `backend/app/main.py`
- `backend/tests/test_prediction.py`
- `docs/api_contract.md`

#### Backend capabilities

- `POST /api/v1/predict`:
  - Validate input bằng Pydantic
  - Build feature vector đúng thứ tự `feature_names.json`
  - Encode categorical bằng `encoding_map.json`
  - Scale đúng numerical columns bằng `scaler.pkl`
  - Predict xác suất từ `model.pkl`
  - Apply `threshold` từ `model_config.json`
- `GET /api/v1/model-info`:
  - Trả `model_type`, `threshold`, `n_features`
- `GET /`:
  - Health check + trạng thái `model_loaded`

#### Verification

- Import check: `from app.services.ml_service import ml_service` -> OK
- API tests: `5 passed` (`pytest backend/tests/test_prediction.py`)

#### Environment note

- Máy local hiện dùng Python 3.13 nên không cài được đúng pin cũ (`pydantic==2.7.1`).
- Để chạy test local, đã cài bản FastAPI/Pydantic tương thích Python 3.13.

---

### Prompt 6 - Final Check & Run

Status: `Completed`

#### Checklist result

- File existence check: đầy đủ toàn bộ file yêu cầu Prompt 6.
- Import check: `from app.services.ml_service import ml_service` -> OK.
- Test suite: `pytest tests/ -v` -> `5 passed`.
- Server run: `uvicorn app.main:app --reload --port 8000` -> startup thành công.
- cURL verification:
  - `GET /` -> `{\"status\":\"ok\",\"model_loaded\":true}`
  - `GET /api/v1/model-info` -> model metadata đúng
  - `POST /api/v1/predict` -> `prediction=1`, `risk_score=64.02`, `label=Late`, `threshold_used=0.3`

#### Notes

- `risk_score` thực tế > 60.0 như expected Prompt 6.
- `risk_level` trả về `Medium` (hợp lệ theo yêu cầu: `High` hoặc `Medium`).
