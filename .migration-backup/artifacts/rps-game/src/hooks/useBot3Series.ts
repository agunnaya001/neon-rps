import { useMemo } from "react";
import { useReadContract } from "wagmi";
import { BOT3_CONTRACT_ADDRESS, BOT3_ABI } from "@/lib/bot3-contract";

export type SeriesData = {
  id: bigint;
  player1: `0x${string}`;
  player2: `0x${string}`;
  bet: bigint;
  wins1: number;
  wins2: number;
  currentRound: number;
  phase: number;
  roundStartedAt: bigint;
  committed1: boolean;
  committed2: boolean;
  revealed1: boolean;
  revealed2: boolean;
};

export function useSeries(id: bigint | undefined) {
  const { data, isLoading, refetch } = useReadContract({
    address: BOT3_CONTRACT_ADDRESS ?? undefined,
    abi: BOT3_ABI,
    functionName: "getSeries",
    args: id !== undefined ? [id] : undefined,
    query: {
      enabled: id !== undefined && !!BOT3_CONTRACT_ADDRESS,
      refetchInterval: 6_000,
    },
  });

  const series = useMemo((): SeriesData | null => {
    if (!data || id === undefined) return null;
    const d = data as unknown as {
      player1: `0x${string}`;
      player2: `0x${string}`;
      bet: bigint;
      wins1: number | bigint;
      wins2: number | bigint;
      currentRound: number | bigint;
      phase: number | bigint;
      roundStartedAt: bigint;
      committed1: boolean;
      committed2: boolean;
      revealed1: boolean;
      revealed2: boolean;
    };
    return {
      id,
      player1: d.player1,
      player2: d.player2,
      bet: d.bet,
      wins1: Number(d.wins1),
      wins2: Number(d.wins2),
      currentRound: Number(d.currentRound),
      phase: Number(d.phase),
      roundStartedAt: BigInt(d.roundStartedAt),
      committed1: d.committed1,
      committed2: d.committed2,
      revealed1: d.revealed1,
      revealed2: d.revealed2,
    };
  }, [data, id]);

  return { series, isLoading, refetch };
}

export function useBot3FeeBps(): number {
  const { data } = useReadContract({
    address: BOT3_CONTRACT_ADDRESS ?? undefined,
    abi: BOT3_ABI,
    functionName: "feeBps",
    query: { enabled: !!BOT3_CONTRACT_ADDRESS },
  });
  return data !== undefined ? Number(data) : 250;
}

export function useBot3WinnerPayout(id: bigint | undefined): bigint {
  const { data } = useReadContract({
    address: BOT3_CONTRACT_ADDRESS ?? undefined,
    abi: BOT3_ABI,
    functionName: "winnerPayout",
    args: id !== undefined ? [id] : undefined,
    query: { enabled: id !== undefined && !!BOT3_CONTRACT_ADDRESS },
  });
  return (data as bigint | undefined) ?? 0n;
}
