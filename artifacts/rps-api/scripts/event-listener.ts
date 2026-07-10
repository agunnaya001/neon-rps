import { createPublicClient, http, parseAbiItem } from 'viem';
import { baseSepolia } from 'viem/chains';
import { db } from '../lib/db';
import { rpsGames, rpsPlayers, rpsPlayerStats } from '../lib/db/schema';
import { eq, and } from 'drizzle-orm';

const RPC_URL = process.env.BASE_RPC_URL || 'https://sepolia.base.org';
const COMMIT_REVEAL_RPS = '0x2F2e814aFd9DEb94a23b990725E5C6EF67fC7AAD';
const BEST_OF_THREE_RPS = '0x053ac43369DE4B87987689d1cb352A15AB771c40';

const client = createPublicClient({
  chain: baseSepolia,
  transport: http(RPC_URL),
});

// Event signatures
const gameCreatedAbi = parseAbiItem(
  'event GameCreated(uint256 indexed gameId, address indexed player1, uint256 bet)'
);
const gameJoinedAbi = parseAbiItem(
  'event GameJoined(uint256 indexed gameId, address indexed player2)'
);
const gameResolvedAbi = parseAbiItem(
  'event GameResolved(uint256 indexed gameId, address indexed winner, uint256 payout, uint256 fee)'
);

export async function startEventListener() {
  console.log('[EventListener] Starting game event listener...');
  console.log(`[EventListener] Monitoring contracts:`);
  console.log(`  - CommitRevealRPS: ${COMMIT_REVEAL_RPS}`);
  console.log(`  - BestOfThreeRPS: ${BEST_OF_THREE_RPS}`);

  // Poll for new blocks and listen for events
  let lastBlock = 0;

  async function pollEvents() {
    try {
      const blockNumber = await client.getBlockNumber();

      if (blockNumber > lastBlock) {
        console.log(`[EventListener] New block: ${blockNumber}, checking for events...`);
        
        // Get events from commit-reveal contract
        const crEvents = await client.getLogs({
          address: COMMIT_REVEAL_RPS,
          fromBlock: BigInt(lastBlock + 1),
          toBlock: blockNumber,
        });

        // Get events from best-of-three contract
        const botEvents = await client.getLogs({
          address: BEST_OF_THREE_RPS,
          fromBlock: BigInt(lastBlock + 1),
          toBlock: blockNumber,
        });

        const allEvents = [...crEvents, ...botEvents];

        if (allEvents.length > 0) {
          console.log(`[EventListener] Found ${allEvents.length} events`);
          
          for (const event of allEvents) {
            await processEvent(event, event.address === COMMIT_REVEAL_RPS ? 'single' : 'best_of_three');
          }
        }

        lastBlock = Number(blockNumber);
      }

      // Poll again in 12 seconds
      setTimeout(pollEvents, 12000);
    } catch (error) {
      console.error('[EventListener] Error polling events:', error);
      setTimeout(pollEvents, 30000); // Retry after 30s on error
    }
  }

  pollEvents();
}

async function processEvent(event: any, gameType: 'single' | 'best_of_three') {
  try {
    const signature = event.topics[0];

    // Parse event data based on signature
    if (signature === gameCreatedAbi.inputs[0].name) {
      console.log(`[EventListener] Game created: ${event.data}`);
      // Insert game record
    } else if (signature === gameJoinedAbi.inputs[0].name) {
      console.log(`[EventListener] Game joined: ${event.data}`);
      // Update game status
    } else if (signature === gameResolvedAbi.inputs[0].name) {
      console.log(`[EventListener] Game resolved: ${event.data}`);
      // Update game results and player stats
      await updatePlayerStats();
    }
  } catch (error) {
    console.error('[EventListener] Error processing event:', error);
  }
}

async function updatePlayerStats() {
  try {
    // Get all games with results
    const games = await db
      .select()
      .from(rpsGames)
      .where(eq(rpsGames.status, 'completed'));

    for (const game of games) {
      if (!game.winner_id) continue;

      const winnerStats = await db
        .select()
        .from(rpsPlayerStats)
        .where(eq(rpsPlayerStats.player_id, game.winner_id))
        .limit(1);

      if (winnerStats.length === 0) continue;

      const stat = winnerStats[0];
      const totalGames = game.player1_id === game.winner_id
        ? stat.games_this_week + 1
        : stat.games_this_week;

      const winRate = stat.total_volume > 0
        ? ((stat.total_volume + (game.winner_id === game.player1_id ? 1 : 0)) / totalGames) * 100
        : 0;

      await db
        .update(rpsPlayerStats)
        .set({
          win_rate: Math.min(winRate, 100),
          current_streak: stat.current_streak + 1,
          best_streak: Math.max(stat.best_streak, stat.current_streak + 1),
          last_game_at: new Date(),
        })
        .where(eq(rpsPlayerStats.player_id, game.winner_id));
    }
  } catch (error) {
    console.error('[EventListener] Error updating player stats:', error);
  }
}

// Start listener if run directly
if (require.main === module) {
  startEventListener().catch(console.error);
}

export default startEventListener;
