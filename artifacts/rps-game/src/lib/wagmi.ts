import { createConfig, http } from "wagmi";
import { base, hardhat, sepolia } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import { CHAIN_ID } from "./contract";

const chains = [base, sepolia, hardhat] as const;

export const ACTIVE_CHAIN = chains.find((c) => c.id === CHAIN_ID) ?? base;

const CHAIN_NAMES: Record<number, string> = {
  1: "Ethereum",
  8453: "Base",
  84532: "Base Sepolia",
  11155111: "Sepolia",
  31337: "Local",
};

export function getChainName(chainId: number): string {
  return CHAIN_NAMES[chainId] ?? `Chain ${chainId}`;
}

const wcProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined;
const wcEnabled = !!wcProjectId && wcProjectId.length === 32;

const baseRpcUrl =
  (import.meta.env.VITE_RPC_URL as string | undefined) || "https://mainnet.base.org";

export const wagmiConfig = createConfig({
  chains,
  connectors: [
    injected(),
    ...(wcEnabled
      ? [
          walletConnect({
            projectId: wcProjectId!,
            metadata: {
              name: "Neon RPS",
              description: "On-chain commit-reveal Rock Paper Scissors on Base",
              url: "https://neonrps.xyz",
              icons: ["/logo.png"],
            },
          }),
        ]
      : []),
  ],
  transports: {
    [base.id]: http(baseRpcUrl),
    [sepolia.id]: http("https://ethereum-sepolia-rpc.publicnode.com"),
    [hardhat.id]: http("http://127.0.0.1:8545"),
  },
});
