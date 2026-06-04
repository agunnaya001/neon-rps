import { useEffect, useState } from "react";
import { useLocation, useSearch, Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Hand, HandMetal, Scissors, LayoutList } from "lucide-react";
import { toast } from "sonner";
import { useChainId } from "wagmi";
import { useCreateSeries } from "@/hooks/useBot3Actions";
import { useBot3FeeBps } from "@/hooks/useBot3Series";
import { useWallet } from "@/lib/wallet";
import { Move, type PlayableMove } from "@/lib/contract";
import { getChainName } from "@/lib/wagmi";
import { parseContractError } from "@/lib/errors";
import { Footer } from "@/components/Footer";
import { FeeBreakdown } from "@/components/FeeBreakdown";
import { BuyBaseEthButton } from "@/components/BuyBaseEthButton";
import { SaltModal } from "@/components/SaltModal";
import { parseEther } from "viem";

export default function CreateSeries() {
  const { isConnected, connect } = useWallet();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const chainId = useChainId();
  const chainName = getChainName(chainId);

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

  const moves = [
    { value: Move.Rock, label: "ROCK", icon: HandMetal, color: "text-red-500", border: "border-red-500" },
    { value: Move.Paper, label: "PAPER", icon: Hand, color: "text-blue-500", border: "border-blue-500" },
    { value: Move.Scissors, label: "SCISSORS", icon: Scissors, color: "text-yellow-500", border: "border-yellow-500" },
  ];

  return (
    <div className="min-h-[100dvh] p-4 md:p-8 max-w-2xl mx-auto flex flex-col">
      {pendingNavId !== null && pendingSalt && (
        <SaltModal salt={pendingSalt} onConfirm={onSaltSaved} />
      )}

      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          RETURN TO LOBBY
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-10">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-1">
            <LayoutList className="w-8 h-8 text-secondary" />
            <h1 className="text-4xl md:text-5xl font-black arcade-text text-secondary drop-shadow-[0_0_15px_rgba(0,255,255,0.6)]">
              NEW SERIES
            </h1>
          </div>
          <p className="font-mono text-muted-foreground uppercase text-sm tracking-wider">
            Best of 3 rounds · Stake once · First to 2 wins takes the pot
          </p>
        </div>

        {!isConnected ? (
          <div className="arcade-box border-secondary/50 p-8 text-center space-y-4">
            <p className="font-mono text-lg">WALLET REQUIRED TO INITIATE SEQUENCE</p>
            <button onClick={() => connect()} className="arcade-btn arcade-btn-secondary px-6 py-3">
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
            <div className="space-y-4">
              <div className="text-sm font-bold arcade-text tracking-widest text-center text-foreground/80">
                1. SELECT ROUND 1 MOVE <span className="text-xs text-secondary">(HIDDEN)</span>
              </div>
              <div className="grid grid-cols-3 gap-3 md:gap-6">
                {moves.map((m) => {
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
                        relative flex flex-col items-center justify-center p-4 md:p-6 gap-3
                        border-2 transition-all duration-200 min-h-[100px]
                        ${isSelected
                          ? `bg-${m.border.replace('border-', '')}/20 ${m.border} scale-105`
                          : 'border-border/50 hover:border-border hover:bg-background/50'}
                      `}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Icon className={`w-8 h-8 md:w-12 md:h-12 ${isSelected ? m.color : 'text-muted-foreground'}`} />
                      <span className={`font-bold arcade-text text-sm md:text-base ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {m.label}
                      </span>
                    </motion.button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-sm font-bold arcade-text tracking-widest text-center text-foreground/80">
                2. ENTER STAKE (PER PLAYER)
              </div>
              <div className="relative max-w-xs mx-auto">
                <input
                  value={bet}
                  onChange={(e) => setBet(e.target.value)}
                  className="w-full bg-black/50 border-2 border-secondary/50 p-4 text-center font-mono text-2xl md:text-3xl text-foreground focus:border-secondary focus:outline-none focus:shadow-[0_0_15px_rgba(0,255,255,0.4)] transition-all"
                  inputMode="decimal"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold arcade-text text-secondary/80">
                  ETH
                </span>
              </div>
              <FeeBreakdown bet={betWei} feeBps={feeBps} className="max-w-xs mx-auto" />
            </div>

            <div className="pt-4 flex flex-col items-center">
              <button
                onClick={onSubmit}
                disabled={status === "submitting" || status === "confirming"}
                className="arcade-btn arcade-btn-secondary px-8 py-4 w-full text-lg md:text-xl"
              >
                {status === "submitting" ? "ENCRYPTING ROUND 1…" :
                 status === "confirming" ? "AWAITING NETWORK…" :
                 "COMMIT & START SERIES"}
              </button>
              {error && (
                <div className="mt-4 text-sm font-mono text-destructive bg-destructive/10 border border-destructive p-2 w-full text-center">
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
