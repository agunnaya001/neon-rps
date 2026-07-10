import { formatEther } from "viem";
import { Info } from "lucide-react";
import { useEthPrice, formatUsd } from "@/lib/useEthPrice";

export function FeeBreakdown({
  bet,
  feeBps,
  className = "",
}: {
  bet: bigint;
  feeBps: number;
  className?: string;
}) {
  const { data: ethPrice } = useEthPrice();
  const pot = bet * 2n;
  const fee = (pot * BigInt(feeBps)) / 10_000n;
  const winnerGets = pot - fee;
  const feePct = feeBps / 100;

  if (bet === 0n) return null;

  const winUsd = formatUsd(winnerGets, ethPrice);

  return (
    <div className={`font-mono text-xs text-muted-foreground border border-border/30 bg-black/30 p-3 rounded ${className}`}>
      <div className="flex items-center gap-2 text-accent mb-2">
        <Info className="w-3 h-3" />
        <span className="tracking-widest">PAYOUT BREAKDOWN</span>
      </div>
      <div className="space-y-1 tabular-nums">
        <div className="flex justify-between">
          <span>Pot (2× bet)</span>
          <span className="text-foreground">
            {formatEther(pot)} ETH
            {formatUsd(pot, ethPrice) && (
              <span className="text-muted-foreground/60 ml-1">({formatUsd(pot, ethPrice)})</span>
            )}
          </span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Protocol fee ({feePct}%)</span>
          <span>−{formatEther(fee)} ETH</span>
        </div>
        <div className="flex justify-between border-t border-border/30 pt-1 mt-1">
          <span className="text-secondary">Winner receives</span>
          <span className="text-secondary font-bold">
            {formatEther(winnerGets)} ETH
            {winUsd && (
              <span className="text-secondary/60 font-normal ml-1">({winUsd})</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
