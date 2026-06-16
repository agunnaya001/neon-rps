import { useEffect, useMemo, useState } from "react";
import { useAccount, usePublicClient, useReadContract, useReadContracts } from "wagmi";
import { parseAbiItem } from "viem";
import { CONTRACT_ADDRESS, COMMIT_REVEAL_RPS_ABI, type PhaseValue } from "@/lib/contract";

export type GameRecord = {
  id: bigint;
  player1: `0x${string}`;
  player2: `0x${string}`;
  bet: bigint;
  commitment1: `0x${string}`;
  commitment2: `0x${string}`;
  move1: number;
  move2: number;
  phase: PhaseValue;
  winner: `0x${string}`;
  joinedAt: bigint;
};

const ZERO_ADDR = "0x0000000000000000000000000000000000000000";

function normalizeGame(id: bigint, raw: unknown): GameRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const r = raw as Record<string, unknown>;
  const player1 = r.player1 as `0x${string}` | undefined;
  if (!player1 || player1.toLowerCase() === ZERO_ADDR) return null;
  return {
    id,
    player1,
    player2: (r.player2 as `0x${string}`) ?? (ZERO_ADDR as `0x${string}`),
    bet: (r.bet as bigint) ?? 0n,
    commitment1: (r.commitment1 as `0x${string}`) ?? "0x",
    commitment2: (r.commitment2 as `0x${string}`) ?? "0x",
    move1: Number(r.move1 ?? 0),
    move2: Number(r.move2 ?? 0),
    phase: Number(r.phase ?? 0) as PhaseValue,
    winner: (r.winner as `0x${string}`) ?? (ZERO_ADDR as `0x${string}`),
    joinedAt: (r.joinedAt as bigint) ?? 0n,
  };
}

export function useNextGameId(): bigint | undefined {
  const { data } = useReadContract({
    address: CONTRACT_ADDRESS ?? undefined,
    abi: COMMIT_REVEAL_RPS_ABI,
    functionName: "nextGameId",
    query: { enabled: !!CONTRACT_ADDRESS, refetchInterval: 5_000 },
  });
  return data as bigint | undefined;
}

export function useOpenGameIds(): bigint[] {
  const { data } = useReadContract({
    address: CONTRACT_ADDRESS ?? undefined,
    abi: COMMIT_REVEAL_RPS_ABI,
    functionName: "getOpenGames",
    query: { enabled: !!CONTRACT_ADDRESS, refetchInterval: 5_000 },
  });
  return useMemo(() => ((data as bigint[] | undefined) ?? []), [data]);
}

export function useGame(id: bigint | undefined): {
  game: GameRecord | null;
  isLoading: boolean;
  refetch: () => void;
} {
  const { data, isLoading, refetch } = useReadContract({
    address: CONTRACT_ADDRESS ?? undefined,
    abi: COMMIT_REVEAL_RPS_ABI,
    functionName: "getGame",
    args: id !== undefined ? [id] : undefined,
    query: {
      enabled: !!CONTRACT_ADDRESS && id !== undefined,
      refetchInterval: 4_000,
    },
  });
  const game = id !== undefined ? normalizeGame(id, data) : null;
  return { game, isLoading, refetch: () => void refetch() };
}

export function useGamesByIds(ids: bigint[]): {
  games: GameRecord[];
  isLoading: boolean;
} {
  const contracts = useMemo(
    () =>
      ids.map((id) => ({
        address: CONTRACT_ADDRESS ?? undefined,
        abi: COMMIT_REVEAL_RPS_ABI,
        functionName: "getGame" as const,
        args: [id] as const,
      })),
    [ids],
  );

  const { data, isLoading } = useReadContracts({
    contracts: contracts as never,
    query: {
      enabled: !!CONTRACT_ADDRESS && ids.length > 0,
      refetchInterval: 5_000,
    },
  });

  const games = useMemo(() => {
    const arr = data as Array<{ status: string; result?: unknown }> | undefined;
    if (!arr) return [];
    const out: GameRecord[] = [];
    arr.forEach((res, idx) => {
      if (res.status === "success") {
        const g = normalizeGame(ids[idx]!, res.result);
        if (g) out.push(g);
      }
    });
    return out;
  }, [data, ids]);

  return { games, isLoading };
}

/** All games that exist on-chain (iterates 0..nextGameId-1). Cheap for small ids;
 *  for production we'd index events. */
export function useAllGames(): { games: GameRecord[]; isLoading: boolean } {
  const next = useNextGameId();
  const ids = useMemo(() => {
    if (next === undefined) return [];
    const total = Number(next);
    return Array.from({ length: total }, (_, i) => BigInt(i));
  }, [next]);
  return useGamesByIds(ids);
}

export function useMyGames(): { games: GameRecord[]; isLoading: boolean } {
  const { address } = useAccount();
  const { ids, isLoading: loadingIds } = useMyGameIdsFromEvents(address);
  const { games, isLoading: loadingGames } = useGamesByIds(ids);
  return { games, isLoading: loadingIds || loadingGames };
}

export function useOpenGames(): { games: GameRecord[]; isLoading: boolean } {
  const ids = useOpenGameIds();
  return useGamesByIds(ids);
}

/** Reads the protocol fee in basis points (e.g. 250 = 2.5%). */
export function useFeeBps(): number {
  const { data } = useReadContract({
    address: CONTRACT_ADDRESS ?? undefined,
    abi: COMMIT_REVEAL_RPS_ABI,
    functionName: "feeBps",
    query: { enabled: !!CONTRACT_ADDRESS, staleTime: 60_000 },
  });
  return Number(data ?? 0);
}

const FEE_COLLECTED_EVENT = parseAbiItem(
  "event FeeCollected(uint256 indexed gameId, uint256 amount)",
);

const BASE_BLOCK_TIME_S = 2;
const BLOCKS_PER_DAY = Math.floor((86400 / BASE_BLOCK_TIME_S));
const BLOCKS_PER_WEEK = BLOCKS_PER_DAY * 7;

export type DailyRevenue = { label: string; eth: number; wei: bigint };

export function useRevenueAnalytics(): {
  earned24h: bigint;
  earned7d: bigint;
  dailyBars: DailyRevenue[];
  isLoading: boolean;
} {
  const client = usePublicClient();
  const [data, setData] = useState<{
    earned24h: bigint;
    earned7d: bigint;
    dailyBars: DailyRevenue[];
  }>({ earned24h: 0n, earned7d: 0n, dailyBars: [] });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!client || !CONTRACT_ADDRESS) return;
    let cancelled = false;
    (async () => {
      try {
        const latest = await client.getBlockNumber();
        const fromBlock = latest > BigInt(BLOCKS_PER_WEEK)
          ? latest - BigInt(BLOCKS_PER_WEEK)
          : 0n;

        const logs = await client.getLogs({
          address: CONTRACT_ADDRESS,
          event: FEE_COLLECTED_EVENT,
          fromBlock,
          toBlock: "latest",
        });

        if (cancelled) return;

        const now = Date.now();
        const msPerBlock = BASE_BLOCK_TIME_S * 1000;
        const cutoff24h = latest - BigInt(BLOCKS_PER_DAY);

        let earned24h = 0n;
        let earned7d = 0n;
        const dayMap = new Map<string, bigint>();

        for (const log of logs) {
          const amount = (log.args as { amount?: bigint }).amount ?? 0n;
          earned7d += amount;
          if (log.blockNumber && log.blockNumber >= cutoff24h) {
            earned24h += amount;
          }
          if (log.blockNumber) {
            const approxMs =
              now - Number(latest - log.blockNumber) * msPerBlock;
            const date = new Date(approxMs);
            const key = `${date.getMonth() + 1}/${date.getDate()}`;
            dayMap.set(key, (dayMap.get(key) ?? 0n) + amount);
          }
        }

        const dailyBars: DailyRevenue[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now - i * 86400_000);
          const key = `${d.getMonth() + 1}/${d.getDate()}`;
          const wei = dayMap.get(key) ?? 0n;
          dailyBars.push({
            label: key,
            eth: Number(wei) / 1e18,
            wei,
          });
        }

        if (!cancelled) {
          setData({ earned24h, earned7d, dailyBars });
        }
      } catch {
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [client]);

  return { ...data, isLoading };
}

export function useTreasuryStats(): {
  totalCollected: bigint;
  totalWithdrawn: bigint;
  pending: bigint;
  feeRecipient: `0x${string}` | null;
  isLoading: boolean;
} {
  const { data, isLoading } = useReadContracts({
    contracts: [
      {
        address: CONTRACT_ADDRESS ?? undefined,
        abi: COMMIT_REVEAL_RPS_ABI,
        functionName: "totalFeesCollected",
      },
      {
        address: CONTRACT_ADDRESS ?? undefined,
        abi: COMMIT_REVEAL_RPS_ABI,
        functionName: "totalFeesWithdrawn",
      },
      {
        address: CONTRACT_ADDRESS ?? undefined,
        abi: COMMIT_REVEAL_RPS_ABI,
        functionName: "pendingFees",
      },
      {
        address: CONTRACT_ADDRESS ?? undefined,
        abi: COMMIT_REVEAL_RPS_ABI,
        functionName: "feeRecipient",
      },
    ] as never,
    query: { enabled: !!CONTRACT_ADDRESS, refetchInterval: 10_000 },
  });
  const arr = data as Array<{ status: string; result?: unknown }> | undefined;
  return {
    totalCollected: (arr?.[0]?.result as bigint | undefined) ?? 0n,
    totalWithdrawn: (arr?.[1]?.result as bigint | undefined) ?? 0n,
    pending: (arr?.[2]?.result as bigint | undefined) ?? 0n,
    feeRecipient: (arr?.[3]?.result as `0x${string}` | undefined) ?? null,
    isLoading,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Event-based hooks — O(events) not O(totalGameCount)
// ─────────────────────────────────────────────────────────────────────────────

const GAME_CREATED_EVENT = parseAbiItem(
  "event GameCreated(uint256 indexed gameId, address indexed player1, uint256 bet)",
);
const GAME_JOINED_EVENT = parseAbiItem(
  "event GameJoined(uint256 indexed gameId, address indexed player2, uint64 deadline)",
);
const GAME_RESOLVED_EVENT = parseAbiItem(
  "event GameResolved(uint256 indexed gameId, address indexed winner, uint256 payout, uint256 fee)",
);
const GAME_TIED_EVENT = parseAbiItem(
  "event GameTied(uint256 indexed gameId, uint256 refundEach)",
);

export type LeaderboardRow = {
  address: `0x${string}`;
  wins: number;
  losses: number;
  ties: number;
  totalWagered: bigint;
  netProfit: bigint;
};

/** Builds the leaderboard entirely from on-chain events — no getGame calls. */
export function useLeaderboardData(): { rows: LeaderboardRow[]; isLoading: boolean } {
  const client = usePublicClient();
  const [rows, setRows] = useState<LeaderboardRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!client || !CONTRACT_ADDRESS) { setIsLoading(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const [createdLogs, joinedLogs, resolvedLogs, tiedLogs] = await Promise.all([
          client.getLogs({ address: CONTRACT_ADDRESS, event: GAME_CREATED_EVENT, fromBlock: 0n, toBlock: "latest" }),
          client.getLogs({ address: CONTRACT_ADDRESS, event: GAME_JOINED_EVENT, fromBlock: 0n, toBlock: "latest" }),
          client.getLogs({ address: CONTRACT_ADDRESS, event: GAME_RESOLVED_EVENT, fromBlock: 0n, toBlock: "latest" }),
          client.getLogs({ address: CONTRACT_ADDRESS, event: GAME_TIED_EVENT, fromBlock: 0n, toBlock: "latest" }),
        ]);
        if (cancelled) return;

        type GameInfo = { player1: `0x${string}`; player2?: `0x${string}`; bet: bigint };
        const gameMap = new Map<string, GameInfo>();

        for (const log of createdLogs) {
          const a = log.args as { gameId?: bigint; player1?: `0x${string}`; bet?: bigint };
          if (a.gameId !== undefined && a.player1 && a.bet !== undefined)
            gameMap.set(a.gameId.toString(), { player1: a.player1, bet: a.bet });
        }
        for (const log of joinedLogs) {
          const a = log.args as { gameId?: bigint; player2?: `0x${string}` };
          if (a.gameId !== undefined && a.player2) {
            const g = gameMap.get(a.gameId.toString());
            if (g) g.player2 = a.player2;
          }
        }

        const lb = new Map<string, LeaderboardRow>();
        const ensure = (addr: `0x${string}`): LeaderboardRow => {
          const k = addr.toLowerCase();
          let r = lb.get(k);
          if (!r) { r = { address: addr, wins: 0, losses: 0, ties: 0, totalWagered: 0n, netProfit: 0n }; lb.set(k, r); }
          return r;
        };

        for (const log of resolvedLogs) {
          const a = log.args as { gameId?: bigint; winner?: `0x${string}`; payout?: bigint; fee?: bigint };
          if (!a.gameId || !a.winner) continue;
          const game = gameMap.get(a.gameId.toString());
          if (!game) continue;
          const payout = a.payout ?? 0n;
          const fee = a.fee ?? 0n;
          const bet = (payout + fee) / 2n;
          const loser: `0x${string}` =
            a.winner.toLowerCase() === game.player1.toLowerCase()
              ? (game.player2 ?? a.winner) : game.player1;
          const w = ensure(a.winner);
          w.wins++; w.totalWagered += bet; w.netProfit += payout - bet;
          const l = ensure(loser);
          l.losses++; l.totalWagered += bet; l.netProfit -= bet;
        }

        for (const log of tiedLogs) {
          const a = log.args as { gameId?: bigint };
          if (!a.gameId) continue;
          const game = gameMap.get(a.gameId.toString());
          if (!game) continue;
          const p1 = ensure(game.player1);
          p1.ties++; p1.totalWagered += game.bet;
          if (game.player2) {
            const p2 = ensure(game.player2);
            p2.ties++; p2.totalWagered += game.bet;
          }
        }

        if (!cancelled)
          setRows(
            Array.from(lb.values())
              .filter(r => r.wins + r.losses + r.ties > 0)
              .sort((a, b) => b.wins - a.wins || Number(b.netProfit - a.netProfit)),
          );
      } catch { /* ignore */ }
      finally { if (!cancelled) setIsLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [client]);

  return { rows, isLoading };
}

/** Finds all game IDs involving `address` via indexed events. */
export function useMyGameIdsFromEvents(address: `0x${string}` | undefined): {
  ids: bigint[];
  isLoading: boolean;
} {
  const client = usePublicClient();
  const [ids, setIds] = useState<bigint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!client || !CONTRACT_ADDRESS || !address) { setIsLoading(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const [created, joined] = await Promise.all([
          client.getLogs({ address: CONTRACT_ADDRESS, event: GAME_CREATED_EVENT, args: { player1: address }, fromBlock: 0n, toBlock: "latest" }),
          client.getLogs({ address: CONTRACT_ADDRESS, event: GAME_JOINED_EVENT, args: { player2: address }, fromBlock: 0n, toBlock: "latest" }),
        ]);
        if (cancelled) return;
        const idSet = new Set<bigint>();
        for (const log of [...created, ...joined]) {
          const a = log.args as { gameId?: bigint };
          if (a.gameId !== undefined) idSet.add(a.gameId);
        }
        setIds(Array.from(idSet).sort((a, b) => Number(b - a)));
      } catch { /* ignore */ }
      finally { if (!cancelled) setIsLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [client, address]);

  return { ids, isLoading };
}

/** Returns recent game IDs for the activity feed (most recent first). */
export function useRecentActivityIds(limit = 15): { ids: bigint[]; isLoading: boolean } {
  const client = usePublicClient();
  const [ids, setIds] = useState<bigint[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!client || !CONTRACT_ADDRESS) { setIsLoading(false); return; }
    let cancelled = false;
    (async () => {
      try {
        const latest = await client.getBlockNumber();
        const fromBlock = latest > 129_600n ? latest - 129_600n : 0n; // ~3 days on Base (2s blocks)
        const logs = await client.getLogs({ address: CONTRACT_ADDRESS, event: GAME_CREATED_EVENT, fromBlock, toBlock: "latest" });
        if (cancelled) return;
        const recent = [...logs]
          .sort((a, b) => Number((b.blockNumber ?? 0n) - (a.blockNumber ?? 0n)))
          .slice(0, limit)
          .map(l => (l.args as { gameId?: bigint }).gameId)
          .filter((id): id is bigint => id !== undefined);
        setIds(recent);
      } catch { /* ignore */ }
      finally { if (!cancelled) setIsLoading(false); }
    })();
    return () => { cancelled = true; };
  }, [client, limit]);

  return { ids, isLoading };
}
