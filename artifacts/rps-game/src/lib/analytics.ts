/**
 * Analytics tracking for viral metrics and user engagement
 */

export type EventName =
  | "game_created"
  | "game_joined"
  | "game_won"
  | "game_lost"
  | "game_tied"
  | "game_cancelled"
  | "share_initiated"
  | "share_twitter"
  | "share_email"
  | "share_native"
  | "referral_received"
  | "achievement_unlocked"
  | "leaderboard_viewed"
  | "tournament_joined"
  | "tournament_won"
  | "wallet_connected"
  | "wallet_disconnected"
  | "page_viewed";

export interface AnalyticsEvent {
  name: EventName;
  timestamp: number;
  data?: Record<string, any>;
}

class Analytics {
  private events: AnalyticsEvent[] = [];
  private sessionStart = Date.now();
  private isEnabled = true;

  constructor() {
    // Check if analytics is disabled via local storage or window
    if (typeof window !== "undefined") {
      this.isEnabled =
        localStorage.getItem("analytics_disabled") !== "true" &&
        (window as any).__NEON_RPS_ANALYTICS !== false;
    }
  }

  track(name: EventName, data?: Record<string, any>) {
    if (!this.isEnabled) return;

    const event: AnalyticsEvent = {
      name,
      timestamp: Date.now(),
      data,
    };

    this.events.push(event);

    // Send to backend if available
    this.sendEvent(event);

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log("[Analytics]", name, data);
    }
  }

  private async sendEvent(event: AnalyticsEvent) {
    if (!import.meta.env.PROD) return;

    try {
      const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3001";
      await fetch(`${apiUrl}/api/analytics`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...event,
          sessionStart: this.sessionStart,
        }),
      });
    } catch {
      // Fail silently
    }
  }

  getEvents() {
    return [...this.events];
  }

  clearEvents() {
    this.events = [];
  }

  disable() {
    this.isEnabled = false;
    localStorage.setItem("analytics_disabled", "true");
  }

  enable() {
    this.isEnabled = true;
    localStorage.removeItem("analytics_disabled");
  }

  isActive() {
    return this.isEnabled;
  }
}

export const analytics = new Analytics();

// Viral metrics helpers
export function calculateViralCoefficient(
  invitesReceived: number,
  invitesSent: number,
): number {
  // Simple viral coefficient: how many people does each user invite?
  return invitesReceived > 0 ? invitesSent / invitesReceived : 0;
}

export function calculateRetentionRate(
  dayOneUsers: number,
  daySevenUsers: number,
): number {
  return dayOneUsers > 0 ? (daySevenUsers / dayOneUsers) * 100 : 0;
}

export function calculateEngagementScore(
  gamesPlayed: number,
  achievementsUnlocked: number,
  daysActive: number,
): number {
  // Composite engagement score (0-100)
  const gameScore = Math.min(gamesPlayed * 5, 50);
  const achievementScore = Math.min(achievementsUnlocked * 10, 30);
  const consistencyScore = Math.min(daysActive * 2, 20);
  return Math.round(gameScore + achievementScore + consistencyScore);
}
