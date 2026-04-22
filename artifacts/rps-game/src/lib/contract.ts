import { COMMIT_REVEAL_RPS_ABI } from "./contract-abi";

export { COMMIT_REVEAL_RPS_ABI };

const RAW_ADDRESS =
  (import.meta.env.VITE_CONTRACT_ADDRESS as string | undefined) ?? "";

const RAW_CHAIN_ID = Number(
  (import.meta.env.VITE_CHAIN_ID as string | undefined) ?? "31337",
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
] as const;
export type PhaseValue = 0 | 1 | 2 | 3 | 4;

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
