// Platform fee configuration and calculations
export const FEE_CONFIG = {
  PLATFORM_FEE_PERCENT: 2.5, // 2.5% of each bet
  TOURNAMENT_ENTRY_FEE_PERCENT: 10, // 10% of entry fee goes to treasury
  SEASONAL_REWARD_POOL_PERCENT: 5, // 5% of fees go to seasonal rewards
};

export type FeeBreakdown = {
  betAmount: bigint;
  platformFee: bigint;
  playerWinAmount: bigint;
  treasuryAllocation: bigint;
};

/**
 * Calculate platform fee from a bet amount
 * Returns the fee amount and the player's net winning amount
 */
export function calculateFee(betAmount: bigint): FeeBreakdown {
  const feePercent = FEE_CONFIG.PLATFORM_FEE_PERCENT;
  const feeAmount = (betAmount * BigInt(Math.floor(feePercent * 100))) / BigInt(10000);
  
  return {
    betAmount,
    platformFee: feeAmount,
    playerWinAmount: betAmount * 2n - feeAmount, // 2x bet minus fee
    treasuryAllocation: feeAmount,
  };
}

/**
 * Calculate tournament entry fee breakdown
 */
export function calculateTournamentFee(entryAmount: bigint): {
  entryAmount: bigint;
  treasuryFee: bigint;
  prizePoolAmount: bigint;
} {
  const treasuryPercent = FEE_CONFIG.TOURNAMENT_ENTRY_FEE_PERCENT;
  const treasuryFee = (entryAmount * BigInt(treasuryPercent)) / BigInt(100);
  
  return {
    entryAmount,
    treasuryFee,
    prizePoolAmount: entryAmount - treasuryFee,
  };
}

/**
 * Format fee as percentage
 */
export function formatFeePercent(amount: bigint, baseAmount: bigint): string {
  if (baseAmount === 0n) return "0%";
  const percent = (Number(amount) / Number(baseAmount)) * 100;
  return percent.toFixed(2) + "%";
}

/**
 * Store treasury data locally (in production would be blockchain)
 */
export interface TreasuryData {
  totalFeesCollected: bigint;
  seasonalRewardPool: bigint;
  lastUpdated: number;
  games: Array<{
    gameId: bigint;
    fee: bigint;
    timestamp: number;
  }>;
}

const TREASURY_STORAGE_KEY = "rps_treasury_data";

export function getTreasuryData(): TreasuryData {
  const stored = localStorage.getItem(TREASURY_STORAGE_KEY);
  if (!stored) {
    return {
      totalFeesCollected: 0n,
      seasonalRewardPool: 0n,
      lastUpdated: Date.now(),
      games: [],
    };
  }
  
  try {
    const parsed = JSON.parse(stored);
    return {
      totalFeesCollected: BigInt(parsed.totalFeesCollected || 0),
      seasonalRewardPool: BigInt(parsed.seasonalRewardPool || 0),
      lastUpdated: parsed.lastUpdated || Date.now(),
      games: (parsed.games || []).map((g: any) => ({
        gameId: BigInt(g.gameId),
        fee: BigInt(g.fee),
        timestamp: g.timestamp,
      })),
    };
  } catch {
    return {
      totalFeesCollected: 0n,
      seasonalRewardPool: 0n,
      lastUpdated: Date.now(),
      games: [],
    };
  }
}

export function updateTreasuryData(gameId: bigint, fee: bigint): void {
  const treasury = getTreasuryData();
  
  treasury.totalFeesCollected += fee;
  treasury.seasonalRewardPool += (fee * BigInt(FEE_CONFIG.SEASONAL_REWARD_POOL_PERCENT)) / BigInt(100);
  treasury.lastUpdated = Date.now();
  treasury.games.push({
    gameId,
    fee,
    timestamp: Date.now(),
  });
  
  // Keep only last 1000 games
  if (treasury.games.length > 1000) {
    treasury.games = treasury.games.slice(-1000);
  }
  
  localStorage.setItem(TREASURY_STORAGE_KEY, JSON.stringify({
    totalFeesCollected: treasury.totalFeesCollected.toString(),
    seasonalRewardPool: treasury.seasonalRewardPool.toString(),
    lastUpdated: treasury.lastUpdated,
    games: treasury.games.map(g => ({
      gameId: g.gameId.toString(),
      fee: g.fee.toString(),
      timestamp: g.timestamp,
    })),
  }));
}
