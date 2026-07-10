export function parseContractError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);

  if (/user rejected|user denied|rejected the request/i.test(msg)) {
    return "Transaction cancelled.";
  }
  if (/insufficient funds/i.test(msg)) {
    return "Insufficient ETH balance for this transaction.";
  }
  if (/network/i.test(msg) || /rpc/i.test(msg)) {
    return "Network error. Please check your connection and try again.";
  }

  const REVERT_MAP: Record<string, string> = {
    WrongPhase: "Action not allowed in the current game phase.",
    BetMismatch: "Your bet doesn't match the required amount.",
    WrongPlayer: "Only a player in this game can do this.",
    AlreadyRevealed: "Move already revealed.",
    AlreadyCommitted: "You already committed for this round.",
    CommitmentMismatch: "Revealed move doesn't match your original commitment.",
    TimeoutNotReached: "The 24-hour timeout hasn't expired yet.",
    NotCancellable: "This game cannot be cancelled.",
    InvalidMove: "Invalid move selected.",
    InvalidCommitment: "Invalid commitment hash.",
    BothOrNeitherRevealed: "Both players must reveal.",
    NothingToWithdraw: "No fees available to withdraw.",
    ZeroAddress: "Invalid address provided.",
    TransferFailed: "ETH transfer failed.",
    FeeTooHigh: "Fee exceeds maximum (5%).",
  };

  for (const [name, friendly] of Object.entries(REVERT_MAP)) {
    if (msg.includes(name)) return friendly;
  }

  const firstLine = msg.split("\n")[0].replace(/^Error:\s*/i, "").trim();
  return firstLine.length > 140 ? firstLine.slice(0, 140) + "…" : firstLine || "Transaction failed.";
}

export function isNetworkError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  return /network|timeout|connection|rpc|json.rpc|fetch|offline/i.test(msg);
}

export function isRetryableError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  // Retryable: network errors, timeouts, rate limits
  return /network|timeout|connection|econnreset|enotfound|429|503/i.test(msg);
}
