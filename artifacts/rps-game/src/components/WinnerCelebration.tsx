import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

export function WinnerCelebration({ trigger }: { trigger: boolean }) {
  const fired = useRef(false);

  useEffect(() => {
    if (!trigger || fired.current) return;
    fired.current = true;

    const end = Date.now() + 2_500;
    const neonColors = ["#ff00ff", "#00ffff", "#ffff00", "#ff66ff", "#66ffff"];

    const burst = (originX: number) => {
      confetti({
        particleCount: 60,
        startVelocity: 55,
        spread: 70,
        ticks: 200,
        origin: { x: originX, y: 0.6 },
        colors: neonColors,
        scalar: 1.1,
      });
    };

    burst(0.2);
    burst(0.8);

    const interval = window.setInterval(() => {
      if (Date.now() > end) {
        window.clearInterval(interval);
        return;
      }
      confetti({
        particleCount: 30,
        startVelocity: 35,
        spread: 360,
        ticks: 120,
        origin: { x: Math.random(), y: Math.random() * 0.4 + 0.1 },
        colors: neonColors,
      });
    }, 250);

    return () => window.clearInterval(interval);
  }, [trigger]);

  return null;
}
