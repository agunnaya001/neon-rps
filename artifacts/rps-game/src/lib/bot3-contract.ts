const RAW_ADDRESS =
  (import.meta.env.VITE_BOT3_CONTRACT_ADDRESS as string | undefined) ??
  "0x053ac43369DE4B87987689d1cb352A15AB771c40";

function isValidAddress(addr: string): addr is `0x${string}` {
  return /^0x[a-fA-F0-9]{40}$/.test(addr);
}

export const BOT3_CONTRACT_ADDRESS: `0x${string}` | null = isValidAddress(RAW_ADDRESS)
  ? (RAW_ADDRESS as `0x${string}`)
  : null;

export const Bo3Phase = {
  Empty: 0,
  WaitingForOpponent: 1,
  Revealing: 2,
  Committing: 3,
  Completed: 4,
} as const;
export type Bo3PhaseValue = (typeof Bo3Phase)[keyof typeof Bo3Phase];

export const BOT3_ABI = [
  {
    type: "constructor",
    inputs: [
      { name: "_feeRecipient", type: "address" },
      { name: "_feeBps", type: "uint16" },
    ],
    stateMutability: "nonpayable",
  },
  // Errors
  { type: "error", name: "AlreadyCommitted", inputs: [] },
  { type: "error", name: "AlreadyRevealed", inputs: [] },
  { type: "error", name: "BetMismatch", inputs: [] },
  { type: "error", name: "CommitmentMismatch", inputs: [] },
  { type: "error", name: "FeeTooHigh", inputs: [] },
  { type: "error", name: "InvalidCommitment", inputs: [] },
  { type: "error", name: "InvalidMove", inputs: [] },
  { type: "error", name: "NotCancellable", inputs: [] },
  { type: "error", name: "NothingToWithdraw", inputs: [] },
  { type: "error", name: "TimeoutNotReached", inputs: [] },
  { type: "error", name: "TransferFailed", inputs: [] },
  { type: "error", name: "WrongPhase", inputs: [] },
  { type: "error", name: "WrongPlayer", inputs: [] },
  { type: "error", name: "ZeroAddress", inputs: [] },
  // Events
  {
    type: "event",
    name: "SeriesCreated",
    anonymous: false,
    inputs: [
      { indexed: true, name: "seriesId", type: "uint256" },
      { indexed: true, name: "player1", type: "address" },
      { indexed: false, name: "bet", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "SeriesJoined",
    anonymous: false,
    inputs: [
      { indexed: true, name: "seriesId", type: "uint256" },
      { indexed: true, name: "player2", type: "address" },
    ],
  },
  {
    type: "event",
    name: "RoundCommitted",
    anonymous: false,
    inputs: [
      { indexed: true, name: "seriesId", type: "uint256" },
      { indexed: false, name: "round", type: "uint8" },
      { indexed: true, name: "player", type: "address" },
    ],
  },
  {
    type: "event",
    name: "RoundResolved",
    anonymous: false,
    inputs: [
      { indexed: true, name: "seriesId", type: "uint256" },
      { indexed: false, name: "round", type: "uint8" },
      { indexed: false, name: "roundWinner", type: "uint8" },
      { indexed: false, name: "score1", type: "uint8" },
      { indexed: false, name: "score2", type: "uint8" },
    ],
  },
  {
    type: "event",
    name: "SeriesCompleted",
    anonymous: false,
    inputs: [
      { indexed: true, name: "seriesId", type: "uint256" },
      { indexed: true, name: "winner", type: "address" },
      { indexed: false, name: "payout", type: "uint256" },
    ],
  },
  {
    type: "event",
    name: "SeriesCancelled",
    anonymous: false,
    inputs: [{ indexed: true, name: "seriesId", type: "uint256" }],
  },
  {
    type: "event",
    name: "FeeCollected",
    anonymous: false,
    inputs: [
      { indexed: true, name: "seriesId", type: "uint256" },
      { indexed: false, name: "amount", type: "uint256" },
    ],
  },
  // Functions
  {
    type: "function",
    name: "createSeries",
    stateMutability: "payable",
    inputs: [{ name: "commitment", type: "bytes32" }],
    outputs: [{ name: "id", type: "uint256" }],
  },
  {
    type: "function",
    name: "joinSeries",
    stateMutability: "payable",
    inputs: [
      { name: "id", type: "uint256" },
      { name: "commitment", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "commitRound",
    stateMutability: "nonpayable",
    inputs: [
      { name: "id", type: "uint256" },
      { name: "commitment", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "reveal",
    stateMutability: "nonpayable",
    inputs: [
      { name: "id", type: "uint256" },
      { name: "move", type: "uint8" },
      { name: "salt", type: "bytes32" },
    ],
    outputs: [],
  },
  {
    type: "function",
    name: "cancelSeries",
    stateMutability: "nonpayable",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "claimByDefault",
    stateMutability: "nonpayable",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [],
  },
  {
    type: "function",
    name: "getSeries",
    stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [
      { name: "player1", type: "address" },
      { name: "player2", type: "address" },
      { name: "bet", type: "uint256" },
      { name: "wins1", type: "uint8" },
      { name: "wins2", type: "uint8" },
      { name: "currentRound", type: "uint8" },
      { name: "phase", type: "uint8" },
      { name: "roundStartedAt", type: "uint64" },
      { name: "committed1", type: "bool" },
      { name: "committed2", type: "bool" },
      { name: "revealed1", type: "bool" },
      { name: "revealed2", type: "bool" },
    ],
  },
  {
    type: "function",
    name: "feeBps",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint16" }],
  },
  {
    type: "function",
    name: "winnerPayout",
    stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "revealDeadline",
    stateMutability: "view",
    inputs: [{ name: "id", type: "uint256" }],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "withdrawFees",
    stateMutability: "nonpayable",
    inputs: [],
    outputs: [],
  },
  {
    type: "function",
    name: "pendingFees",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    type: "function",
    name: "nextSeriesId",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;
