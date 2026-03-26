# 🖥️ Frontend Plan — Late Delivery Risk Prediction

## 📌 Tổng quan

| Thông tin | Chi tiết |
|---|---|
| **Kết nối backend** | `POST http://localhost:8000/api/v1/predict` |
| **Framework gợi ý** | Next.js (App Router) hoặc React thuần |
| **Styling gợi ý** | Tailwind CSS |
| **Mục tiêu** | Form nhập đơn hàng → hiển thị kết quả dự đoán trực quan |

---

## 🔌 API Contract (từ backend)

### Request — POST `/api/v1/predict`

```json
{
  "shipping_mode":      "First Class | Same Day | Second Class | Standard Class",
  "scheduled_days":     1–30,
  "market":             "LATAM | Europe | Pacific Asia | USCA | Africa",
  "order_region":       "string",
  "category_name":      "string",
  "customer_segment":   "Consumer | Corporate | Home Office",
  "department_name":    "string",
  "order_month":        1–12,
  "order_day_of_week":  0–6,
  "benefit_per_order":  number,
  "discount_rate":      0.0–1.0
}
```

### Response

```json
{
  "prediction":     0 | 1,
  "risk_score":     0.0–100.0,
  "label":          "On Time" | "Late",
  "risk_level":     "Low" | "Medium" | "High",
  "threshold_used": 0.3
}
```

---

## 🗂️ Cấu trúc thư mục gợi ý

```
frontend/
├── app/                         (nếu dùng Next.js App Router)
│   └── page.tsx                 ← màn hình chính
├── components/
│   ├── PredictionForm.tsx       ← form nhập liệu
│   ├── ResultCard.tsx           ← hiển thị kết quả
│   ├── RiskBadge.tsx            ← badge Low/Medium/High
│   └── RiskGauge.tsx            ← visual risk score 0–100
├── lib/
│   └── api.ts                   ← hàm gọi backend
├── types/
│   └── prediction.ts            ← TypeScript types
└── .env.local
    NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🧩 Chi tiết từng component

---

### `types/prediction.ts`
```typescript
export type ShippingMode =
  | 'First Class'
  | 'Same Day'
  | 'Second Class'
  | 'Standard Class'

export type Market = 'LATAM' | 'Europe' | 'Pacific Asia' | 'USCA' | 'Africa'

export type CustomerSegment = 'Consumer' | 'Corporate' | 'Home Office'

export type RiskLevel = 'Low' | 'Medium' | 'High'

export interface PredictionInput {
  shipping_mode:      ShippingMode
  scheduled_days:     number
  market:             Market
  order_region:       string
  category_name:      string
  customer_segment:   CustomerSegment
  department_name:    string
  order_month:        number
  order_day_of_week:  number
  benefit_per_order:  number
  discount_rate:      number
}

export interface PredictionOutput {
  prediction:     0 | 1
  risk_score:     number
  label:          'On Time' | 'Late'
  risk_level:     RiskLevel
  threshold_used: number
}
```

---

### `lib/api.ts`
```typescript
import { PredictionInput, PredictionOutput } from '@/types/prediction'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

export async function predictDelivery(
  input: PredictionInput
): Promise<PredictionOutput> {
  const res = await fetch(`${BASE_URL}/api/v1/predict`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(input),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.detail ?? 'Prediction failed')
  }

  return res.json()
}
```

---

### `components/PredictionForm.tsx` — Skeleton

Form chia **2 cột**, nhóm theo logic:

```
┌─────────────────────────────────────┐
│   🚚 Late Delivery Risk Predictor   │
├──────────────────┬──────────────────┤
│  SHIPPING        │  ORDER           │
│  Shipping Mode ▼ │  Month      [  ] │
│  Sched. Days [  ]│  Day of Week[  ] │
│                  │  Benefit    [  ] │
├──────────────────┤  Discount   [  ] │
│  LOCATION        │                  │
│  Market      ▼   │  PRODUCT         │
│  Region      [  ]│  Category   [  ] │
│                  │  Department [  ] │
├──────────────────┴──────────────────┤
│  Customer Segment ▼                 │
│                                     │
│         [ 🔍 Predict Now ]          │
└─────────────────────────────────────┘
```

**Các field dùng `<select>` (enum cố định):**
- `shipping_mode` → 4 options
- `market` → 5 options
- `customer_segment` → 3 options
- `order_month` → 1–12
- `order_day_of_week` → 0–6 (hiển thị Mon–Sun)

**Các field dùng `<input>`:**
- `order_region`, `category_name`, `department_name` → text
- `scheduled_days` → number, min=1, max=30
- `benefit_per_order` → number
- `discount_rate` → number, min=0, max=1, step=0.01

---

### `components/RiskBadge.tsx`

```typescript
// Badge màu theo risk level
const config = {
  Low:    { bg: 'bg-green-100',  text: 'text-green-800',  label: '🟢 Low Risk'    },
  Medium: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: '🟡 Medium Risk' },
  High:   { bg: 'bg-red-100',    text: 'text-red-800',    label: '🔴 High Risk'   },
}
```

---

### `components/RiskGauge.tsx`

Visual đơn giản hiển thị risk_score 0–100:

```
Dùng CSS progress bar hoặc SVG arc:

0         50        100
├─────────┼─────────┤
[██████░░░░░░░░░░░░] 42.5%

Màu gradient: green → yellow → red
- 0–40  : green
- 40–70 : yellow
- 70–100: red
```

---

### `components/ResultCard.tsx`

Hiển thị sau khi có response:

```
┌─────────────────────────────────┐
│  🔴 HIGH RISK                   │
│                                 │
│  Prediction:  LATE              │
│  Risk Score:  ████████░░  78.5% │
│                                 │
│  ⚠️ This order has high         │
│  probability of late delivery.  │
│  Consider upgrading shipping    │
│  or scheduling earlier.         │
│                                 │
│  threshold used: 0.3            │
└─────────────────────────────────┘
```

**Logic message theo risk_level:**

| Risk Level | Message |
|---|---|
| Low | ✅ This order is likely to arrive on time. |
| Medium | ⚠️ Moderate delay risk. Monitor this order. |
| High | 🚨 High delay risk. Consider proactive action. |

---

## 🔄 UI States cần handle

```
idle      → Form trống, chưa submit
loading   → Đang gọi API, hiện spinner
success   → Có kết quả, hiện ResultCard
error     → API lỗi, hiện error message
```

```typescript
type UIState = 'idle' | 'loading' | 'success' | 'error'
```

---

## ⚙️ Environment Setup

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

```bash
# Chạy frontend
npm install
npm run dev
# → http://localhost:3000
```

> ⚠️ Backend phải chạy trước tại port 8000 trước khi test frontend

---

## ✅ Checklist bàn giao frontend

```
□ Form submit gọi đúng endpoint POST /api/v1/predict
□ Tất cả 11 fields được gửi đúng format
□ Loading state hiển thị khi đang chờ
□ ResultCard hiển thị prediction, risk_score, label, risk_level
□ RiskBadge đổi màu đúng theo Low/Medium/High
□ Error message khi backend không trả về 200
□ CORS không bị lỗi (backend đã allow localhost:3000)
```

---

## ⚠️ Lưu ý quan trọng cho anh Frontend

```
1. order_day_of_week: 0 = Monday, 6 = Sunday
   → Nên hiển thị "Mon/Tue/.../Sun" thay vì số

2. discount_rate: là số thập phân 0.0–1.0
   → Nên cho nhập % (0–100) rồi chia 100 trước khi gửi API
   → VD: user nhập "10" → gửi 0.1

3. risk_score: là float 0.0–100.0
   → Round về 1 chữ số thập phân khi hiển thị

4. Nếu backend chưa chạy → fetch sẽ throw network error
   → Cần catch và hiển thị "Cannot connect to server"
```
