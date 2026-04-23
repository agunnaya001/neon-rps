import { useMemo } from "react";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
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
  const { games, isLoading } = useAllGames();
  const mine = useMemo(() => {
    if (!address) return [];
    const me = address.toLowerCase();
    return games.filter(
      (g) =>
        g.player1.toLowerCase() === me || g.player2.toLowerCase() === me,
    );
  }, [games, address]);
  return { games: mine, isLoading };
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
