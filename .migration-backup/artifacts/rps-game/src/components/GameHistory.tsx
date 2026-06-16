import { motion } from "framer-motion";
import { Link } from "wouter";
import { Trophy, Clock, DollarSign } from "lucide-react";
import { formatEther } from "viem";
import { MOVE_LABELS } from "@/lib/contract";
import { shortAddress } from "@/lib/wallet";

export interface GameHistoryItem {
  id: bigint;
  player1: string;
  player2: string;
  winner: string;
  move1: number;
  move2: number;
  bet: bigint;
  phase: number;
  timestamp?: number;
}

interface GameHistoryProps {
  games: GameHistoryItem[];
  currentAddress?: string;
  limit?: number;
}

export function GameHistory({ games, currentAddress, limit = 5 }: GameHistoryProps) {
  const displayGames = games.slice(0, limit);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    show: { opacity: 1, x: 0 },
  };

  const getGameStatus = (game: GameHistoryItem) => {
    if (game.phase === 5) return { label: "Cancelled", color: "text-muted-foreground" };
    if (game.phase === 4) return { label: "Draw", color: "text-secondary" };
    if (game.phase === 3) return { label: "Won", color: "text-accent" };
    if (game.phase === 2 || game.phase === 1) return { label: "Active", color: "text-primary" };
    return { label: "Unknown", color: "text-muted-foreground" };
  };

  const isMyGame = (game: GameHistoryItem) => {
    if (!currentAddress) return false;
    return game.player1.toLowerCase() === currentAddress.toLowerCase() || 
           game.player2.toLowerCase() === currentAddress.toLowerCase();
  };

  const didIWin = (game: GameHistoryItem) => {
    if (!currentAddress) return false;
    return game.winner.toLowerCase() === currentAddress.toLowerCase();
  };

  return (
    <div className="space-y-3">
      {displayGames.length === 0 ? (
        <div className="arcade-box p-6 text-center">
          <Clock className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
          <p className="font-mono text-sm text-muted-foreground">No game history yet</p>
        </div>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-2"
        >
          {displayGames.map((game) => {
            const status = getGameStatus(game);
            const isMe = isMyGame(game);
            const won = didIWin(game);

            return (
              <motion.div key={game.id.toString()} variants={itemVariants}>
                <Link href={`/game/${game.id}`}>
                  <div
                    className={`
                      arcade-box p-3 hover:border-primary transition-all cursor-pointer group
                      ${isMe ? "border-primary/50" : "border-border/30"}
                      ${won ? "shadow-[0_0_10px_rgba(255,255,0,0.2)]" : ""}
                    `}
                  >
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="flex items-center gap-2 min-w-0">
                        {won && <Trophy className="w-4 h-4 text-accent shrink-0" />}
                        <span className="font-mono font-bold text-sm group-hover:text-primary transition-colors">
                          #{game.id.toString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
                        <span className={status.color}>{status.label}</span>
                        <span>vs {shortAddress(game.player1 === currentAddress ? game.player2 : game.player1)}</span>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-mono ml-auto">
                        <DollarSign className="w-3 h-3 text-secondary" />
                        <span className="text-secondary">{formatEther(game.bet)}</span>
                      </div>
                    </div>

                    {game.phase >= 3 && game.move1 !== 0 && game.move2 !== 0 && (
                      <div className="mt-2 flex justify-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">P1:</span>
                          <span className="text-foreground">{MOVE_LABELS[game.move1]}</span>
                        </div>
                        <span className="text-border">|</span>
                        <div className="flex items-center gap-1">
                          <span className="text-muted-foreground">P2:</span>
                          <span className="text-foreground">{MOVE_LABELS[game.move2]}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </div>
  );
}
