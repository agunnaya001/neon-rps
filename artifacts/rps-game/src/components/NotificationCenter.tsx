import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, AlertCircle, CheckCircle2, Zap } from "lucide-react";
import { toast } from "sonner";

export type NotificationType = "achievement" | "win" | "loss" | "referral" | "warning" | "info";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  duration?: number;
}

const notificationConfig: Record<NotificationType, { icon: any; color: string; bgColor: string }> = {
  achievement: { icon: Trophy, color: "text-yellow-400", bgColor: "bg-yellow-500/10" },
  win: { icon: CheckCircle2, color: "text-green-400", bgColor: "bg-green-500/10" },
  loss: { icon: AlertCircle, color: "text-red-400", bgColor: "bg-red-500/10" },
  referral: { icon: Zap, color: "text-primary", bgColor: "bg-primary/10" },
  warning: { icon: AlertCircle, color: "text-orange-400", bgColor: "bg-orange-500/10" },
  info: { icon: CheckCircle2, color: "text-cyan-400", bgColor: "bg-cyan-500/10" },
};

let notificationId = 0;
let listeners: ((notifications: Notification[]) => void)[] = [];
let activeNotifications: Notification[] = [];

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const listener = (notifs: Notification[]) => {
      setNotifications(notifs);
    };
    listeners.push(listener);
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  }, []);

  const notify = (notification: Omit<Notification, "id">) => {
    const id = `notif-${++notificationId}`;
    const fullNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 4000,
    };

    activeNotifications = [...activeNotifications, fullNotification];
    notifyListeners();

    if (fullNotification.duration) {
      setTimeout(() => {
        removeNotification(id);
      }, fullNotification.duration);
    }

    return id;
  };

  const removeNotification = (id: string) => {
    activeNotifications = activeNotifications.filter((n) => n.id !== id);
    notifyListeners();
  };

  return { notifications, notify, removeNotification };
}

function notifyListeners() {
  listeners.forEach((listener) => listener(activeNotifications));
}

export function NotificationCenter() {
  const { notifications, removeNotification } = useNotifications();

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm space-y-2 pointer-events-none sm:bottom-24 sm:top-auto">
      <AnimatePresence mode="popLayout">
        {notifications.map((notification) => (
          <NotificationItem
            key={notification.id}
            notification={notification}
            onDismiss={() => removeNotification(notification.id)}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

function NotificationItem({
  notification,
  onDismiss,
}: {
  notification: Notification;
  onDismiss: () => void;
}) {
  const config = notificationConfig[notification.type];
  const Icon = config.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`${config.bgColor} border border-primary/30 arcade-box p-4 space-y-2 pointer-events-auto`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${config.color}`} />
          <div className="flex-1">
            <h3 className="font-bold text-sm uppercase tracking-wider text-foreground">
              {notification.title}
            </h3>
            <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="text-muted-foreground hover:text-foreground flex-shrink-0 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {notification.action && (
        <div className="pt-2 border-t border-primary/20">
          {notification.action.href ? (
            <a
              href={notification.action.href}
              className="text-xs font-mono uppercase text-primary hover:underline"
            >
              {notification.action.label} →
            </a>
          ) : (
            <button
              onClick={() => {
                notification.action?.onClick?.();
                onDismiss();
              }}
              className="text-xs font-mono uppercase text-primary hover:underline"
            >
              {notification.action.label} →
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
}
