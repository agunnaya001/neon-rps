import { motion, MotionProps } from "framer-motion";
import { ReactNode } from "react";

interface GlassButtonProps extends MotionProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "primary" | "secondary" | "accent";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function GlassButton({
  children,
  onClick,
  disabled = false,
  variant = "primary",
  size = "md",
  className = "",
  ...motionProps
}: GlassButtonProps) {
  const variantClasses = {
    primary: "border-primary text-primary hover:bg-primary/20",
    secondary: "border-secondary text-secondary hover:bg-secondary/20",
    accent: "border-accent text-accent hover:bg-accent/20",
  };

  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base",
  };

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className={`
        arcade-btn ${variantClasses[variant]} ${sizeClasses[size]}
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
        ${className}
      `}
      whileHover={!disabled ? { scale: 1.05 } : undefined}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      {...motionProps}
    >
      {children}
    </motion.button>
  );
}
