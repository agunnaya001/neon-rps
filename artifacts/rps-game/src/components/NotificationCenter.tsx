import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Zap, Trophy, TrendingUp, AlertCircle } from "lucide-react";
import { useState, useCallback } from "react";

export interface Notification {
  id: string;
  type: "success" | "achievement" | "streak" | "warning";
  title: string;
  message: string;
  icon?: React.ReactNode;
  duration?: number;
}

interface NotificationCenterProps {
  notifications: Notification[];
  onDismiss: (id: string) => void;
}

const getNotificationConfig = (type: string) => {
  switch (type) {
    case "achievement":
      return {
        icon: Trophy,
        borderColor: "border-accent",
        bgColor: "bg-accent/10",
        iconColor: "text-accent",
      };
    case "streak":
      return {
        icon: TrendingUp,
        borderColor: "border-primary",
        bgColor: "bg-primary/10",
        iconColor: "text-primary",
      };
    case "success":
      return {
        icon: Zap,
        borderColor: "border-secondary",
        bgColor: "bg-secondary/10",
        iconColor: "text-secondary",
      };
    case "warning":
      return {
        icon: AlertCircle,
        borderColor: "border-destructive",
        bgColor: "bg-destructive/10",
        iconColor: "text-destructive",
      };
    default:
      return {
        icon: Bell,
        borderColor: "border-primary",
        bgColor: "bg-primary/10",
        iconColor: "text-primary",
      };
  }
};

export function NotificationCenter({
  notifications,
  onDismiss,
}: NotificationCenterProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-3 max-w-xs pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map((notif) => {
          const config = getNotificationConfig(notif.type);
          const Icon = config.icon;

          return (
            <motion.div
              key={notif.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", damping: 15, stiffness: 300 }}
              className={`arcade-box ${config.borderColor} ${config.bgColor} p-4 pointer-events-auto`}
            >
              <div className="flex items-start gap-3">
                <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${config.iconColor}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-bold arcade-text text-sm leading-tight">
                    {notif.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {notif.message}
                  </p>
                </div>
                <button
                  onClick={() => onDismiss(notif.id)}
                  className="shrink-0 ml-2 hover:opacity-70 transition-opacity"
                >
                  <X className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
