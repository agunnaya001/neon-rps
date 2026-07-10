import { COMMIT_REVEAL_RPS_ABI } from "./contract-abi";

export { COMMIT_REVEAL_RPS_ABI };

// Base Mainnet (chainId 8453) - Live Contracts
export const COMMIT_REVEAL_RPS_ADDRESS = "0x2F2e814aFd9DEb94a23b990725E5C6EF67fC7AAD" as const;
export const BEST_OF_THREE_RPS_ADDRESS = "0x053ac43369DE4B87987689d1cb352A15AB771c40" as const;
export const TREASURY_WALLET_ADDRESS = "0xFfb6505912FCE95B42be4860477201bb4e204E9f" as const;

const RAW_ADDRESS =
  (import.meta.env.VITE_CONTRACT_ADDRESS as string | undefined) ?? COMMIT_REVEAL_RPS_ADDRESS;

const RAW_CHAIN_ID = Number(
  (import.meta.env.VITE_CHAIN_ID as string | undefined) ?? "8453", // Base Mainnet
);

function isValidAddress(addr: string): addr is `0x${string}` {
  return /^0x[a-fA-F0-9]{40}$/.test(addr);
}

export const CONTRACT_ADDRESS: `0x${string}` | null = isValidAddress(RAW_ADDRESS)
  ? (RAW_ADDRESS as `0x${string}`)
  : null;

export const CHAIN_ID = RAW_CHAIN_ID;

export const Move = {
  None: 0,
  Rock: 1,
  Paper: 2,
  Scissors: 3,
} as const;
export type MoveValue = (typeof Move)[keyof typeof Move];
export type PlayableMove = 1 | 2 | 3;

export const PHASE_LABELS = [
  "Empty",
  "Waiting for opponent",
  "Waiting for reveals",
  "Resolved",
  "Refunded (tie)",
  "Cancelled",
] as const;
export type PhaseValue = 0 | 1 | 2 | 3 | 4 | 5;

export const REVEAL_TIMEOUT_SECONDS = 24 * 60 * 60;

export const MOVE_LABELS: Record<number, string> = {
  0: "—",
  1: "Rock",
  2: "Paper",
  3: "Scissors",
};

export function moveBeats(a: PlayableMove, b: PlayableMove): boolean {
  return (
    (a === Move.Rock && b === Move.Scissors) ||
    (a === Move.Paper && b === Move.Rock) ||
    (a === Move.Scissors && b === Move.Paper)
  );
}
