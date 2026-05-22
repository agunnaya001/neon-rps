import { useEffect, useState } from "react";
import { Gift, Copy, Check, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useWallet, shortAddress } from "@/lib/wallet";
import { captureReferralFromUrl, getReferrer, withReferral } from "@/lib/referral";

/**
 * ReferralPanel — shows on Home page.
 * - If user landed via ?ref=<addr>: a small "referred by 0x…" pill (gratitude UX)
 * - If user is connected: a "Share & Earn" card with their referral link + copy + native share
 */
export function ReferralPanel() {
  const { address, isConnected } = useWallet();
  const [referrer, setReferrer] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setReferrer(captureReferralFromUrl(address));
  }, [address]);

  // Re-check after wallet connects (clear if self-ref)
  useEffect(() => {
    setReferrer(getReferrer());
  }, [address]);

  const shareUrl = withReferral(
    typeof window !== "undefined" ? window.location.origin : "https://neonrps.xyz",
    address,
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      if ("vibrate" in navigator) navigator.vibrate?.(30);
      toast.success("Referral link copied — share it everywhere!");
      setTimeout(() => setCopied(false), 2200);
    } catch {
      toast.error("Copy failed");
    }
  };

  const handleNativeShare = async () => {
    if (!("share" in navigator)) {
      handleCopy();
      return;
    }
    try {
      await navigator.share({
        title: "Neon RPS — On-Chain Rock Paper Scissors",
        text: "🪨📄✂️ Throw down on Base with me. Provably fair commit-reveal. Winner takes 97.5% of the pot.",
        url: shareUrl,
      });
      if ("vibrate" in navigator) navigator.vibrate?.(20);
    } catch (err) {
      // User cancelled — silent
      if ((err as Error).name !== "AbortError") {
        toast.error("Share failed");
      }
    }
  };

  return (
    <div className="flex flex-col gap-3" data-testid="referral-panel">
      {referrer && (
        <div
          className="self-center font-mono text-[10px] tracking-widest text-accent/80 inline-flex items-center gap-2 px-3 py-1 border border-accent/30 rounded-full bg-accent/5"
          data-testid="referred-by-pill"
        >
          <Sparkles className="w-3 h-3" />
          REFERRED BY {shortAddress(referrer)}
        </div>
      )}

      {isConnected && address && (
        <div
          className="arcade-box p-4 md:p-5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 border-accent/40"
          data-testid="share-and-earn-card"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-accent/15 flex items-center justify-center border border-accent/30">
              <Gift className="w-4 h-4 text-accent" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono text-xs tracking-widest text-accent">
                SHARE &amp; EARN
              </span>
              <span className="font-mono text-[11px] text-muted-foreground">
                Every duel started from your link earns you bragging rights (and the next protocol tier).
              </span>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={handleCopy}
              data-testid="copy-referral-btn"
              className="arcade-box px-4 py-2 font-mono text-[11px] tracking-widest text-primary border-primary/60 hover:bg-primary/10 transition-colors inline-flex items-center gap-2"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <Copy className="w-3.5 h-3.5" />
              )}
              {copied ? "COPIED" : "COPY LINK"}
            </button>
            <button
              onClick={handleNativeShare}
              data-testid="native-share-btn"
              className="arcade-box px-4 py-2 font-mono text-[11px] tracking-widest text-accent border-2 hover:bg-accent/10 transition-colors"
              style={{ borderColor: "hsl(var(--accent))" }}
            >
              SHARE ↗
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
