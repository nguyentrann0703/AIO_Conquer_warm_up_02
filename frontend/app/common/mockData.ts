import { FormData } from "../interfaces/prediction";

// Mock data for demo scenarios
export const mockDataLowRisk: FormData = {
  shipping_mode: "Standard Class",
  scheduled_days: 7,
  market: "Pacific Asia",
  order_region: "Southeast Asia",
  category_name: "Apparel",
  customer_segment: "Consumer",
  department_name: "Retail",
  order_month: 6,
  order_day_of_week: 4,
  benefit_per_order: 75.0,
  discount_rate: 0.15,
};

export const mockDataMediumRisk: FormData = {
  shipping_mode: "Same Day",
  scheduled_days: 12,
  market: "LATAM",
  order_region: "Remote Areas",
  category_name: "Specialty Items",
  customer_segment: "Consumer",
  department_name: "Special Orders",
  order_month: 11,
  order_day_of_week: 5,
  benefit_per_order: 45.0,
  discount_rate: 0.25,
};

export const mockDataHighRisk: FormData = {
  shipping_mode: "First Class",
  scheduled_days: 3,
  market: "Europe",
  order_region: "Western Europe",
  category_name: "Electronics",
  customer_segment: "Corporate",
  department_name: "Tech Division",
  order_month: 3,
  order_day_of_week: 2,
  benefit_per_order: 150.0,
  discount_rate: 0.05,
};
