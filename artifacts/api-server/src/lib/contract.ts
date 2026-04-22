import { createPublicClient, http, formatEther } from "viem";
import { sepolia } from "viem/chains";

const CONTRACT_ADDRESS =
  (process.env.CONTRACT_ADDRESS as `0x${string}` | undefined) ??
  "0x51f082B3ff0CAdFB7e06984c89523AE03B02162d";

const RPC_URL =
  process.env.SEPOLIA_RPC_URL ?? "https://ethereum-sepolia-rpc.publicnode.com";

const client = createPublicClient({
  chain: sepolia,
  transport: http(RPC_URL),
});

const GAME_ABI = [
  {
    type: "function",
    name: "getGame",
    stateMutability: "view",
    inputs: [{ name: "gameId", type: "uint256" }],
    outputs: [
      {
        type: "tuple",
        components: [
          { name: "player1", type: "address" },
          { name: "player2", type: "address" },
          { name: "bet", type: "uint256" },
          { name: "commitment1", type: "bytes32" },
          { name: "commitment2", type: "bytes32" },
          { name: "move1", type: "uint8" },
          { name: "move2", type: "uint8" },
          { name: "phase", type: "uint8" },
          { name: "winner", type: "address" },
          { name: "joinedAt", type: "uint64" },
        ],
      },
    ],
  },
] as const;

export type GameView = {
  id: string;
  player1: string;
  player2: string;
  betEth: string;
  phase: number;
  winner: string;
  exists: boolean;
};

const PHASE_NAMES = [
  "Empty",
  "Open Lobby",
  "Reveal Phase",
  "Resolved",
  "Tied",
  "Cancelled",
];

export function phaseName(phase: number): string {
  return PHASE_NAMES[phase] ?? "Unknown";
}

const ZERO = "0x0000000000000000000000000000000000000000";

function shortAddr(addr: string): string {
  if (!addr || addr === ZERO) return "—";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export async function fetchGame(idStr: string): Promise<GameView> {
  const id = BigInt(idStr);
  try {
    const g = (await client.readContract({
      address: CONTRACT_ADDRESS,
      abi: GAME_ABI,
      functionName: "getGame",
      args: [id],
    })) as {
      player1: string;
      player2: string;
      bet: bigint;
      phase: number;
      winner: string;
    };
    return {
      id: idStr,
      player1: shortAddr(g.player1),
      player2: shortAddr(g.player2),
      betEth: formatEther(g.bet),
      phase: Number(g.phase),
      winner: shortAddr(g.winner),
      exists: g.player1 !== ZERO,
    };
  } catch {
    return {
      id: idStr,
      player1: "—",
      player2: "—",
      betEth: "0",
      phase: 0,
      winner: "—",
      exists: false,
    };
  }
}

export const CONTRACT_ADDR = CONTRACT_ADDRESS;
