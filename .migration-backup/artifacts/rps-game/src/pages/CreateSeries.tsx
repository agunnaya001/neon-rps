import { useEffect, useState } from "react";
import { useLocation, useSearch, Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Hand, HandMetal, Scissors, LayoutList, Zap } from "lucide-react";
import { toast } from "sonner";
import { useChainId } from "wagmi";
import { useCreateSeries } from "@/hooks/useBot3Actions";
import { useBot3FeeBps } from "@/hooks/useBot3Series";
import { useWallet } from "@/lib/wallet";
import { Move, type PlayableMove } from "@/lib/contract";
import { getChainName } from "@/lib/wagmi";
import { parseContractError } from "@/lib/errors";
import { useEthPrice, formatUsd } from "@/lib/useEthPrice";
import { Footer } from "@/components/Footer";
import { FeeBreakdown } from "@/components/FeeBreakdown";
import { BuyBaseEthButton } from "@/components/BuyBaseEthButton";
import { SaltModal } from "@/components/SaltModal";
import { parseEther } from "viem";

const PRESETS = ["0.001", "0.005", "0.01", "0.05", "0.1", "0.5"];

export default function CreateSeries() {
  const { isConnected, connect } = useWallet();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const chainId = useChainId();
  const chainName = getChainName(chainId);
  const { data: ethPrice } = useEthPrice();

  const [move, setMove] = useState<PlayableMove>(Move.Rock);
  const [bet, setBet] = useState("0.01");
  const [pendingNavId, setPendingNavId] = useState<bigint | null>(null);

  const { createSeries, status, error, pendingSalt, clearPendingSalt } = useCreateSeries();
  const feeBps = useBot3FeeBps();

  useEffect(() => {
    const params = new URLSearchParams(search);
    const presetBet = params.get("bet");
    if (presetBet && /^\d*\.?\d+$/.test(presetBet)) setBet(presetBet);
  }, [search]);

  let betWei = 0n;
  try {
    if (bet && /^\d*\.?\d+$/.test(bet)) betWei = parseEther(bet);
  } catch {}

  const betUsd = formatUsd(betWei, ethPrice);

  async function onSubmit() {
    try {
      const toastId = toast(`Confirming on ${chainName}…`);
      const id = await createSeries(move, bet);
      toast.dismiss(toastId);
      toast.success("Round 1 committed!");
      setPendingNavId(id);
    } catch (err) {
      toast.error(parseContractError(err));
    }
  }

  function onSaltSaved() {
    clearPendingSalt();
    if (pendingNavId !== null) setLocation(`/series/${pendingNavId}`);
  }

  const moveDefs = [
    { value: Move.Rock, label: "ROCK", icon: HandMetal, color: "text-red-400", borderColor: "border-red-500", glowColor: "rgba(239,68,68,0.4)" },
    { value: Move.Paper, label: "PAPER", icon: Hand, color: "text-blue-400", borderColor: "border-blue-500", glowColor: "rgba(59,130,246,0.4)" },
    { value: Move.Scissors, label: "SCISSORS", icon: Scissors, color: "text-yellow-400", borderColor: "border-yellow-500", glowColor: "rgba(234,179,8,0.4)" },
  ];

  return (
    <div className="min-h-[100dvh] p-4 md:p-8 max-w-2xl mx-auto flex flex-col pb-20 md:pb-8">
      {pendingNavId !== null && pendingSalt && (
        <SaltModal salt={pendingSalt} onConfirm={onSaltSaved} />
      )}

      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-secondary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          RETURN TO LOBBY
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-8">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-1">
            <LayoutList className="w-8 h-8 text-secondary" />
            <h1 className="text-4xl md:text-5xl font-black arcade-text text-secondary drop-shadow-[0_0_15px_rgba(0,255,255,0.6)]">
              NEW SERIES
            </h1>
          </div>
          <p className="font-mono text-muted-foreground uppercase text-sm tracking-wider">
            Best of 3 · Stake once · First to 2 wins takes the pot
          </p>
        </div>

        {!isConnected ? (
          <div className="arcade-box border-secondary/50 p-8 text-center space-y-4">
            <p className="font-mono text-lg">WALLET REQUIRED TO INITIATE SEQUENCE</p>
            <button onClick={() => connect()} className="arcade-btn arcade-btn-secondary px-6 py-3 w-full">
              CONNECT WALLET
            </button>
            <div className="pt-4 border-t border-secondary/20">
              <p className="font-mono text-[11px] text-muted-foreground mb-3 tracking-widest">
                NO BASE ETH? FUND YOUR WALLET INSTANTLY ↓
              </p>
              <div className="flex justify-center">
                <BuyBaseEthButton />
              </div>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="arcade-box border-secondary/50 p-6 md:p-8 space-y-8"
          >
            {/* Move selection */}
            <div className="space-y-4">
              <div className="text-sm font-bold arcade-text tracking-widest text-center text-foreground/80">
                1. SELECT ROUND 1 MOVE <span className="text-xs text-secondary">(HIDDEN)</span>
              </div>
              <div className="grid grid-cols-3 gap-3 md:gap-4">
                {moveDefs.map((m) => {
                  const Icon = m.icon;
                  const isSelected = move === m.value;
                  return (
                    <motion.button
                      key={m.value}
                      onClick={() => {
                        setMove(m.value as PlayableMove);
                        navigator.vibrate?.(15);
                      }}
                      className={`
                        relative flex flex-col items-center justify-center p-4 md:p-6 gap-2
                        border-2 transition-all duration-200 min-h-[90px] md:min-h-[110px]
                        ${isSelected ? `${m.borderColor} bg-white/5` : "border-border/40 hover:border-border hover:bg-white/5"}
                      `}
                      style={isSelected ? { boxShadow: `0 0 18px ${m.glowColor}` } : {}}
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.96 }}
                    >
                      <Icon className={`w-8 h-8 md:w-10 md:h-10 ${isSelected ? m.color : "text-muted-foreground"}`} />
                      <span className={`font-bold arcade-text text-xs md:text-sm ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                        {m.label}
                      </span>
                      {isSelected && (
                        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-secondary shadow-[0_0_4px_rgba(0,255,255,0.8)]" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Bet input */}
            <div className="space-y-3">
              <div className="text-sm font-bold arcade-text tracking-widest text-center text-foreground/80">
                2. ENTER STAKE (PER PLAYER)
              </div>

              {/* Quick presets */}
              <div className="flex flex-wrap gap-2 justify-center">
                {PRESETS.map((p) => (
                  <button
                    key={p}
                    onClick={() => setBet(p)}
                    className={`font-mono text-xs px-3 py-1.5 border transition-all
                      ${bet === p
                        ? "border-secondary text-secondary bg-secondary/10"
                        : "border-border/40 text-muted-foreground hover:border-secondary/60 hover:text-secondary/80"
                      }`}
                  >
                    {p}
                  </button>
                ))}
              </div>

              <div className="relative max-w-xs mx-auto">
                <input
                  value={bet}
                  onChange={(e) => setBet(e.target.value)}
                  className="w-full bg-black/50 border-2 border-secondary/50 p-4 text-center font-mono text-2xl md:text-3xl text-foreground focus:border-secondary focus:outline-none focus:shadow-[0_0_15px_rgba(0,255,255,0.4)] transition-all"
                  inputMode="decimal"
                  placeholder="0.01"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold arcade-text text-secondary/80">
                  ETH
                </span>
              </div>

              {betUsd && (
                <div className="text-center font-mono text-sm text-muted-foreground">
                  ≈ {betUsd} USD per player
                </div>
              )}

              <FeeBreakdown bet={betWei} feeBps={feeBps} className="max-w-xs mx-auto" />
            </div>

            {/* Submit */}
            <div className="pt-2 flex flex-col items-center gap-3">
              <button
                onClick={onSubmit}
                disabled={status === "submitting" || status === "confirming" || betWei === 0n}
                className="arcade-btn arcade-btn-secondary px-8 py-4 w-full text-lg md:text-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === "submitting" ? (
                  <><span className="animate-pulse">●</span> ENCRYPTING ROUND 1…</>
                ) : status === "confirming" ? (
                  <><span className="animate-spin inline-block">◌</span> AWAITING NETWORK…</>
                ) : (
                  <><Zap className="w-5 h-5" /> COMMIT &amp; START SERIES</>
                )}
              </button>
              {error && (
                <div className="text-sm font-mono text-destructive bg-destructive/10 border border-destructive p-2 w-full text-center">
                  {parseContractError(error)}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
}
