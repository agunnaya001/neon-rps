import { createConfig, http } from "wagmi";
import { base, hardhat, sepolia } from "wagmi/chains";
import { injected, walletConnect } from "wagmi/connectors";
import { CHAIN_ID } from "./contract";

const chains = [base, sepolia, hardhat] as const;

export const ACTIVE_CHAIN = chains.find((c) => c.id === CHAIN_ID) ?? base;

export const wagmiConfig = createConfig({
  chains,
  connectors: [
    injected(),
    walletConnect({
      projectId: "7d98b0f5e6b93e7e5e5e5e5e5e5e5e5e",
      metadata: {
        name: "Neon RPS",
        description: "On-chain commit-reveal Rock Paper Scissors on Base",
        url: "https://neonrps.replit.app",
        icons: ["/logo.png"],
      },
    }),
  ],
  transports: {
    [base.id]: http("https://mainnet.base.org"),
    [sepolia.id]: http("https://ethereum-sepolia-rpc.publicnode.com"),
    [hardhat.id]: http("http://127.0.0.1:8545"),
  },
});
