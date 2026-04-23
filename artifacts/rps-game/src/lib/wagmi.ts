import { createConfig, http } from "wagmi";
import { hardhat, mainnet, sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { CHAIN_ID } from "./contract";

const chains = [sepolia, mainnet, hardhat] as const;

export const ACTIVE_CHAIN =
  chains.find((c) => c.id === CHAIN_ID) ?? sepolia;

export const wagmiConfig = createConfig({
  chains,
  connectors: [injected()],
  transports: {
    [sepolia.id]: http("https://ethereum-sepolia-rpc.publicnode.com"),
    [mainnet.id]: http("https://ethereum-rpc.publicnode.com"),
    [hardhat.id]: http("http://127.0.0.1:8545"),
  },
});
