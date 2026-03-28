export interface PredictionResponse {
  prediction: 0 | 1;
  risk_score: number;
  label: "Late" | "On Time";
  risk_level: "Low" | "Medium" | "High";
  threshold_used: number;
}

export interface FormData {
  shipping_mode: string;
  scheduled_days: number;
  market: string;
  order_region: string;
  category_name: string;
  customer_segment: string;
  department_name: string;
  order_month: number;
  order_day_of_week: number;
  benefit_per_order: number;
  discount_rate: number;
}
