import { motion } from "framer-motion";
import { Flame, Zap } from "lucide-react";

interface WinStreakProps {
  currentStreak: number;
  bestStreak: number;
  showAnimation?: boolean;
}

export function WinStreak({
  currentStreak,
  bestStreak,
  showAnimation = true,
}: WinStreakProps) {
  const isOnFire = currentStreak >= 3;

  const streakVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    show: { opacity: 1, scale: 1 },
    pulse: {
      scale: [1, 1.1, 1],
      transition: { duration: 0.5, repeat: Infinity, repeatDelay: 2 },
    },
  };

  return (
    <motion.div
      variants={showAnimation ? streakVariants : undefined}
      initial={showAnimation ? "hidden" : undefined}
      animate={showAnimation ? ["show", isOnFire ? "pulse" : "show"] : undefined}
      className="space-y-3"
    >
      {/* Current Streak */}
      {currentStreak > 0 && (
        <motion.div
          className={`
            arcade-box p-4 flex items-center justify-between
            ${
              isOnFire
                ? "border-accent shadow-[0_0_20px_rgba(255,255,0,0.3)]"
                : "border-primary/50"
            }
          `}
          animate={showAnimation && isOnFire ? { y: [0, -5, 0] } : undefined}
          transition={{ duration: 1, repeat: Infinity }}
        >
          <div className="flex items-center gap-3">
            <motion.div animate={isOnFire ? { rotate: 360 } : {}} transition={{ duration: 2, repeat: Infinity }}>
              <Flame className={`w-5 h-5 ${isOnFire ? "text-accent" : "text-primary"}`} />
            </motion.div>
            <div>
              <p className="text-xs font-mono text-muted-foreground uppercase">
                Current Streak
              </p>
              <p className={`text-2xl font-black arcade-text ${isOnFire ? "text-accent" : "text-primary"}`}>
                {currentStreak}
              </p>
            </div>
          </div>
          {isOnFire && (
            <motion.div
              animate={{ rotate: [0, 15, -15, 0] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 1 }}
              className="text-accent"
            >
              <Zap className="w-6 h-6" />
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Best Streak */}
      {bestStreak > 0 && (
        <div className="arcade-box p-4 flex items-center justify-between border-secondary/50">
          <div>
            <p className="text-xs font-mono text-muted-foreground uppercase">
              Best Streak
            </p>
            <p className="text-2xl font-black arcade-text text-secondary">
              {bestStreak}
            </p>
          </div>
        </div>
      )}

      {/* Streak milestone messages */}
      {currentStreak === 3 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="arcade-box p-3 text-center bg-accent/10 border-accent/50"
        >
          <p className="text-xs font-mono text-accent uppercase font-bold">
            Hot Streak! Keep it going
          </p>
        </motion.div>
      )}
      {currentStreak === 5 && (
        <motion.div
          initial={{ opacity: 0, y: -10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="arcade-box p-3 text-center bg-accent/10 border-accent shadow-[0_0_15px_rgba(255,255,0,0.3)]"
        >
          <p className="text-xs font-mono text-accent uppercase font-bold">
            On Fire! Unstoppable
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}
