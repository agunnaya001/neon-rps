import { useEffect, useState } from "react";

function fmt(secs: number): string {
  if (secs <= 0) return "00:00:00";
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  return [h, m, s].map((n) => String(n).padStart(2, "0")).join(":");
}

export function CountdownTimer({
  deadlineSecs,
  className = "",
  onExpire,
}: {
  deadlineSecs: bigint;
  className?: string;
  onExpire?: () => void;
}) {
  const [now, setNow] = useState(() => Math.floor(Date.now() / 1000));
  const [fired, setFired] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(t);
  }, []);

  const remaining = Number(deadlineSecs) - now;

  useEffect(() => {
    if (remaining <= 0 && !fired) {
      setFired(true);
      onExpire?.();
    }
  }, [remaining, fired, onExpire]);

  const expired = remaining <= 0;

  return (
    <span
      className={`font-mono tabular-nums ${expired ? "text-destructive" : "text-accent"} ${className}`}
    >
      {expired ? "DEADLINE PASSED" : fmt(remaining)}
    </span>
  );
}
