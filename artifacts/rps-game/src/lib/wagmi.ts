import { createConfig, http } from "wagmi";
import { hardhat, mainnet, sepolia } from "wagmi/chains";
import { injected } from "wagmi/connectors";
import { CHAIN_ID } from "./contract";

const chains = [hardhat, sepolia, mainnet] as const;

export const ACTIVE_CHAIN =
  chains.find((c) => c.id === CHAIN_ID) ?? hardhat;

export const wagmiConfig = createConfig({
  chains,
  connectors: [injected()],
  transports: {
    [hardhat.id]: http(),
    [sepolia.id]: http(),
    [mainnet.id]: http(),
  },
});
