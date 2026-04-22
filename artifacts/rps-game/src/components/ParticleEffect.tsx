import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

interface ParticleEffectProps {
  trigger: boolean;
  type?: "confetti" | "sparkles" | "explosion";
  color?: string;
  position?: { x: number; y: number };
}

export function ParticleEffect({
  trigger,
  type = "confetti",
  color = "#ffff00",
  position = { x: 0.5, y: 0.5 },
}: ParticleEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    if (!trigger || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Create particles
    const particleCount = type === "explosion" ? 50 : type === "sparkles" ? 30 : 40;
    const newParticles: Particle[] = [];

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount + (Math.random() - 0.5);
      const velocity = 5 + Math.random() * 10;

      newParticles.push({
        x: position.x * canvas.width,
        y: position.y * canvas.height,
        vx: Math.cos(angle) * velocity,
        vy: Math.sin(angle) * velocity,
        life: 1,
        color:
          type === "confetti"
            ? ["#ff00ff", "#00ffff", "#ffff00"][Math.floor(Math.random() * 3)]
            : color,
        size: 4 + Math.random() * 6,
      });
    }

    particlesRef.current = newParticles;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      let hasAlive = false;

      for (let i = particlesRef.current.length - 1; i >= 0; i--) {
        const p = particlesRef.current[i];

        if (p.life <= 0) {
          particlesRef.current.splice(i, 1);
          continue;
        }

        hasAlive = true;

        // Physics
        p.vy += 0.2; // gravity
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.01;

        // Draw
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = p.color;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;

      if (hasAlive) {
        animationRef.current = requestAnimationFrame(animate);
      }
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [trigger, type, color, position]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-40"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
