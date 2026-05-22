import { useState } from "react";
import { Coins, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useWallet } from "@/lib/wallet";

type Props = {
  variant?: "primary" | "ghost";
  className?: string;
};

export function BuyBaseEthButton({ variant = "primary", className = "" }: Props) {
  const { address, isConnected, connect } = useWallet();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!isConnected || !address) {
      connect();
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/onramp/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet_address: address,
          partner_user_ref: `neonrps-${address.slice(2, 10)}-${Date.now()}`,
        }),
      });
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || `HTTP ${res.status}`);
      }
      const data = (await res.json()) as { url: string };
      const popup = window.open(
        data.url,
        "coinbase-onramp",
        "popup=yes,width=480,height=720,noopener,noreferrer"
      );
      if (!popup) {
        // Popup blocked — fall back to opening in current tab via link
        window.location.href = data.url;
      } else {
        toast.success("Coinbase Onramp opened — complete the purchase in the popup.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to open Coinbase Onramp";
      toast.error(msg.length > 160 ? msg.slice(0, 160) + "…" : msg);
    } finally {
      setLoading(false);
    }
  };

  const base =
    variant === "primary"
      ? "arcade-box px-5 py-2.5 font-mono text-xs tracking-widest text-accent border-2 hover:bg-accent/10"
      : "font-mono text-xs tracking-widest text-accent underline-offset-4 hover:underline";
  const style = variant === "primary" ? { borderColor: "hsl(var(--accent))" } : undefined;

  return (
    <button
      data-testid="buy-base-eth-btn"
      onClick={handleClick}
      disabled={loading}
      className={`${base} ${className} transition-colors inline-flex items-center gap-2 disabled:opacity-60`}
      style={style}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        <Coins className="w-3.5 h-3.5" />
      )}
      {loading ? "OPENING..." : "BUY BASE ETH"}
    </button>
  );
}
