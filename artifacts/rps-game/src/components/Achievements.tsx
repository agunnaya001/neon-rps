import { motion } from "framer-motion";
import { Star, Flame, Zap, Crown, Target, Trophy } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  unlocked: boolean;
}

interface AchievementsProps {
  wins: number;
  losses: number;
  ties: number;
  totalGames: number;
}

export function Achievements({ wins, losses, ties, totalGames }: AchievementsProps) {
  const achievements: Achievement[] = [
    {
      id: "first-win",
      name: "First Blood",
      description: "Win your first duel",
      icon: <Flame className="w-5 h-5" />,
      color: "text-red-500",
      unlocked: wins >= 1,
    },
    {
      id: "five-wins",
      name: "Duelist",
      description: "Achieve 5 victories",
      icon: <Trophy className="w-5 h-5" />,
      color: "text-amber-500",
      unlocked: wins >= 5,
    },
    {
      id: "ten-wins",
      name: "Warrior",
      description: "Achieve 10 victories",
      icon: <Crown className="w-5 h-5" />,
      color: "text-yellow-500",
      unlocked: wins >= 10,
    },
    {
      id: "perfect-series",
      name: "Perfect Series",
      description: "Win 3 games in a row",
      icon: <Star className="w-5 h-5" />,
      color: "text-cyan-400",
      unlocked: false,
    },
    {
      id: "high-roller",
      name: "High Roller",
      description: "Play 10 games",
      icon: <Zap className="w-5 h-5" />,
      color: "text-blue-500",
      unlocked: totalGames >= 10,
    },
    {
      id: "balanced",
      name: "Balanced Fighter",
      description: "Achieve equal W/L ratio",
      icon: <Target className="w-5 h-5" />,
      color: "text-green-500",
      unlocked: wins > 0 && losses > 0 && wins === losses,
    },
  ];

  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    show: { opacity: 1, scale: 1 },
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold arcade-text text-foreground">Achievements</h3>
        <span className="text-xs font-mono bg-primary/20 text-primary px-2 py-1 border border-primary/30 rounded">
          {unlockedCount}/{achievements.length}
        </span>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="grid grid-cols-3 gap-2"
      >
        {achievements.map((achievement) => (
          <motion.div key={achievement.id} variants={itemVariants}>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className={`
                    w-full arcade-box p-3 flex flex-col items-center justify-center gap-2 transition-all
                    ${
                      achievement.unlocked
                        ? `border-${achievement.color} shadow-[0_0_15px_var(--tw-shadow-color)] shadow-${achievement.color}/40 hover:scale-110`
                        : "border-border/30 opacity-40 hover:opacity-60"
                    }
                  `}
                >
                  <div className={achievement.unlocked ? achievement.color : "text-muted-foreground/50"}>
                    {achievement.icon}
                  </div>
                  <span className="text-[10px] font-bold arcade-text text-center leading-tight">
                    {achievement.name}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs font-mono">
                <p>{achievement.name}</p>
                <p className="text-muted-foreground text-[10px]">{achievement.description}</p>
              </TooltipContent>
            </Tooltip>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
