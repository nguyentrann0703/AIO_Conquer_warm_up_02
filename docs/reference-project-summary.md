# Reference Project Summary (Local `references/`)

## 1) Repo này giải quyết bài toán gì?

Repo tham khảo trong `references/` là bộ dữ liệu cho bài toán **phân tích chuỗi cung ứng và dự đoán rủi ro giao hàng trễ** (late delivery risk) trong logistics/e-commerce.

- Bài toán cốt lõi có thể triển khai ML: phân loại `Late_delivery_risk` (0/1).
- Ngoài dữ liệu đơn hàng dạng bảng, repo còn có clickstream để mở rộng phân tích hành vi.

## 2) Input/Output chính

### Input hiện có

- `DataCoSupplyChainDataset.csv`: dữ liệu structured, 180,519 dòng, 53 cột.
- `DescriptionDataCoSupplyChain.csv`: mô tả ý nghĩa cột dữ liệu.
- `tokenized_access_logs.csv`: dữ liệu clickstream (unstructured/semi-structured), 469,978 dòng, 8 cột.

### Output hiện có

- Repo tham khảo local **không chứa output model** (không có model artifact, không có script train/inference, không có API).
- Output thực tế hiện chỉ là dataset + metadata mô tả field.

## 3) Cấu trúc thư mục

```text
references/
├── README.md
├── DataCoSupplyChainDataset.csv
├── DescriptionDataCoSupplyChain.csv
└── tokenized_access_logs.csv
```

Nhận xét: đây là “data reference package”, chưa phải “code reference package”.

## 4) Pipeline xử lý dữ liệu (suy ra từ dữ liệu hiện có)

Vì repo không có notebook/script pipeline, luồng xử lý có thể suy ra hợp lý như sau:

1. Ingest `DataCoSupplyChainDataset.csv` (cần chú ý encoding `cp1252`).
2. Data profiling: missing values, duplicate, leakage, kiểu dữ liệu thời gian.
3. Chọn target: `Late_delivery_risk`.
4. Tạo feature từ thời gian và shipping.
5. Encode categorical + scale numerical.
6. Train/validate/test và threshold tuning theo mục tiêu business (ưu tiên Recall).
7. Đóng gói inference (API/UI).

## 5) Feature engineering (gợi ý từ schema hiện có)

Feature có tiềm năng cao:

- Shipping: `Shipping Mode`, `Days for shipment (scheduled)`, `Days for shipping (real)`.
- Geography: `Market`, `Order Region`, `Order Country`.
- Time: `order date (DateOrders)`, `shipping date (DateOrders)`.
- Commerce: `Category Name`, `Customer Segment`, `Benefit per order`, `Sales per customer`.

Feature engineer nên áp dụng:

- `month`, `day_of_week`, `is_peak_season`.
- `days_gap = scheduled - real` (chú ý leakage khi dùng cho inference thật).
- Nhóm vùng/market hiếm thành `Other`.
- Log-transform cho biến lệch mạnh (nếu cần).

## 6) Model/thuật toán đang dùng

Trong repo tham khảo local: **không có code/model cụ thể**.

Đề xuất baseline khi build project mới:

- Baseline: Logistic Regression.
- Main model: RandomForest / XGBoost / LightGBM (nếu môi trường cho phép).
- Ưu tiên calibration + threshold tuning vì yêu cầu nghiệp vụ thường thiên về bắt được ca trễ.

## 7) Train / Evaluate / Inference

Repo tham khảo local hiện trạng:

- Train: chưa có script/notebook.
- Evaluate: chưa có metric report.
- Inference: chưa có service/API.

Dữ liệu nhanh để định hướng modeling:

- `Late_delivery_risk` = 1 chiếm khoảng 54.83% (98,977/180,519).
- Shipping mode lớn nhất: `Standard Class`.
- Market nổi bật: `LATAM`, `Europe`, `Pacific Asia`, `USCA`, `Africa`.
- Missing lớn: `Product Description` (rỗng toàn bộ), `Order Zipcode` (thiếu rất nhiều).

## 8) Dependency chính

Repo local không có `requirements.txt`.

Dependency hợp lý cho project mới:

- Data/EDA: `pandas`, `numpy`, `matplotlib`, `seaborn`.
- ML: `scikit-learn` (+ `xgboost` hoặc `lightgbm` nếu dùng).
- Serving: `fastapi`, `uvicorn`, `pydantic`.
- Tracking tùy chọn: `mlflow`, `joblib`.

## 9) Điểm mạnh của repo tham khảo

- Dữ liệu lớn, đa chiều (logistics + customer + product + geography + time).
- Có sẵn file mô tả cột giúp hiểu domain nhanh.
- Có thêm clickstream để mở rộng use-case nâng cao.
- Phù hợp làm dataset chuẩn cho đồ án/PoC logistics risk.

## 10) Điểm yếu / hạn chế

- Không có code pipeline tái lập (không notebook/script).
- Không có cấu trúc phần mềm (backend/frontend/tests).
- Không có guideline chất lượng model và kiểm thử inference.
- Có nhiều cột tiềm ẩn leakage nếu không lọc cẩn thận.
- Dữ liệu có cột thiếu nặng, cần chiến lược làm sạch rõ ràng.

## 11) Phần nên học từ ref

- Cách đặt bài toán từ dữ liệu vận hành supply chain.
- Cách tổ chức field theo domain (shipping, order, product, market).
- Khả năng mở rộng từ structured data sang clickstream.

## 12) Phần không nên copy nguyên

- Không dùng nguyên tất cả cột vào model (rủi ro leakage + overfit).
- Không suy luận “mọi biến có shipping real date” trong production nếu thời điểm predict chưa biết.
- Không copy thô dữ liệu nhạy cảm vào output/log (dù đã mask một phần).
- Không triển khai model mà thiếu validation split/time-aware split.

## 13) Cách áp dụng lại vào project mới

1. Dùng ref như **nguồn dữ liệu + domain map**, không dùng như code template.
2. Tự xây chuẩn thư mục: `notebooks/`, `backend/`, `frontend/`, `docs/`, `tests/`.
3. Định nghĩa rõ “thời điểm dự đoán” để chặn leakage.
4. Chuẩn hóa pipeline artifacts: `encoding_map`, `scaler`, `feature_list`, `model`.
5. Đóng gói API contract sớm để frontend tích hợp sớm.

## 14) Roadmap đề xuất để build project mới từ ref

### Phase 1: Data Understanding (0.5-1 ngày)

- Profiling toàn bộ cột, missing, unique, distribution target.
- Chốt danh sách feature “được phép biết tại thời điểm dự đoán”.
- Viết tài liệu data assumptions trong `docs/`.

### Phase 2: Baseline ML Pipeline (1 ngày)

- Tạo notebook preprocessing + baseline Logistic Regression.
- Split train/val/test đúng cách.
- Đặt metric chính: Recall/F2 cho lớp trễ, kèm Precision/AUC.

### Phase 3: Model Iteration (1 ngày)

- Thử RandomForest/XGBoost, tune threshold.
- So sánh bằng confusion matrix + business cost.
- Chốt model/artifacts để export.

### Phase 4: Serving + Integration (1 ngày)

- Dựng FastAPI `/predict` với schema ổn định.
- Viết test API cơ bản (happy path + invalid input).
- Frontend gọi API và hiển thị risk score/level.

### Phase 5: Hardening + Demo (0.5 ngày)

- Kiểm tra leakage lần cuối.
- Đóng gói README runbook + demo script.
- Chuẩn bị slide: problem, data, model, result, demo.

---

## Kết luận ngắn

`references/` hiện là bộ dữ liệu gốc rất tốt để học domain và xây pipeline mới, nhưng **chưa có code architecture/pipeline/model để tái sử dụng trực tiếp**. Cách dùng tối ưu là: lấy ref làm data foundation, còn implementation cần tự thiết kế theo chuẩn project của nhóm.
