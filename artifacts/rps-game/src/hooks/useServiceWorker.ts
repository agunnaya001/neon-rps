import { useEffect, useState } from "react";

export function useServiceWorker() {
  const [isSupported, setIsSupported] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const register = async () => {
      if (!("serviceWorker" in navigator)) {
        setIsSupported(false);
        return;
      }

      setIsSupported(true);

      try {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/",
        });

        setIsRegistered(true);

        // Check for updates periodically
        setInterval(() => {
          registration.update();
        }, 60_000);

        // Listen for updates
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
              setUpdateAvailable(true);
            }
          });
        });

        // Handle controller change
        navigator.serviceWorker.addEventListener("controllerchange", () => {
          window.location.reload();
        });
      } catch (error) {
        console.error("[SW] Registration failed:", error);
        setIsRegistered(false);
      }
    };

    register();
  }, []);

  const skipWaiting = async () => {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      const newWorker = registration.installing || registration.waiting;
      if (newWorker) {
        newWorker.postMessage({ type: "SKIP_WAITING" });
      }
    }
  };

  return { isSupported, isRegistered, updateAvailable, skipWaiting };
}
