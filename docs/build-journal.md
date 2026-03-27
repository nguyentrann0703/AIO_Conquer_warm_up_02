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

#### 3.1. Phát hiện vấn đề trong dữ liệu

Trước khi mô hình hóa, phần EDA tập trung vào việc trả lời 3 câu hỏi:

- Dữ liệu có thiếu hoặc bất thường ở đâu không?
- Biến mục tiêu phân bố như thế nào?
- Những nhóm nào có dấu hiệu liên quan đến giao trễ?

Các phát hiện chính:

- Target tương đối cân bằng nhưng nghiêng lớp `Late` (~54.83%).
- Shipping mode có khác biệt tỷ lệ trễ rõ rệt.
- Market có mức late risk khác nhau (`LATAM`, `Europe`, `Pacific Asia`, `USCA`, `Africa`).
- Missing lớn ở:
  - `Product Description` rỗng toàn bộ
  - `Order Zipcode` thiếu rất nhiều
- Time features từ `order date (DateOrders)` có tiềm năng tín hiệu mùa vụ.

#### 3.1.1. Kiểm tra dữ liệu bị thiếu

- `Product Description` bị thiếu 100%, nên không có giá trị sử dụng cho pipeline hiện tại.
- `Order Zipcode` thiếu rất nhiều, không phù hợp để dùng làm feature ổn định.
- Các cột được chọn cho modeling nhìn chung không có vấn đề missing nghiêm trọng, nên không cần chiến lược làm sạch quá phức tạp.

#### 3.1.2. Kiểm tra logic nghiệp vụ và leakage

Đây là phần quan trọng nhất của project này. Nhóm không chỉ nhìn vào missing/outlier, mà còn kiểm tra:

- Cột nào thật sự biết được tại thời điểm đặt hàng?
- Cột nào chỉ xuất hiện sau khi giao xong và sẽ gây leakage nếu đưa vào model?

Các cột bị loại khỏi mô hình vì leakage:

- `Days for shipping (real)`
- `Delivery Status`
- `shipping date (DateOrders)`
- `Late_delivery_risk` (target)

Điểm này là khác biệt rất lớn giữa project hiện tại và nhiều notebook tham khảo trên internet: accuracy có thể thấp hơn, nhưng mô hình thực tế hơn và dùng được trong production.

#### 3.1.3. Kiểm tra pattern để định hướng feature engineering

Phần EDA không chỉ để “vẽ biểu đồ”, mà còn để quyết định sẽ tạo feature gì ở bước preprocessing:

- `Shipping Mode` cho thấy tín hiệu phân loại mạnh.
- `Market` và `Order Region` gợi ý yếu tố địa lý ảnh hưởng đến rủi ro giao trễ.
- `order date (DateOrders)` cho thấy có thể tách ra `Month`, `Day_of_Week`, `Quarter`, `Is_Peak_Season`.
- `Days for shipment (scheduled)` có ý nghĩa nghiệp vụ rõ ràng nên được giữ lại như một biến lõi.

#### Runtime note

- `FileNotFoundError` do working directory notebook khác project root.
- Đã chỉnh cell load dữ liệu theo hướng path linh hoạt (`dataset/...` và `../dataset/...`).

---

### Prompt 3 - Preprocessing Notebook

Status: `Completed (Notebook drafted, ready to run)`

File: `notebooks/02_preprocessing.ipynb`

#### 3.2. Các bước làm sạch và chuẩn bị dữ liệu

Khác với ví dụ blog về nhạc, project này không có nhiều bước xóa dòng mạnh tay. Lý do là:

- Mục tiêu chính không phải “lọc dataset để kể chuyện EDA”, mà là chuẩn bị dữ liệu ổn định để train model và deploy API.
- Nhóm ưu tiên giữ lại càng nhiều đơn hàng càng tốt, miễn là không gây leakage và không tạo lỗi cho pipeline.

Các bước thực hiện:

1. Chỉ giữ lại các cột hợp lệ tại thời điểm đặt hàng.
2. Loại cột thời gian gốc sau khi đã tách feature cần thiết.
3. Điền giá trị thiếu thay vì xóa hàng loạt.
4. Encode categorical để model xử lý được.
5. Scale đúng các cột số cần thiết.
6. Split train/validation/test để phục vụ training và đánh giá.

#### 3.2.1. Chọn cột đầu vào

Chỉ các cột dưới đây được giữ lại:

- `Shipping Mode`
- `Days for shipment (scheduled)`
- `Market`
- `Order Region`
- `Category Name`
- `Customer Segment`
- `Department Name`
- `order date (DateOrders)`
- `Benefit per order`
- `Order Item Discount Rate`

Target:

- `Late_delivery_risk`

#### 3.2.2. Feature engineering

Từ `order date (DateOrders)`, nhóm tạo ra 4 feature mới:

- `Month`
- `Day_of_Week`
- `Quarter`
- `Is_Peak_Season`

Sau khi tách xong, cột date gốc bị drop để tránh giữ dữ liệu thô không cần thiết.

#### 3.2.3. Xử lý missing values

Thay vì xóa dòng, pipeline chọn cách giữ dữ liệu:

- Numerical -> điền bằng median
- Categorical -> điền `'Unknown'`

Cách này phù hợp với bài toán production hơn, vì khi chạy API sau này ta vẫn cần hệ thống chịu được input thiếu hoặc hiếm.

#### 3.2.4. Encode categorical features

Các cột categorical được encode bằng `LabelEncoder`:

- `Shipping Mode`
- `Market`
- `Order Region`
- `Category Name`
- `Customer Segment`
- `Department Name`

Điểm quan trọng:

- Mapping được lưu lại trong `encoding_map.json`
- API backend sẽ dùng lại chính mapping này để đảm bảo inference khớp lúc train

#### 3.2.5. Scale numerical features

Chỉ 3 cột số được scale:

- `Days for shipment (scheduled)`
- `Benefit per order`
- `Order Item Discount Rate`

`StandardScaler` chỉ được fit trên train set để tránh leakage.

#### 3.2.6. Train/Validation/Test split

Dữ liệu được chia theo tỉ lệ:

- Train: 70%
- Validation: 15%
- Test: 15%

Kèm `stratify=y` để giữ tỷ lệ lớp `Late/On Time` ổn định ở cả 3 tập.

#### 3.2.7. Kết quả đầu ra của bước preprocessing

Sau bước này, project có 2 loại output:

Artifacts cho backend:

- `backend/ml/encoding_map.json`
- `backend/ml/feature_names.json`
- `backend/ml/scaler.pkl`

Processed data cho training:

- `dataset/processed/X_train.csv`
- `dataset/processed/X_val.csv`
- `dataset/processed/X_test.csv`
- `dataset/processed/y_train.csv`
- `dataset/processed/y_val.csv`
- `dataset/processed/y_test.csv`

#### Mapping: Raw Column -> Transformed Feature -> Reason

| Raw column | Transformed feature | Reason |
|---|---|---|
| `Shipping Mode` | `Shipping Mode_enc` | Categorical cần encode để model học được |
| `Days for shipment (scheduled)` | `Days for shipment (scheduled)` (scaled) | Feature cốt lõi về kế hoạch giao hàng |
| `Market` | `Market_enc` | Bắt khác biệt rủi ro theo thị trường |
| `Order Region` | `Order Region_enc` | Tín hiệu địa lý chi tiết hơn `Market` |
| `Category Name` | `Category Name_enc` | Nhóm sản phẩm có hành vi giao hàng khác nhau |
| `Customer Segment` | `Customer Segment_enc` | Segment khách hàng ảnh hưởng vận hành đơn |
| `Department Name` | `Department Name_enc` | Department phản ánh luồng fulfillment khác nhau |
| `order date (DateOrders)` | `Month` | Bắt seasonality theo tháng |
| `order date (DateOrders)` | `Day_of_Week` | Bắt pattern theo ngày trong tuần |
| `order date (DateOrders)` | `Quarter` | Bắt chu kỳ theo quý |
| `order date (DateOrders)` | `Is_Peak_Season` | Cờ mùa cao điểm (10-12) |
| `Benefit per order` | `Benefit per order` (scaled) | Tín hiệu tài chính đơn hàng |
| `Order Item Discount Rate` | `Order Item Discount Rate` (scaled) | Mức discount có thể liên quan rủi ro giao trễ |

Ghi chú:

- Các cột categorical được encode bằng `LabelEncoder` và lưu mapping vào `encoding_map.json`.
- Chỉ scale 3 cột numerical theo thiết kế pipeline (`scheduled days`, `benefit`, `discount rate`).
- Scaler được fit trên train set để tránh leakage.

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
