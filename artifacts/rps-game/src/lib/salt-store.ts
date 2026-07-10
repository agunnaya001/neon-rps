import {
  encodeAbiParameters,
  keccak256,
  parseAbiParameters,
  toHex,
} from "viem";
import type { PlayableMove } from "./contract";

export type SavedCommitment = {
  gameId: string;
  player: `0x${string}`;
  move: PlayableMove;
  salt: `0x${string}`;
  savedAt: number;
};

const KEY_PREFIX = "rps:commit:";

function key(gameId: bigint | string, player: `0x${string}`): string {
  return `${KEY_PREFIX}${gameId.toString()}:${player.toLowerCase()}`;
}

export function generateSalt(): `0x${string}` {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return toHex(bytes);
}

export function computeCommitment(
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

export function saveCommitment(c: SavedCommitment): void {
  localStorage.setItem(key(c.gameId, c.player), JSON.stringify(c));
}

export function loadCommitment(
  gameId: bigint | string,
  player: `0x${string}`,
): SavedCommitment | null {
  const raw = localStorage.getItem(key(gameId, player));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SavedCommitment;
  } catch {
    return null;
  }
}

export function clearCommitment(
  gameId: bigint | string,
  player: `0x${string}`,
): void {
  localStorage.removeItem(key(gameId, player));
}

/** Save the gameId returned by createGame so the player can find their pending
 *  commitment later, even before they navigate to /game/[id]. */
export function rememberPendingGameId(
  player: `0x${string}`,
  gameId: bigint,
): void {
  const k = `rps:pending:${player.toLowerCase()}`;
  const list = JSON.parse(localStorage.getItem(k) ?? "[]") as string[];
  const id = gameId.toString();
  if (!list.includes(id)) list.push(id);
  localStorage.setItem(k, JSON.stringify(list));
}

export function getRememberedGameIds(player: `0x${string}`): bigint[] {
  const k = `rps:pending:${player.toLowerCase()}`;
  const list = JSON.parse(localStorage.getItem(k) ?? "[]") as string[];
  return list.map((s) => BigInt(s));
}
