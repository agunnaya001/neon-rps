import { useChainId, useSwitchChain, useAccount } from "wagmi";
import { AlertTriangle } from "lucide-react";
import { CHAIN_ID } from "@/lib/contract";

const CHAIN_NAMES: Record<number, string> = {
  1: "Ethereum Mainnet",
  11155111: "Sepolia",
  31337: "Hardhat (local)",
};

export function NetworkBanner() {
  const { isConnected } = useAccount();
  const currentChainId = useChainId();
  const { switchChain, isPending } = useSwitchChain();

  if (!isConnected) return null;
  if (currentChainId === CHAIN_ID) return null;

  const expected = CHAIN_NAMES[CHAIN_ID] ?? `Chain ${CHAIN_ID}`;
  const actual = CHAIN_NAMES[currentChainId] ?? `Chain ${currentChainId}`;

  return (
    <div className="bg-destructive/15 border-b-2 border-destructive">
      <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div className="font-mono text-sm">
            <div className="font-bold text-destructive arcade-text">WRONG NETWORK</div>
            <div className="text-muted-foreground">
              You're connected to <span className="text-foreground">{actual}</span>. Switch to{" "}
              <span className="text-foreground">{expected}</span> to play.
            </div>
          </div>
        </div>
        <button
          onClick={() => switchChain({ chainId: CHAIN_ID })}
          disabled={isPending}
          className="arcade-btn px-4 py-2 text-xs whitespace-nowrap"
        >
          {isPending ? "SWITCHING…" : `SWITCH TO ${expected.toUpperCase()}`}
        </button>
      </div>
    </div>
  );
}
