import { createConfig, http } from "wagmi";
import { base, hardhat, sepolia } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import { CHAIN_ID } from "./contract";

const chains = [base, sepolia, hardhat] as const;

export const ACTIVE_CHAIN = chains.find((c) => c.id === CHAIN_ID) ?? base;

// Set VITE_WALLETCONNECT_PROJECT_ID in env to enable WalletConnect (Coinbase Wallet, Rainbow, Trust).
// Get a free projectId at https://cloud.walletconnect.com — MetaMask works without it.
const wcProjectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID as string | undefined;
const wcEnabled = !!wcProjectId && wcProjectId.length === 32;

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
              url: "https://neonrps.replit.app",
              icons: ["/logo.png"],
            },
          }),
        ]
      : []),
  ],
  transports: {
    [base.id]: http("https://mainnet.base.org"),
    [sepolia.id]: http("https://ethereum-sepolia-rpc.publicnode.com"),
    [hardhat.id]: http("http://127.0.0.1:8545"),
  },
});
