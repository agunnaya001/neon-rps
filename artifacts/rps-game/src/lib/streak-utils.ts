export interface GameResult {
  id: bigint;
  player1: string;
  player2: string;
  winner: string;
  phase: number;
}

/**
 * Calculate current and best win streaks for a player
 */
export function calculateStreaks(
  games: GameResult[],
  playerAddress: string | undefined
): {
  currentStreak: number;
  bestStreak: number;
} {
  if (!playerAddress) return { currentStreak: 0, bestStreak: 0 };

  const me = playerAddress.toLowerCase();

  // Filter completed games where player participated
  const completedGames = games
    .filter((g) => g.phase === 3 && (g.player1.toLowerCase() === me || g.player2.toLowerCase() === me))
    .sort((a, b) => {
      // Sort by game ID descending (most recent first)
      if (typeof a.id === "bigint" && typeof b.id === "bigint") {
        return a.id > b.id ? -1 : 1;
      }
      return 0;
    });

  let currentStreak = 0;
  let bestStreak = 0;
  let tempStreak = 0;

  for (const game of completedGames) {
    const didIWin = game.winner.toLowerCase() === me;

    if (didIWin) {
      tempStreak++;
      currentStreak = tempStreak;
      bestStreak = Math.max(bestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  return { currentStreak, bestStreak };
}

/**
 * Get streak milestone messages
 */
export function getStreakMilestone(streak: number): string | null {
  if (streak >= 10) return "Unstoppable champion!";
  if (streak >= 5) return "On fire! Keep going";
  if (streak >= 3) return "Hot streak!";
  return null;
}
