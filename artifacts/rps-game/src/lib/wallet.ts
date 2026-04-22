import { useCallback } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

/** Convenience helper: connect to MetaMask / any injected wallet. */
export function useWallet() {
  const { address, isConnected, status, chainId } = useAccount();
  const { connectors, connectAsync, isPending: isConnecting } = useConnect();
  const { disconnect } = useDisconnect();

  const connect = useCallback(async () => {
    const injected = connectors[0];
    if (!injected) throw new Error("No injected wallet detected");
    await connectAsync({ connector: injected });
  }, [connectors, connectAsync]);

  return {
    address,
    isConnected,
    status,
    chainId,
    isConnecting,
    connect,
    disconnect,
  };
}

export function shortAddress(addr: string | undefined): string {
  if (!addr) return "";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
