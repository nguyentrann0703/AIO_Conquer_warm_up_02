"use client";

import { FormData, PredictionResponse } from "@/app/interfaces/prediction";
import { AnimatePresence, motion } from "framer-motion";
import Select from "./Select";
import Button from "./Button";
import React, { useEffect, useRef, useState } from "react";
import {
  customerSegmentOptions,
  dayOfWeekOptions,
  marketOptions,
  monthOptions,
  shippingModeOptions,
} from "@/app/common/selectData";
import {
  mockDataHighRisk,
  mockDataLowRisk,
  mockDataMediumRisk,
} from "@/app/common/mockData";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:8000";

const Prediction = () => {
  const [hackOverlay, setHackOverlay] = useState<
    Partial<Record<keyof FormData, string>>
  >({});
  const [isDemoAnimating, setIsDemoAnimating] = useState(false);
  const timerIdsRef = useRef<number[]>([]);

  const [formData, setFormData] = useState<FormData>({
    shipping_mode: "Standard Class",
    scheduled_days: 5,
    market: "USCA",
    order_region: "Central America",
    category_name: "Cleats",
    customer_segment: "Consumer",
    department_name: "Fan Shop",
    order_month: 11,
    order_day_of_week: 2,
    benefit_per_order: 50.0,
    discount_rate: 0.1,
  });

  const [response, setResponse] = useState<PredictionResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      timerIdsRef.current.forEach((id) => window.clearTimeout(id));
      timerIdsRef.current = [];
    };
  }, []);

  const hackCharset =
    "#$%&@!?*+~<>[]{}|/=^ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

  const clearDemoTimers = () => {
    timerIdsRef.current.forEach((id) => window.clearTimeout(id));
    timerIdsRef.current = [];
  };

  const scrambleWithReveal = (target: string, progress: number) => {
    const revealCount = Math.floor(target.length * progress);

    return target
      .split("")
      .map((char, idx) => {
        if (char === " ") {
          return " ";
        }

        if (idx < revealCount) {
          return target[idx];
        }

        const randomIndex = Math.floor(Math.random() * hackCharset.length);
        return hackCharset[randomIndex];
      })
      .join("");
  };

  const animateFieldFill = <K extends keyof FormData>(
    field: K,
    finalValue: FormData[K],
    delay: number,
  ) => {
    const startId = window.setTimeout(() => {
      const finalText = String(finalValue);
      const duration = 620;
      const startTime = performance.now();

      const runFrame = (now: number) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const scrambled = scrambleWithReveal(finalText, progress);

        setHackOverlay((prev) => ({
          ...prev,
          [field]: scrambled,
        }));

        if (progress < 1) {
          const frameId = window.setTimeout(
            () => runFrame(performance.now()),
            28,
          );
          timerIdsRef.current.push(frameId);
          return;
        }

        setFormData((prev) => ({
          ...prev,
          [field]: finalValue,
        }));

        const clearOverlayId = window.setTimeout(() => {
          setHackOverlay((prev) => {
            const next = { ...prev };
            delete next[field];
            return next;
          });
        }, 140);

        timerIdsRef.current.push(clearOverlayId);
      };

      runFrame(performance.now());
    }, delay);

    timerIdsRef.current.push(startId);
  };

  const loadMockData = (data: FormData) => {
    clearDemoTimers();
    setResponse(null);
    setError(null);
    setIsDemoAnimating(true);

    const fieldOrder: Array<keyof FormData> = [
      "shipping_mode",
      "scheduled_days",
      "market",
      "order_region",
      "category_name",
      "customer_segment",
      "department_name",
      "order_month",
      "order_day_of_week",
      "benefit_per_order",
      "discount_rate",
    ];

    fieldOrder.forEach((field, idx) => {
      animateFieldFill(field, data[field], idx * 90);
    });

    const finishId = window.setTimeout(
      () => {
        setIsDemoAnimating(false);
      },
      fieldOrder.length * 90 + 720,
    );

    timerIdsRef.current.push(finishId);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    const numericFields = [
      "scheduled_days",
      "order_month",
      "order_day_of_week",
      "benefit_per_order",
      "discount_rate",
    ];

    setFormData((prev) => ({
      ...prev,
      [name]: numericFields.includes(name) ? parseFloat(value) : value,
    }));

    setHackOverlay((prev) => {
      const field = name as keyof FormData;
      if (!(field in prev)) {
        return prev;
      }

      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        shipping_mode: formData.shipping_mode,
        scheduled_days: formData.scheduled_days,
        market: formData.market,
        order_region: formData.order_region,
        category_name: formData.category_name,
        customer_segment: formData.customer_segment,
        department_name: formData.department_name,
        order_month: formData.order_month,
        order_day_of_week: formData.order_day_of_week,
        benefit_per_order: formData.benefit_per_order,
        discount_rate: formData.discount_rate,
      };

      const res = await fetch(`${API_BASE_URL}/api/v1/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errorDetail = res.statusText;

        try {
          const errorData = await res.json();
          errorDetail = errorData.detail ?? errorDetail;
        } catch {
          // Keep the HTTP status text when the backend does not return JSON.
        }

        throw new Error(`API error: ${errorDetail}`);
      }

      const data: PredictionResponse = await res.json();
      setResponse(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch prediction",
      );
      setResponse(null);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case "Low":
        return {
          border: "border-secondary",
          text: "text-secondary",
          bg: "bg-secondary",
        };
      case "Medium":
        return {
          border: "border-primary",
          text: "text-primary",
          bg: "bg-primary",
        };
      case "High":
        return { border: "border-error", text: "text-error", bg: "bg-error" };
      default:
        return { border: "border-error", text: "text-error", bg: "bg-error" };
    }
  };

  const getRiskIcon = (riskLevel: string) => {
    switch (riskLevel) {
      case "Low":
        return "check_circle";
      case "Medium":
        return "info";
      case "High":
        return "warning";
      default:
        return "warning";
    }
  };

  const riskColors = response
    ? getRiskColor(response.risk_level)
    : getRiskColor("High");
  const riskIcon = response ? getRiskIcon(response.risk_level) : "warning";

  const smoothEase: [number, number, number, number] = [0.22, 1, 0.36, 1];

  return (
    <div>
      <motion.section
        className="min-h-screen font-body bg-surface-container-low py-24 px-6 md:px-16 relative"
        id="prediction-module"
        initial={{ opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 0.8, ease: smoothEase }}
      >
        <div className="absolute top-0 left-0 w-full h-px bg-linear-to-r from-transparent via-primary/50 to-transparent" />
        <div className="max-w-7xl mx-auto">
          <motion.header
            className="mb-16"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.65, ease: smoothEase, delay: 0.05 }}
          >
            <h2 className="text-4xl font-body font-bold uppercase tracking-tight flex items-center gap-4">
              <span className="material-symbols-outlined text-primary text-4xl">
                terminal
              </span>
              DATA_ENTRY_PROTOCOLS
            </h2>
            <div className="h-1 w-32 bg-primary mt-4" />
          </motion.header>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Form Side (8 cols) */}
            <motion.div
              className="lg:col-span-7 space-y-12"
              initial={{ opacity: 0, x: -26 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, ease: smoothEase, delay: 0.08 }}
            >
              <form
                className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10"
                onSubmit={handleSubmit}
              >
                {/* Shipping Mode */}
                <div className="relative group">
                  <Select
                    name="shipping_mode"
                    value={formData.shipping_mode}
                    onChange={handleInputChange}
                    options={shippingModeOptions}
                    label="01 // Shipping Mode"
                    overlayText={hackOverlay.shipping_mode}
                  />
                </div>
                {/* Scheduled Days */}
                <div className="relative group">
                  <label className="block font-label text-[10px] text-secondary tracking-widest uppercase mb-2">
                    02 // Scheduled Days
                  </label>
                  <input
                    name="scheduled_days"
                    value={formData.scheduled_days}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-secondary focus:ring-0 text-on-surface font-body py-3 transition-all"
                    placeholder="EXPECTED_ETA"
                    type="number"
                  />
                  {hackOverlay.scheduled_days && (
                    <div className="pointer-events-none absolute bottom-3 left-0 font-mono text-secondary text-sm tracking-[0.08em] animate-pulse">
                      {hackOverlay.scheduled_days}
                    </div>
                  )}
                </div>
                {/* Market */}
                <div className="relative group">
                  <Select
                    name="market"
                    value={formData.market}
                    onChange={handleInputChange}
                    options={marketOptions}
                    label="03 // Market"
                    overlayText={hackOverlay.market}
                  />
                </div>
                {/* Region / Order Region */}
                <div className="relative group">
                  <label className="block font-label text-[10px] text-secondary tracking-widest uppercase mb-2">
                    04 // Region
                  </label>
                  <input
                    name="order_region"
                    value={formData.order_region}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-secondary focus:ring-0 text-on-surface font-body py-3 transition-all uppercase"
                    placeholder="SECTOR_COORDINATE"
                    type="text"
                  />
                  {hackOverlay.order_region && (
                    <div className="pointer-events-none absolute bottom-3 left-0 font-mono text-secondary text-sm tracking-[0.08em] animate-pulse">
                      {hackOverlay.order_region}
                    </div>
                  )}
                </div>
                {/* Category / Category Name */}
                <div className="relative group">
                  <label className="block font-label text-[10px] text-secondary tracking-widest uppercase mb-2">
                    05 // Category
                  </label>
                  <input
                    name="category_name"
                    value={formData.category_name}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-secondary focus:ring-0 text-on-surface font-body py-3 transition-all uppercase"
                    placeholder="CARGO_TYPE"
                    type="text"
                  />
                  {hackOverlay.category_name && (
                    <div className="pointer-events-none absolute bottom-3 left-0 font-mono text-secondary text-sm tracking-[0.08em] animate-pulse">
                      {hackOverlay.category_name}
                    </div>
                  )}
                </div>
                {/* Segment / Customer Segment */}
                <div className="relative group">
                  <Select
                    name="customer_segment"
                    value={formData.customer_segment}
                    onChange={handleInputChange}
                    options={customerSegmentOptions}
                    label="06 // Segment"
                    overlayText={hackOverlay.customer_segment}
                  />
                </div>
                {/* Department */}
                <div className="relative group">
                  <label className="block font-label text-[10px] text-secondary tracking-widest uppercase mb-2">
                    07 // Department
                  </label>
                  <input
                    name="department_name"
                    value={formData.department_name}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-secondary focus:ring-0 text-on-surface font-body py-3 transition-all uppercase"
                    placeholder="DEPARTMENT_CODE"
                    type="text"
                  />
                  {hackOverlay.department_name && (
                    <div className="pointer-events-none absolute bottom-3 left-0 font-mono text-secondary text-sm tracking-[0.08em] animate-pulse">
                      {hackOverlay.department_name}
                    </div>
                  )}
                </div>
                {/* Month */}
                <div className="relative group">
                  <Select
                    name="order_month"
                    value={formData.order_month}
                    onChange={handleInputChange}
                    options={monthOptions}
                    label="08 // Delivery Month"
                    overlayText={hackOverlay.order_month}
                  />
                </div>
                {/* Day of Week */}
                <div className="relative group">
                  <Select
                    name="order_day_of_week"
                    value={formData.order_day_of_week}
                    onChange={handleInputChange}
                    options={dayOfWeekOptions}
                    label="09 // Day of Week"
                    overlayText={hackOverlay.order_day_of_week}
                  />
                </div>
                {/* Operational Benefit */}
                <div className="relative group">
                  <label className="block font-label text-[10px] text-secondary tracking-widest uppercase mb-2">
                    10 // Operational Benefit
                  </label>
                  <input
                    name="benefit_per_order"
                    value={formData.benefit_per_order}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-secondary focus:ring-0 text-on-surface font-body py-3 transition-all"
                    placeholder="VALUE_INDEX"
                    step="0.01"
                    type="number"
                  />
                  {hackOverlay.benefit_per_order && (
                    <div className="pointer-events-none absolute bottom-3 left-0 font-mono text-secondary text-sm tracking-[0.08em] animate-pulse">
                      {hackOverlay.benefit_per_order}
                    </div>
                  )}
                </div>
                {/* Discount Rate */}
                <div className="relative group">
                  <label className="block font-label text-[10px] text-secondary tracking-widest uppercase mb-2">
                    11 // Discount Rate
                  </label>
                  <input
                    name="discount_rate"
                    value={formData.discount_rate}
                    onChange={handleInputChange}
                    className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-secondary focus:ring-0 text-on-surface font-body py-3 transition-all"
                    placeholder="0.00 - 1.00"
                    step="0.01"
                    type="number"
                    min="0"
                    max="1"
                  />
                  {hackOverlay.discount_rate && (
                    <div className="pointer-events-none absolute bottom-3 left-0 font-mono text-secondary text-sm tracking-[0.08em] animate-pulse">
                      {hackOverlay.discount_rate}
                    </div>
                  )}
                </div>

                <motion.div
                  className="md:col-span-2 pt-4"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.995 }}
                >
                  <motion.button
                    className="w-full cursor-pointer group relative flex items-center justify-center gap-4 py-6 bg-secondary text-on-secondary font-body font-extrabold uppercase tracking-widest hover:bg-secondary-dim transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={loading || isDemoAnimating}
                    animate={
                      loading ? { boxShadow: "0 0 0 rgba(0,0,0,0)" } : {}
                    }
                  >
                    <span
                      className="material-symbols-outlined"
                      data-weight="fill"
                    >
                      {loading ? "hourglass_top" : "analytics"}
                    </span>
                    {loading ? "PROCESSING..." : "EXECUTE_PREDICTION_SEQUENCE"}
                  </motion.button>
                </motion.div>
              </form>
            </motion.div>
            {/* Result Side (4 cols) */}
            <motion.div
              className="lg:col-span-5 space-y-8"
              initial={{ opacity: 0, x: 26 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, ease: smoothEase, delay: 0.12 }}
            >
              <motion.div
                className="md:col-span-2 space-y-4"
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.55, ease: smoothEase }}
              >
                <div className="border-t border-outline-variant pt-8">
                  <p className="font-label text-[10px] text-secondary tracking-widest uppercase mb-4">
                    📋 // DEMO MODE - AUTO FILL SCENARIOS
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => loadMockData(mockDataLowRisk)}
                      icon="check_circle"
                      disabled={isDemoAnimating}
                    >
                      Low Risk Demo
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadMockData(mockDataMediumRisk)}
                      icon="info"
                      disabled={isDemoAnimating}
                    >
                      Medium Risk Demo
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => loadMockData(mockDataHighRisk)}
                      icon="warning"
                      disabled={isDemoAnimating}
                    >
                      High Risk Demo
                    </Button>
                  </div>
                </div>
              </motion.div>
              <div className="sticky top-36 space-y-8">
                {/* RISK HUD CARD */}
                <motion.div
                  className={`relative p-8 bg-surface-container-highest border-l-4 ${riskColors.border} overflow-hidden shadow-2xl transition-all duration-500`}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.55, ease: smoothEase }}
                >
                  <div className="absolute inset-0 scanline-bg opacity-5 pointer-events-none" />
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        className="mb-6 p-4 bg-error/10 border border-error/20 rounded"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.28 }}
                      >
                        <p className="text-xs font-label text-error uppercase">
                          {error}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <div className="flex justify-between items-start mb-12">
                    <div>
                      <p
                        className={`font-label text-[10px] ${riskColors.text} tracking-[0.3em] uppercase mb-1`}
                      >
                        Status:{" "}
                        {response
                          ? response.label.toUpperCase()
                          : "AWAITING_INPUT"}
                      </p>
                      <h3 className="text-4xl font-body font-bold uppercase text-on-surface">
                        RISK_LEVEL:{" "}
                        <span className={riskColors.text}>
                          {response ? response.risk_level.toUpperCase() : "—"}
                        </span>
                      </h3>
                    </div>
                    <span
                      className={`material-symbols-outlined ${riskColors.text} text-4xl ${
                        response ? "animate-pulse" : ""
                      }`}
                    >
                      {riskIcon}
                    </span>
                  </div>
                  {/* Risk Gauge */}
                  <div className="space-y-4">
                    <div className="flex justify-between font-label text-[10px] text-outline uppercase tracking-widest">
                      <span>Risk_Score</span>
                      <span>
                        {response ? response.risk_score.toFixed(2) : "—"}%
                      </span>
                    </div>
                    <div className="h-4 bg-surface-container w-full relative">
                      <div
                        className={`h-full ${riskColors.bg} relative overflow-hidden transition-all duration-500`}
                        style={{
                          width: response ? `${response.risk_score}%` : "0%",
                        }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-[pulse_2s_infinite]" />
                      </div>
                    </div>
                    {response && (
                      <div className="grid grid-cols-10 gap-1 h-2">
                        {Array.from({ length: 10 }).map((_, i) => (
                          <div
                            key={i}
                            className={
                              i < Math.ceil(response.risk_score / 10)
                                ? riskColors.bg
                                : "bg-outline-variant"
                            }
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  <AnimatePresence mode="wait">
                    {response && (
                      <motion.div
                        className={`mt-12 p-4 ${riskColors.bg}/10 border ${riskColors.border}/20`}
                        key="response-copy"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p className="text-xs font-label text-on-surface leading-relaxed uppercase">
                          <span className={`${riskColors.text} font-bold`}>
                            {response.label === "Late"
                              ? "ALERT: "
                              : "CONFIRMED: "}
                          </span>
                          {response.label === "Late"
                            ? "Predicted delivery delay detected. Risk score indicates high probability of late arrival. Consider proactive measures."
                            : "On-time delivery is likely. Risk profile is favorable for scheduled delivery timeline."}
                        </p>
                      </motion.div>
                    )}
                    {!response && (
                      <motion.div
                        key="empty-copy"
                        className="mt-12 p-4 bg-outline-variant/10 border border-outline-variant/20"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p className="text-xs font-label text-outline leading-relaxed uppercase">
                          Fill in the form fields and execute the prediction
                          sequence to analyze delivery risk.
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
                {/* SECONDARY METRICS */}
                <AnimatePresence>
                  {response && (
                    <motion.div
                      className="grid grid-cols-2 gap-4"
                      initial={{ opacity: 0, y: 14 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.35, ease: smoothEase }}
                    >
                      <motion.div
                        className="bg-surface-container p-6 relative group overflow-hidden"
                        whileHover={{ y: -3 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="absolute inset-0 bg-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <p className="font-label text-[10px] text-outline uppercase mb-2">
                          PREDICTION
                        </p>
                        <p className="text-3xl font-body font-bold text-on-surface">
                          {response.prediction === 1 ? "LATE" : "ON_TIME"}
                        </p>
                        <div className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center bg-outline-variant/20 text-outline">
                          <span className="material-symbols-outlined text-sm">
                            {response.prediction === 1
                              ? "cancel"
                              : "check_circle"}
                          </span>
                        </div>
                      </motion.div>
                      <motion.div
                        className="bg-surface-container p-6 relative group overflow-hidden"
                        whileHover={{ y: -3 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="absolute inset-0 bg-tertiary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <p className="font-label text-[10px] text-outline uppercase mb-2">
                          THRESHOLD
                        </p>
                        <p className="text-3xl font-body font-bold text-on-surface">
                          {(response.threshold_used * 100).toFixed(1)}%
                        </p>
                        <div className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center bg-outline-variant/20 text-outline">
                          <span className="material-symbols-outlined text-sm">
                            percent
                          </span>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
};

export default Prediction;
