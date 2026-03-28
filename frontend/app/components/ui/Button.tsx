"use client";

import React from "react";

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  icon?: string;
}

const Button = ({
  children,
  onClick,
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  type = "button",
  icon,
}: ButtonProps) => {
  const baseStyles =
    "cursor-pointer font-body font-extrabold uppercase tracking-widest transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const variantStyles = {
    primary:
      "bg-secondary text-on-secondary hover:bg-secondary-dim active:scale-95",
    secondary:
      "bg-surface-container text-on-surface border border-outline-variant hover:bg-surface-container-high active:scale-95",
    danger: "bg-error text-on-error hover:bg-error-dim active:scale-95",
    outline:
      "border-2 border-primary text-primary hover:bg-primary/10 active:scale-95",
  };

  const sizeStyles = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-6 py-4 text-lg",
  };

  const styles = `${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={styles}
    >
      {icon && (
        <span className="material-symbols-outlined text-sm" data-weight="fill">
          {icon}
        </span>
      )}
      {children}
    </button>
  );
};

export default Button;
