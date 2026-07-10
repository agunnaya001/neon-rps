import { useCallback, useState } from "react";
import { decodeEventLog, formatEther, parseEther } from "viem";
import {
  useAccount,
  useBalance,
  usePublicClient,
  useWriteContract,
} from "wagmi";
import {
  CONTRACT_ADDRESS,
  COMMIT_REVEAL_RPS_ABI,
  type PlayableMove,
} from "@/lib/contract";
import {
  computeCommitment,
  generateSalt,
  rememberPendingGameId,
  saveCommitment,
} from "@/lib/salt-store";
import { parseContractError, isNetworkError, isRetryableError } from "@/lib/errors";

type Status = "idle" | "preparing" | "submitting" | "confirming" | "success" | "error" | "retrying";

function useTxStatus() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<Error | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const reset = useCallback(() => {
    setStatus("idle");
    setError(null);
    setTxHash(null);
    setRetryCount(0);
  }, []);
  return { status, setStatus, error, setError, txHash, setTxHash, reset, retryCount, setRetryCount };
}

function ensureReady(address: string | undefined): asserts address is `0x${string}` {
  if (!address) throw new Error("Connect a wallet first");
  if (!CONTRACT_ADDRESS) throw new Error("Contract address is not configured");
}

// Auto-retry with exponential backoff on network errors
async function executeWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries = 2,
): Promise<T> {
  let lastError: Error | null = null;
  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err as Error;
      if (!isRetryableError(err) || i === maxRetries) throw err;
      const delay = Math.pow(2, i) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
  throw lastError;
}

export function useCreateGame() {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const tx = useTxStatus();
  const [createdGameId, setCreatedGameId] = useState<bigint | null>(null);
  const [pendingSalt, setPendingSalt] = useState<`0x${string}` | null>(null);

  const createGame = useCallback(
    async (move: PlayableMove, betEth: string): Promise<bigint> => {
      ensureReady(address);
      if (!publicClient) throw new Error("Wallet client not ready");
      tx.reset();
      setCreatedGameId(null);
      setPendingSalt(null);

      tx.setStatus("preparing");
      const salt = generateSalt();
      const commitment = computeCommitment(address, move, salt);
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
          address: CONTRACT_ADDRESS!,
          abi: COMMIT_REVEAL_RPS_ABI,
          functionName: "createGame",
          args: [commitment],
          value,
        });
        tx.setTxHash(hash);

        tx.setStatus("confirming");
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        let gameId: bigint | null = null;
        for (const log of receipt.logs) {
          try {
            const decoded = decodeEventLog({
              abi: COMMIT_REVEAL_RPS_ABI,
              data: log.data,
              topics: log.topics,
            });
            if (decoded.eventName === "GameCreated") {
              gameId = (decoded.args as { gameId: bigint }).gameId;
              break;
            }
          } catch {
            /* not our event */
          }
        }
        if (gameId === null) throw new Error("GameCreated event not found");

        saveCommitment({
          gameId: gameId.toString(),
          player: address,
          move,
          salt,
          savedAt: Date.now(),
        });
        rememberPendingGameId(address, gameId);
        setPendingSalt(salt);
        setCreatedGameId(gameId);
        tx.setStatus("success");
        return gameId;
      } catch (err) {
        const friendlyError = parseContractError(err);
        const error = new Error(friendlyError);
        tx.setError(error);
        tx.setStatus("error");
        throw error;
      }
    },
    [address, balance, publicClient, writeContractAsync, tx],
  );

  return {
    createGame,
    createdGameId,
    pendingSalt,
    clearPendingSalt: () => setPendingSalt(null),
    ...tx,
  };
}

export function useJoinGame() {
  const { address } = useAccount();
  const { data: balance } = useBalance({ address });
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const tx = useTxStatus();

  const joinGame = useCallback(
    async (gameId: bigint, move: PlayableMove, betWei: bigint): Promise<void> => {
      ensureReady(address);
      if (!publicClient) throw new Error("Wallet client not ready");
      tx.reset();

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
      const commitment = computeCommitment(address, move, salt);

      try {
        tx.setStatus("submitting");
        const hash = await writeContractAsync({
          address: CONTRACT_ADDRESS!,
          abi: COMMIT_REVEAL_RPS_ABI,
          functionName: "joinGame",
          args: [gameId, commitment],
          value: betWei,
        });
        tx.setTxHash(hash);

        tx.setStatus("confirming");
        await publicClient.waitForTransactionReceipt({ hash });

        saveCommitment({
          gameId: gameId.toString(),
          player: address,
          move,
          salt,
          savedAt: Date.now(),
        });
        rememberPendingGameId(address, gameId);
        tx.setStatus("success");
      } catch (err) {
        tx.setError(err as Error);
        tx.setStatus("error");
        throw err;
      }
    },
    [address, balance, publicClient, writeContractAsync, tx],
  );

  return { joinGame, ...tx };
}

export function useCancelGame() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const tx = useTxStatus();

  const cancelGame = useCallback(
    async (gameId: bigint): Promise<void> => {
      ensureReady(address);
      if (!publicClient) throw new Error("Wallet client not ready");
      tx.reset();
      try {
        tx.setStatus("submitting");
        const hash = await writeContractAsync({
          address: CONTRACT_ADDRESS!,
          abi: COMMIT_REVEAL_RPS_ABI,
          functionName: "cancelGame",
          args: [gameId],
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
  return { cancelGame, ...tx };
}

export function useClaimByDefault() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const tx = useTxStatus();

  const claimByDefault = useCallback(
    async (gameId: bigint): Promise<void> => {
      ensureReady(address);
      if (!publicClient) throw new Error("Wallet client not ready");
      tx.reset();
      try {
        tx.setStatus("submitting");
        const hash = await writeContractAsync({
          address: CONTRACT_ADDRESS!,
          abi: COMMIT_REVEAL_RPS_ABI,
          functionName: "claimByDefault",
          args: [gameId],
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

export function useReveal() {
  const { address } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const tx = useTxStatus();

  const reveal = useCallback(
    async (gameId: bigint, move: PlayableMove, salt: `0x${string}`): Promise<void> => {
      ensureReady(address);
      if (!publicClient) throw new Error("Wallet client not ready");
      tx.reset();

      try {
        tx.setStatus("submitting");
        const hash = await writeContractAsync({
          address: CONTRACT_ADDRESS!,
          abi: COMMIT_REVEAL_RPS_ABI,
          functionName: "reveal",
          args: [gameId, move, salt],
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

  return { reveal, ...tx };
}
