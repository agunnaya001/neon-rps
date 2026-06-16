import { useCallback } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

export function useWallet() {
  const { address, isConnected, status, chainId } = useAccount();
  const { connectors, connectAsync, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();

  const connect = useCallback(async () => {
    const injected = connectors.find((c) => c.id === "injected") ?? connectors[0];
    if (!injected) throw new Error("No wallet detected. Install MetaMask or use a Web3 browser.");
    await connectAsync({ connector: injected });
  }, [connectors, connectAsync]);

  const connectWalletConnect = useCallback(async () => {
    const wc = connectors.find((c) => c.id === "walletConnect");
    if (!wc) throw new Error("WalletConnect not available");
    await connectAsync({ connector: wc });
  }, [connectors, connectAsync]);

  return {
    address,
    isConnected,
    status,
    chainId,
    isConnecting,
    connect,
    connectWalletConnect,
    disconnect,
    connectors,
  };
}

export function shortAddress(addr: string | undefined): string {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
