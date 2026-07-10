import { motion } from "framer-motion";
import { Flame, Zap, Target } from "lucide-react";

interface PlayerStatsProps {
  wins: number;
  losses: number;
  ties: number;
  showAnimations?: boolean;
}

export function PlayerStats({ wins, losses, ties, showAnimations = true }: PlayerStatsProps) {
  const total = wins + losses + ties;
  const winRate = total > 0 ? ((wins / total) * 100).toFixed(1) : "0";

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    show: { opacity: 1, scale: 1 },
  };

  const StatCard = ({ label, value, icon: Icon, color, intensity }: any) => (
    <motion.div
      variants={showAnimations ? itemVariants : undefined}
      className={`arcade-box p-4 text-center border-${color}/50 shadow-[0_0_10px_rgba(var(--color-${color}),0.${intensity})]`}
    >
      <div className="flex items-center justify-center gap-2 mb-2">
        <Icon className={`w-4 h-4 text-${color}`} />
        <div className="text-xs font-mono text-muted-foreground uppercase">{label}</div>
      </div>
      <motion.div
        className={`text-3xl font-black arcade-text text-${color}`}
        initial={showAnimations ? { opacity: 0 } : undefined}
        animate={showAnimations ? { opacity: 1 } : undefined}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        {value}
      </motion.div>
    </motion.div>
  );

  return (
    <motion.div
      variants={showAnimations ? containerVariants : undefined}
      initial={showAnimations ? "hidden" : undefined}
      animate={showAnimations ? "show" : undefined}
      className="space-y-4"
    >
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Wins" value={wins} icon={Flame} color="accent" intensity="20" />
        <StatCard label="Losses" value={losses} icon={Zap} color="destructive" intensity="20" />
        <StatCard label="Ties" value={ties} icon={Target} color="secondary" intensity="15" />
      </div>

      {total > 0 && (
        <motion.div
          variants={showAnimations ? itemVariants : undefined}
          className="arcade-box p-4 flex justify-between items-center"
        >
          <span className="font-mono text-xs text-muted-foreground uppercase">Win Rate</span>
          <div className="text-2xl font-black arcade-text text-primary">{winRate}%</div>
        </motion.div>
      )}
    </motion.div>
  );
}
