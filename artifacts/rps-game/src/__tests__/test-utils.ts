/**
 * Test utilities and fixtures for RPS game testing
 */

export const mockGames = {
  created: {
    id: 1n,
    player1: "0x1234567890123456789012345678901234567890" as const,
    player2: "0x0000000000000000000000000000000000000000" as const,
    bet: 1000000000000000000n, // 1 ETH
    commitment1: "0xabcd" as const,
    commitment2: "0x0000000000000000000000000000000000000000000000000000000000000000" as const,
    move1: 0,
    move2: 0,
    phase: 1,
    winner: "0x0000000000000000000000000000000000000000" as const,
    joinedAt: 0n,
  },
  joined: {
    id: 1n,
    player1: "0x1234567890123456789012345678901234567890" as const,
    player2: "0x0987654321098765432109876543210987654321" as const,
    bet: 1000000000000000000n,
    commitment1: "0xabcd" as const,
    commitment2: "0xdef0" as const,
    move1: 0,
    move2: 0,
    phase: 2,
    winner: "0x0000000000000000000000000000000000000000" as const,
    joinedAt: Math.floor(Date.now() / 1000),
  },
  resolved: {
    id: 1n,
    player1: "0x1234567890123456789012345678901234567890" as const,
    player2: "0x0987654321098765432109876543210987654321" as const,
    bet: 1000000000000000000n,
    commitment1: "0xabcd" as const,
    commitment2: "0xdef0" as const,
    move1: 1, // Rock
    move2: 2, // Paper
    phase: 4,
    winner: "0x0987654321098765432109876543210987654321" as const,
    joinedAt: Math.floor(Date.now() / 1000),
  },
};

export const mockPlayers = {
  alice: "0x1234567890123456789012345678901234567890",
  bob: "0x0987654321098765432109876543210987654321",
  charlie: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
};

export const mockMoves = {
  rock: 0,
  paper: 1,
  scissors: 2,
};

// Simulate wallet connections
export const mockWallet = {
  address: "0x1234567890123456789012345678901234567890" as const,
  chain: 8453, // Base mainnet
  balance: 10000000000000000000n, // 10 ETH
};

// Error scenarios
export const mockErrors = {
  userRejected: new Error("User rejected the request"),
  insufficientFunds: new Error("Insufficient funds"),
  networkError: new Error("Network request failed"),
  contractError: new Error("WrongPhase"),
};

// Test helpers
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createMockGame(overrides = {}) {
  return {
    ...mockGames.created,
    ...overrides,
  };
}

export function generateRandomAddress(): `0x${string}` {
  return `0x${Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}` as `0x${string}`;
}

export function generateRandomHash(): `0x${string}` {
  return `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")}` as `0x${string}`;
}

// Assertion helpers
export function assertGameState(
  game: any,
  expected: Partial<typeof mockGames.created>,
) {
  for (const [key, value] of Object.entries(expected)) {
    if (game[key] !== value) {
      throw new Error(`Game ${key}: expected ${value}, got ${game[key]}`);
    }
  }
}

export function assertPlayerWon(
  game: typeof mockGames.resolved,
  playerAddress: string,
) {
  if (game.winner.toLowerCase() !== playerAddress.toLowerCase()) {
    throw new Error(`Expected ${playerAddress} to win, but ${game.winner} won`);
  }
}

// Performance testing
export async function measurePerformance(
  fn: () => Promise<any>,
  label: string,
): Promise<number> {
  const start = performance.now();
  await fn();
  const duration = performance.now() - start;
  console.log(`[Perf] ${label}: ${duration.toFixed(2)}ms`);
  return duration;
}
