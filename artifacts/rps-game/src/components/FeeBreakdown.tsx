import { formatEther } from "viem";
import { Info } from "lucide-react";

export function FeeBreakdown({
  bet,
  feeBps,
  className = "",
}: {
  bet: bigint;
  feeBps: number;
  className?: string;
}) {
  const pot = bet * 2n;
  const fee = (pot * BigInt(feeBps)) / 10_000n;
  const winnerGets = pot - fee;
  const feePct = feeBps / 100;

  if (bet === 0n) return null;

  return (
    <div className={`font-mono text-xs text-muted-foreground border border-border/30 bg-black/30 p-3 rounded ${className}`}>
      <div className="flex items-center gap-2 text-accent mb-2">
        <Info className="w-3 h-3" />
        <span className="tracking-widest">PAYOUT BREAKDOWN</span>
      </div>
      <div className="space-y-1 tabular-nums">
        <div className="flex justify-between">
          <span>Pot</span>
          <span className="text-foreground">{formatEther(pot)} ETH</span>
        </div>
        <div className="flex justify-between text-muted-foreground">
          <span>Protocol fee ({feePct}%)</span>
          <span>−{formatEther(fee)} ETH</span>
        </div>
        <div className="flex justify-between border-t border-border/30 pt-1 mt-1">
          <span className="text-secondary">Winner receives</span>
          <span className="text-secondary font-bold">{formatEther(winnerGets)} ETH</span>
        </div>
      </div>
    </div>
  );
}
