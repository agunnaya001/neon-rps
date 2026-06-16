import { useCallback, useState } from "react";
import { decodeEventLog, formatEther, parseEther } from "viem";
import {
  useAccount,
  useBalance,
  usePublicClient,
  useWriteContract,
} from "wagmi";
import { BOT3_CONTRACT_ADDRESS, BOT3_ABI } from "@/lib/bot3-contract";
import type { PlayableMove } from "@/lib/contract";
import {
  computeSeriesCommitment,
  generateSalt,
  rememberPendingSeriesId,
  saveSeriesCommitment,
} from "@/lib/bot3-salt-store";

type Status = "idle" | "preparing" | "submitting" | "confirming" | "success" | "error";

function useTxStatus() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
    setTxHash(null);
  }, []);
  return { status, setStatus, error, setError, txHash, setTxHash, reset };
}

function ensureReady(address: string | undefined): asserts address is `0x${string}` {
  if (!address) throw new Error("Connect a wallet first");
  if (!BOT3_CONTRACT_ADDRESS) throw new Error("BestOfThreeRPS contract not configured");
}

export function useCreateSeries() {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const tx = useTxStatus();
  const [createdSeriesId, setCreatedSeriesId] = useState<bigint | null>(null);
  const [pendingSalt, setPendingSalt] = useState<`0x${string}` | null>(null);

  const createSeries = useCallback(
    async (move: PlayableMove, betEth: string): Promise<bigint> => {
      ensureReady(address);
      if (!publicClient) throw new Error("Wallet client not ready");
      tx.reset();
      setCreatedSeriesId(null);
      setPendingSalt(null);

      tx.setStatus("preparing");
      const salt = generateSalt();
      const commitment = computeSeriesCommitment(address, move, salt);
      const value = betEth.trim() === "" ? 0n : parseEther(betEth);

      if (balance && value > 0n && balance.value < value) {
        const err = new Error(
          `Need ≥${formatEther(value)} ETH — wallet has ${formatEther(balance.value)} ETH`,
        );
        tx.setError(err);
        tx.setStatus("error");
        throw err;
      }

      try {
        tx.setStatus("submitting");
        const hash = await writeContractAsync({
          address: BOT3_CONTRACT_ADDRESS!,
          abi: BOT3_ABI,
          functionName: "createSeries",
          args: [commitment],
          value,
        });
        tx.setTxHash(hash);

        tx.setStatus("confirming");
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        let seriesId: bigint | null = null;
        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: BOT3_ABI,
              data: log.data,
              topics: log.topics,
            });
            if (decoded.eventName === "SeriesCreated") {
              seriesId = (decoded.args as { seriesId: bigint }).seriesId;
              break;
            }
          } catch {
            /* not our event */
          }
        }
        if (seriesId === null) throw new Error("SeriesCreated event not found");

        saveSeriesCommitment({
          seriesId: seriesId.toString(),
          round: 1,
          player: address,
          move,
          salt,
          savedAt: Date.now(),
        });
        rememberPendingSeriesId(address, seriesId);
        setPendingSalt(salt);
        setCreatedSeriesId(seriesId);
        tx.setStatus("success");
        return seriesId;
      } catch (err) {
        tx.setError(err as Error);
        tx.setStatus("error");
        throw err;
      }
    },
    [address, balance, publicClient, writeContractAsync, tx],
  );

  return {
    createSeries,
    createdSeriesId,
    pendingSalt,
    clearPendingSalt: () => setPendingSalt(null),
    ...tx,
  };
}

export function useJoinSeries() {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const tx = useTxStatus();
  const [pendingSalt, setPendingSalt] = useState<`0x${string}` | null>(null);

  const joinSeries = useCallback(
    async (seriesId: bigint, move: PlayableMove, betWei: bigint): Promise<void> => {
      ensureReady(address);
      if (!publicClient) throw new Error("Wallet client not ready");
      tx.reset();
      setPendingSalt(null);

      if (balance && betWei > 0n && balance.value < betWei) {
        const err = new Error(
          `Need ≥${formatEther(betWei)} ETH — wallet has ${formatEther(balance.value)} ETH`,
        );
        tx.setError(err);
        tx.setStatus("error");
        throw err;
      }

      tx.setStatus("preparing");
      const salt = generateSalt();
      const commitment = computeSeriesCommitment(address, move, salt);

      try {
        tx.setStatus("submitting");
        const hash = await writeContractAsync({
          address: BOT3_CONTRACT_ADDRESS!,
          abi: BOT3_ABI,
          functionName: "joinSeries",
          args: [seriesId, commitment],
          value: betWei,
        });
        tx.setTxHash(hash);
        tx.setStatus("confirming");
        await publicClient.waitForTransactionReceipt({ hash });

        saveSeriesCommitment({
          seriesId: seriesId.toString(),
          round: 1,
          player: address,
          move,
          salt,
          savedAt: Date.now(),
        });
        rememberPendingSeriesId(address, seriesId);
        setPendingSalt(salt);
        tx.setStatus("success");
      } catch (err) {
        tx.setError(err as Error);
        tx.setStatus("error");
        throw err;
      }
    },
    [address, balance, publicClient, writeContractAsync, tx],
  );

  return {
    joinSeries,
    pendingSalt,
    clearPendingSalt: () => setPendingSalt(null),
    ...tx,
  };
}

export function useCommitRound() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const tx = useTxStatus();
  const [pendingSalt, setPendingSalt] = useState<`0x${string}` | null>(null);

  const commitRound = useCallback(
    async (seriesId: bigint, round: number, move: PlayableMove): Promise<void> => {
      ensureReady(address);
      if (!publicClient) throw new Error("Wallet client not ready");
      tx.reset();
      setPendingSalt(null);

      tx.setStatus("preparing");
      const salt = generateSalt();
      const commitment = computeSeriesCommitment(address, move, salt);

      try {
        tx.setStatus("submitting");
        const hash = await writeContractAsync({
          address: BOT3_CONTRACT_ADDRESS!,
          abi: BOT3_ABI,
          functionName: "commitRound",
          args: [seriesId, commitment],
        });
        tx.setTxHash(hash);
        tx.setStatus("confirming");
        await publicClient.waitForTransactionReceipt({ hash });

        saveSeriesCommitment({
          seriesId: seriesId.toString(),
          round,
          player: address,
          move,
          salt,
          savedAt: Date.now(),
        });
        setPendingSalt(salt);
        tx.setStatus("success");
      } catch (err) {
        tx.setError(err as Error);
        tx.setStatus("error");
        throw err;
      }
    },
    [address, publicClient, writeContractAsync, tx],
  );

  return {
    commitRound,
    pendingSalt,
    clearPendingSalt: () => setPendingSalt(null),
    ...tx,
  };
}

export function useRevealRound() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const tx = useTxStatus();

  const revealRound = useCallback(
    async (seriesId: bigint, move: PlayableMove, salt: `0x${string}`): Promise<void> => {
      ensureReady(address);
      if (!publicClient) throw new Error("Wallet client not ready");
      tx.reset();
      try {
        tx.setStatus("submitting");
        const hash = await writeContractAsync({
          address: BOT3_CONTRACT_ADDRESS!,
          abi: BOT3_ABI,
          functionName: "reveal",
          args: [seriesId, move, salt],
        });
        tx.setTxHash(hash);
        tx.setStatus("confirming");
        await publicClient.waitForTransactionReceipt({ hash });
        tx.setStatus("success");
      } catch (err) {
        tx.setError(err as Error);
        tx.setStatus("error");
        throw err;
      }
    },
    [address, publicClient, writeContractAsync, tx],
  );

  return { revealRound, ...tx };
}

export function useCancelSeries() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const tx = useTxStatus();

  const cancelSeries = useCallback(
    async (seriesId: bigint): Promise<void> => {
      ensureReady(address);
      if (!publicClient) throw new Error("Wallet client not ready");
      tx.reset();
      try {
        tx.setStatus("submitting");
        const hash = await writeContractAsync({
          address: BOT3_CONTRACT_ADDRESS!,
          abi: BOT3_ABI,
          functionName: "cancelSeries",
          args: [seriesId],
        });
        tx.setTxHash(hash);
        tx.setStatus("confirming");
        await publicClient.waitForTransactionReceipt({ hash });
        tx.setStatus("success");
      } catch (err) {
        tx.setError(err as Error);
        tx.setStatus("error");
        throw err;
      }
    },
    [address, publicClient, writeContractAsync, tx],
  );
  return { cancelSeries, ...tx };
}

export function useClaimByDefaultSeries() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const tx = useTxStatus();

  const claimByDefault = useCallback(
    async (seriesId: bigint): Promise<void> => {
      ensureReady(address);
      if (!publicClient) throw new Error("Wallet client not ready");
      tx.reset();
      try {
        tx.setStatus("submitting");
        const hash = await writeContractAsync({
          address: BOT3_CONTRACT_ADDRESS!,
          abi: BOT3_ABI,
          functionName: "claimByDefault",
          args: [seriesId],
        });
        tx.setTxHash(hash);
        tx.setStatus("confirming");
        await publicClient.waitForTransactionReceipt({ hash });
        tx.setStatus("success");
      } catch (err) {
        tx.setError(err as Error);
        tx.setStatus("error");
        throw err;
      }
    },
    [address, publicClient, writeContractAsync, tx],
  );
  return { claimByDefault, ...tx };
}
