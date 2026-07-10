import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rpsGames, rpsPlayers, rpsPlayerStats } from '@/lib/db/schema';
import { eq, desc } from 'drizzle-orm';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  // Verify cron secret if set
  const authHeader = request.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET || 'development';

  if (authHeader !== `Bearer ${cronSecret}` && process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[Cron] Starting stats sync...');

    // Get all players
    const players = await db.select().from(rpsPlayers);

    let updatedCount = 0;

    for (const player of players) {
      // Get player's games (as player1 or player2)
      const playerGames = await db
        .select()
        .from(rpsGames)
        .where(
          ({ player1_id, player2_id, status }) =>
            (player1_id === player.id || player2_id === player.id) && 
            status === 'completed'
        )
        .orderBy(desc(rpsGames.completed_at));

      if (playerGames.length === 0) continue;

      // Calculate stats
      const wins = playerGames.filter((g) => g.winner_id === player.id).length;
      const total = playerGames.length;
      const winRate = (wins / total) * 100;
      const totalEarnings = playerGames
        .filter((g) => g.winner_id === player.id)
        .reduce((sum, g) => sum + (g.payout_amount || 0n), 0n);

      // Find current streak
      let currentStreak = 0;
      for (const game of playerGames) {
        if (game.winner_id === player.id) {
          currentStreak++;
        } else {
          break;
        }
      }

      // Find best streak
      let bestStreak = 0;
      let tempStreak = 0;
      for (const game of playerGames) {
        if (game.winner_id === player.id) {
          tempStreak++;
          bestStreak = Math.max(bestStreak, tempStreak);
        } else {
          tempStreak = 0;
        }
      }

      // Calculate average pot
      const avgPot = playerGames.length > 0
        ? playerGames.reduce((sum, g) => sum + g.bet_amount, 0n) / BigInt(playerGames.length)
        : 0n;

      // Update or create stats
      const existingStats = await db
        .select()
        .from(rpsPlayerStats)
        .where(eq(rpsPlayerStats.player_id, player.id))
        .limit(1);

      if (existingStats.length > 0) {
        await db
          .update(rpsPlayerStats)
          .set({
            win_rate: Math.min(winRate, 100),
            current_streak: currentStreak,
            best_streak: bestStreak,
            avg_pot_size: avgPot,
            total_volume: BigInt(total),
            last_game_at: playerGames[0].completed_at,
            updated_at: new Date(),
          })
          .where(eq(rpsPlayerStats.player_id, player.id));
      } else {
        await db.insert(rpsPlayerStats).values({
          player_id: player.id,
          win_rate: Math.min(winRate, 100),
          current_streak: currentStreak,
          best_streak: bestStreak,
          avg_pot_size: avgPot,
          total_volume: BigInt(total),
          last_game_at: playerGames[0].completed_at,
        });
      }

      updatedCount++;
    }

    console.log(`[Cron] Updated stats for ${updatedCount} players`);

    return NextResponse.json({
      success: true,
      message: `Updated stats for ${updatedCount} players`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron] Error syncing stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
