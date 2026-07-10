import { useEffect, useState } from "react";

export type NetworkStatus = "online" | "offline" | "slow";

export function useNetworkStatus() {
  const [status, setStatus] = useState<NetworkStatus>("online");
  const [latency, setLatency] = useState<number | null>(null);

  useEffect(() => {
    const handleOnline = () => setStatus("online");
    const handleOffline = () => setStatus("offline");

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check initial state
    if (!navigator.onLine) {
      setStatus("offline");
    }

    // Periodic latency check
    const checkLatency = async () => {
      const start = performance.now();
      try {
        const response = await fetch("/", { method: "HEAD", cache: "no-store" });
        if (response.ok) {
          const latencyMs = Math.round(performance.now() - start);
          setLatency(latencyMs);
          setStatus(latencyMs > 3000 ? "slow" : "online");
        }
      } catch {
        setStatus("offline");
        setLatency(null);
      }
    };

    // Check every 30 seconds
    const interval = setInterval(checkLatency, 30_000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  return { status, latency, isOnline: status !== "offline" };
}
