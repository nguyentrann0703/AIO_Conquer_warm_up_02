import json
from pathlib import Path
from typing import Any

import joblib
import pandas as pd

from app.schemas.prediction import PredictionInput


class MLService:
    NUM_COLS = [
        "Days for shipment (scheduled)",
        "Benefit per order",
        "Order Item Discount Rate",
    ]

    def __init__(self) -> None:
        self.base_dir = Path(__file__).resolve().parents[2]

        self.model_path = self.base_dir / "ml" / "model.pkl"
        self.scaler_path = self.base_dir / "ml" / "scaler.pkl"
        self.encoding_map_path = self.base_dir / "ml" / "encoding_map.json"
        self.model_config_path = self.base_dir / "ml" / "model_config.json"
        self.feature_names_path = self.base_dir / "ml" / "feature_names.json"

        self._ensure_files_exist()

        self.model = joblib.load(self.model_path)
        self.scaler = joblib.load(self.scaler_path)

        with open(self.encoding_map_path, "r", encoding="utf-8") as f:
            self.encoding_map = json.load(f)

        with open(self.model_config_path, "r", encoding="utf-8") as f:
            self.model_config = json.load(f)

        if self.feature_names_path.exists():
            with open(self.feature_names_path, "r", encoding="utf-8") as f:
                self.feature_names = json.load(f)
        else:
            self.feature_names = self.model_config.get("feature_names", [])

        self.threshold = float(self.model_config.get("threshold", 0.3))
        self.is_loaded = True

        print(f"✅ Loaded model: {self.model_path}")
        print(f"✅ Loaded scaler: {self.scaler_path}")
        print(f"✅ Loaded encoding map: {self.encoding_map_path}")
        print(f"✅ Loaded model config: {self.model_config_path}")

    def _ensure_files_exist(self) -> None:
        required = [
            self.model_path,
            self.scaler_path,
            self.encoding_map_path,
            self.model_config_path,
        ]
        missing = [str(p) for p in required if not p.exists()]
        if missing:
            raise RuntimeError(f"Missing model artifacts: {missing}")

    def _encode(self, value: str, col: str) -> int:
        mapping = self.encoding_map.get(col, {})
        if value in mapping:
            return int(mapping[value])

        print(f"⚠️ Unknown category for '{col}': '{value}'. Fallback to 0.")
        return 0

    def _build_features(self, input_data: PredictionInput) -> list[float]:
        is_peak_season = 1 if input_data.order_month in [10, 11, 12] else 0
        quarter = ((input_data.order_month - 1) // 3) + 1

        feature_map = {
            "Shipping Mode_enc": self._encode(input_data.shipping_mode, "Shipping Mode"),
            "Days for shipment (scheduled)": float(input_data.scheduled_days),
            "Market_enc": self._encode(input_data.market, "Market"),
            "Order Region_enc": self._encode(input_data.order_region, "Order Region"),
            "Category Name_enc": self._encode(input_data.category_name, "Category Name"),
            "Customer Segment_enc": self._encode(input_data.customer_segment, "Customer Segment"),
            "Department Name_enc": self._encode(input_data.department_name, "Department Name"),
            "Month": float(input_data.order_month),
            "Day_of_Week": float(input_data.order_day_of_week),
            "Is_Peak_Season": float(is_peak_season),
            "Quarter": float(quarter),
            "Benefit per order": float(input_data.benefit_per_order),
            "Order Item Discount Rate": float(input_data.discount_rate),
        }

        missing_features = [f for f in self.feature_names if f not in feature_map]
        if missing_features:
            raise RuntimeError(f"Missing features for inference: {missing_features}")

        return [float(feature_map[f]) for f in self.feature_names]

    def predict(self, input_data: PredictionInput) -> dict[str, Any]:
        if not self.is_loaded:
            raise RuntimeError("Model is not loaded")

        features = self._build_features(input_data)
        feature_df = pd.DataFrame([features], columns=self.feature_names)

        cols_to_scale = [c for c in self.NUM_COLS if c in feature_df.columns]
        if cols_to_scale:
            feature_df[cols_to_scale] = self.scaler.transform(feature_df[cols_to_scale])

        probability = float(self.model.predict_proba(feature_df)[0][1])
        prediction = int(probability >= self.threshold)
        risk_score = round(probability * 100.0, 2)

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
            "risk_level": risk_level,
            "threshold_used": self.threshold,
        }


ml_service = MLService()
