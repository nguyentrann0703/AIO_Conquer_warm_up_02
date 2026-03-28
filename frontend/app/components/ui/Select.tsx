"use client";

import React, { useState, useRef, useEffect } from "react";

interface SelectOption {
  value: string | number;
  label: string;
}

interface SelectProps {
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  className?: string;
  overlayText?: string;
}

const Select = ({
  name,
  value,
  onChange,
  options,
  label,
  placeholder,
  className = "",
  overlayText,
}: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<HTMLSelectElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const displayValue = selectedOption?.label || placeholder || "Select...";
  const displayedText = overlayText ?? displayValue;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNativeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e);
  };

  const handleOptionSelect = (optionValue: string | number) => {
    const syntheticEvent = {
      target: {
        name,
        value: String(optionValue),
      },
    } as React.ChangeEvent<HTMLSelectElement>;

    onChange(syntheticEvent);
    setIsOpen(false);
  };

  return (
    <div className={`relative group ${className}`} ref={containerRef}>
      {label && (
        <label className="block font-label text-[10px] text-secondary tracking-widest uppercase mb-2">
          {label}
        </label>
      )}

      {/* Hidden native select for form submission */}
      <select
        ref={selectRef}
        name={name}
        value={value}
        onChange={handleNativeChange}
        className="sr-only"
        tabIndex={-1}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {/* Custom dropdown trigger */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-transparent border-0 border-b-2 border-outline-variant focus:border-secondary focus:ring-0 text-on-surface font-body uppercase py-3 transition-all appearance-none cursor-pointer flex items-center justify-between"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            setIsOpen(!isOpen);
          }
        }}
      >
        <span
          className={`text-on-surface ${
            overlayText
              ? "font-mono text-secondary tracking-[0.08em] animate-pulse"
              : ""
          }`}
        >
          {displayedText}
        </span>
        <span
          className={`material-symbols-outlined text-outline pointer-events-none transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        >
          expand_more
        </span>
      </div>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-surface-container-high border border-outline-variant shadow-2xl z-50">
          {options.map((option) => (
            <div
              key={option.value}
              onClick={() => handleOptionSelect(option.value)}
              className={`px-4 py-3 cursor-pointer transition-colors uppercase font-body text-sm ${
                value === option.value
                  ? "bg-secondary text-on-secondary font-bold"
                  : "bg-surface-container-high text-on-surface hover:bg-surface-container-highest"
              }`}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Select;
