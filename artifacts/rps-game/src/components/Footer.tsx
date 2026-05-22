import { ExternalLink } from "lucide-react";
import { CONTRACT_ADDRESS, CHAIN_ID } from "@/lib/contract";
import { BuyBaseEthButton } from "@/components/BuyBaseEthButton";

const EXPLORER_BASE =
  CHAIN_ID === 8453
    ? "https://basescan.org"
    : CHAIN_ID === 11155111
      ? "https://sepolia.etherscan.io"
      : "https://etherscan.io";

const CHAIN_LABEL =
  CHAIN_ID === 8453 ? "Base" : CHAIN_ID === 11155111 ? "Sepolia" : `Chain ${CHAIN_ID}`;

export function Footer() {
  return (
    <footer className="mt-auto py-6 border-t border-primary/20 text-center flex flex-col items-center gap-2">
      {CONTRACT_ADDRESS && (
        <div className="font-mono text-xs text-muted-foreground">
          <span className="opacity-60">{CHAIN_LABEL} contract: </span>
          <a
            href={`${EXPLORER_BASE}/address/${CONTRACT_ADDRESS}#code`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline hover:text-primary/80 transition-colors inline-flex items-center gap-1"
          >
            {CONTRACT_ADDRESS.slice(0, 6)}…{CONTRACT_ADDRESS.slice(-4)}
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      )}
      {CHAIN_ID === 8453 && (
        <div className="font-mono text-xs text-muted-foreground flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
          <span>Need Base ETH?</span>
          <BuyBaseEthButton variant="ghost" />
          <span className="opacity-60">·</span>
          <a
            href="https://bridge.base.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary hover:underline hover:text-secondary/80 transition-colors"
          >
            Bridge ↗
          </a>
          <span className="opacity-60">·</span>
          <a
            href="https://www.coinbase.com/wallet"
            target="_blank"
            rel="noopener noreferrer"
            className="text-secondary hover:underline hover:text-secondary/80 transition-colors"
          >
            Coinbase Wallet ↗
          </a>
        </div>
      )}
      <div className="font-mono text-[10px] text-muted-foreground/50 mt-1">
        Provably fair · No front-running · 2.5% protocol fee on wins only
      </div>
    </footer>
  );
}
