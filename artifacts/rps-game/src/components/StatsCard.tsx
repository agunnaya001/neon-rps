import { motion } from "framer-motion";
import { ReactNode } from "react";

interface StatsCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  subtext?: string;
  color?: "primary" | "secondary" | "accent" | "destructive";
  gradient?: boolean;
  animated?: boolean;
}

const colorClasses = {
  primary: "border-primary/50 text-primary",
  secondary: "border-secondary/50 text-secondary",
  accent: "border-accent/50 text-accent",
  destructive: "border-destructive/50 text-destructive",
};

const shadowClasses = {
  primary: "shadow-[0_0_15px_rgba(255,0,255,0.2)]",
  secondary: "shadow-[0_0_15px_rgba(0,255,255,0.2)]",
  accent: "shadow-[0_0_15px_rgba(255,255,0,0.2)]",
  destructive: "shadow-[0_0_15px_rgba(255,0,0,0.2)]",
};

export function StatsCard({
  icon,
  label,
  value,
  subtext,
  color = "primary",
  gradient = false,
  animated = false,
}: StatsCardProps) {
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 },
  };

  const valueVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1 },
  };

  return (
    <motion.div
      variants={animated ? cardVariants : undefined}
      initial={animated ? "hidden" : undefined}
      animate={animated ? "show" : undefined}
      className={`
        arcade-box p-4 flex flex-col items-center justify-center space-y-2
        ${colorClasses[color]} ${shadowClasses[color]}
        ${gradient ? "bg-gradient-to-br from-background/80 to-background/40" : ""}
      `}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        animate={animated ? { rotate: [0, 10, -10, 0] } : {}}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {icon}
      </motion.div>

      <div className="text-xs font-mono text-muted-foreground uppercase tracking-widest">
        {label}
      </div>

      <motion.div
        variants={animated ? valueVariants : undefined}
        className="text-3xl font-black arcade-text"
        animate={animated ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
      >
        {value}
      </motion.div>

      {subtext && (
        <div className="text-xs text-muted-foreground/80">{subtext}</div>
      )}
    </motion.div>
  );
}
