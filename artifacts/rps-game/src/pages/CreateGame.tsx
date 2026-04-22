import { useState } from "react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, Hand, HandMetal, Scissors } from "lucide-react";
import { toast } from "sonner";
import { useCreateGame } from "@/hooks/useGameActions";
import { useWallet } from "@/lib/wallet";
import { Move, type PlayableMove } from "@/lib/contract";
import { Footer } from "@/components/Footer";

export default function CreateGame() {
  const { isConnected, connect } = useWallet();
  const [, setLocation] = useLocation();
  const [move, setMove] = useState<PlayableMove>(Move.Rock);
  const [bet, setBet] = useState("0.01");
  const { createGame, status, error } = useCreateGame();

  async function onSubmit() {
    try {
      const toastId = toast("Confirming on Sepolia...");
      const id = await createGame(move, bet);
      toast.dismiss(toastId);
      toast.success("Move committed!");
      setLocation(`/game/${id}`);
    } catch (err: any) {
      toast.error(err.message || "Transaction failed");
    }
  }

  const moves = [
    { value: Move.Rock, label: "ROCK", icon: HandMetal, color: "text-red-500", border: "border-red-500" },
    { value: Move.Paper, label: "PAPER", icon: Hand, color: "text-blue-500", border: "border-blue-500" },
    { value: Move.Scissors, label: "SCISSORS", icon: Scissors, color: "text-yellow-500", border: "border-yellow-500" }
  ];

  return (
    <div className="min-h-[100dvh] p-4 md:p-8 max-w-2xl mx-auto flex flex-col">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          RETURN TO LOBBY
        </Link>
      </div>

      <div className="flex-1 flex flex-col justify-center space-y-10">
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-black arcade-text text-primary drop-shadow-[0_0_15px_rgba(255,0,255,0.6)]">
            NEW DUEL
          </h1>
          <p className="font-mono text-muted-foreground uppercase">Select your weapon and place your bet</p>
        </div>

        {!isConnected ? (
          <div className="arcade-box p-8 text-center space-y-4">
            <p className="font-mono text-lg">WALLET REQUIRED TO INITIATE SEQUENCE</p>
            <button onClick={() => connect()} className="arcade-btn px-6 py-3">
              CONNECT WALLET
            </button>
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="arcade-box p-6 md:p-8 space-y-8"
          >
            <div className="space-y-4">
              <div className="text-sm font-bold arcade-text tracking-widest text-center text-foreground/80">
                1. SELECT MOVE <span className="text-xs text-primary">(KEPT SECRET)</span>
              </div>
              <div className="grid grid-cols-3 gap-3 md:gap-6">
                {moves.map((m) => {
                  const Icon = m.icon;
                  const isSelected = move === m.value;
                  return (
                    <button
                      key={m.value}
                      onClick={() => setMove(m.value as PlayableMove)}
                      className={`
                        relative flex flex-col items-center justify-center p-4 md:p-6 gap-3 
                        border-2 transition-all duration-200
                        ${isSelected 
                          ? `bg-${m.border.replace('border-', '')}/20 ${m.border} shadow-[0_0_20px_var(--tw-shadow-color)] shadow-${m.border.replace('border-', '')}/50 scale-105` 
                          : 'border-border/50 hover:border-border hover:bg-background/50'}
                      `}
                    >
                      <Icon className={`w-8 h-8 md:w-12 md:h-12 ${isSelected ? m.color : 'text-muted-foreground'}`} />
                      <span className={`font-bold arcade-text text-sm md:text-base ${isSelected ? 'text-foreground' : 'text-muted-foreground'}`}>
                        {m.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <div className="text-sm font-bold arcade-text tracking-widest text-center text-foreground/80">
                2. ENTER WAGER
              </div>
              <div className="relative max-w-xs mx-auto">
                <input
                  value={bet}
                  onChange={(e) => setBet(e.target.value)}
                  className="w-full bg-black/50 border-2 border-primary/50 p-4 text-center font-mono text-2xl md:text-3xl text-foreground focus:border-primary focus:outline-none focus:shadow-[0_0_15px_rgba(255,0,255,0.4)] transition-all"
                  inputMode="decimal"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold arcade-text text-primary/80">
                  ETH
                </span>
              </div>
            </div>

            <div className="pt-4 flex flex-col items-center">
              <button
                onClick={onSubmit}
                disabled={status === "submitting" || status === "confirming"}
                className="arcade-btn px-8 py-4 w-full text-lg md:text-xl"
              >
                {status === "submitting" ? "ENCRYPTING MOVE..." :
                 status === "confirming" ? "AWAITING NETWORK..." : 
                 "COMMIT & POST BET"}
              </button>
              {error && (
                <div className="mt-4 text-sm font-mono text-destructive bg-destructive/10 border border-destructive p-2 w-full text-center">
                  {error.message}
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
