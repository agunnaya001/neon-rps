import {
  encodeAbiParameters,
  keccak256,
  parseAbiParameters,
} from "viem";
import type { PlayableMove } from "./contract";
import { generateSalt } from "./salt-store";

export type SeriesCommitment = {
  seriesId: string;
  round: number;
  player: `0x${string}`;
  move: PlayableMove;
  salt: `0x${string}`;
  savedAt: number;
};

const KEY_PREFIX = "bot3:commit:";

function key(seriesId: bigint | string, round: number, player: `0x${string}`): string {
  return `${KEY_PREFIX}${seriesId.toString()}:r${round}:${player.toLowerCase()}`;
}

export { generateSalt };

export function computeSeriesCommitment(
  player: `0x${string}`,
  move: PlayableMove,
  salt: `0x${string}`,
): `0x${string}` {
  const encoded = encodeAbiParameters(
    parseAbiParameters("address, uint8, bytes32"),
    [player, move, salt],
  );
  return keccak256(encoded);
}

export function saveSeriesCommitment(c: SeriesCommitment): void {
  localStorage.setItem(key(c.seriesId, c.round, c.player), JSON.stringify(c));
}

export function loadSeriesCommitment(
  seriesId: bigint | string,
  round: number,
  player: `0x${string}`,
): SeriesCommitment | null {
  const raw = localStorage.getItem(key(seriesId, round, player));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SeriesCommitment;
  } catch {
    return null;
  }
}

export function clearSeriesCommitment(
  seriesId: bigint | string,
  round: number,
  player: `0x${string}`,
): void {
  localStorage.removeItem(key(seriesId, round, player));
}

export function rememberPendingSeriesId(player: `0x${string}`, seriesId: bigint): void {
  const k = `bot3:pending:${player.toLowerCase()}`;
  const list = JSON.parse(localStorage.getItem(k) ?? "[]") as string[];
  const id = seriesId.toString();
  if (!list.includes(id)) list.push(id);
  localStorage.setItem(k, JSON.stringify(list));
}
