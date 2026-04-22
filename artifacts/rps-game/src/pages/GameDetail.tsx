import { useEffect, useState } from "react";
import { Link, useParams } from "wouter";
import { formatEther } from "viem";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Hand, HandMetal, Scissors, Trophy, AlertTriangle, ShieldQuestion } from "lucide-react";
import { toast } from "sonner";
import { useGame } from "@/hooks/useGames";
import { useJoinGame, useReveal, useCancelGame, useClaimByDefault } from "@/hooks/useGameActions";
import { useWallet, shortAddress } from "@/lib/wallet";
import { MOVE_LABELS, Move, type PlayableMove } from "@/lib/contract";
import { loadCommitment, type SavedCommitment } from "@/lib/salt-store";
import { Footer } from "@/components/Footer";
import { CountdownTimer } from "@/components/CountdownTimer";
import { ShareDialog } from "@/components/ShareDialog";
import { ParticleEffect } from "@/components/ParticleEffect";

const REVEAL_TIMEOUT_SECS = 24n * 60n * 60n;

const MoveIcon = ({ move, className }: { move: number, className?: string }) => {
  switch(move) {
    case 1: return <HandMetal className={className} />;
    case 2: return <Hand className={className} />;
    case 3: return <Scissors className={className} />;
    default: return <ShieldQuestion className={className} />;
  }
};

const PhaseBar = ({ phase }: { phase: number }) => {
  const steps = [
    { num: 1, label: "CREATED" },
    { num: 2, label: "JOINED" },
    { num: 3, label: "REVEALED" },
    { num: 4, label: "SETTLED" }
  ];

  const currentStep = phase === 4 ? 4 : phase;

  return (
    <div className="flex items-center justify-between w-full max-w-2xl mx-auto mb-10 relative">
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-border/50 -z-10"></div>
      <div 
        className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary transition-all duration-500 -z-10"
        style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
      ></div>
      
      {steps.map((step) => {
        const isActive = currentStep === step.num;
        const isPast = currentStep > step.num;
        
        return (
          <div key={step.num} className="flex flex-col items-center gap-2">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center font-mono text-sm font-bold border-2 transition-all duration-300
              ${isActive ? 'bg-background border-primary text-primary shadow-[0_0_15px_rgba(255,0,255,0.6)] scale-110' : ''}
              ${isPast ? 'bg-primary border-primary text-primary-foreground' : ''}
              ${!isActive && !isPast ? 'bg-background border-border/50 text-muted-foreground' : ''}
            `}>
              {step.num}
            </div>
            <span className={`text-[10px] font-mono tracking-widest ${isActive ? 'text-primary drop-shadow-[0_0_5px_currentColor]' : isPast ? 'text-foreground' : 'text-muted-foreground'}`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default function GameDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id ? BigInt(params.id) : undefined;
  const { game, isLoading } = useGame(id);
  const { address, isConnected, connect } = useWallet();
  const { joinGame, status: joinStatus, error: joinError } = useJoinGame();
  const { reveal, status: revealStatus, error: revealError } = useReveal();
  const { cancelGame, status: cancelStatus } = useCancelGame();
  const { claimByDefault, status: claimStatus } = useClaimByDefault();

  const [joinMove, setJoinMove] = useState<PlayableMove>(Move.Rock);
  const [savedCommit, setSavedCommit] = useState<SavedCommitment | null>(null);
  const [showParticles, setShowParticles] = useState(false);

  useEffect(() => {
    if (!id || !address) return;
    setSavedCommit(loadCommitment(id, address));
  }, [id, address, game?.phase]);

  useEffect(() => {
    if (game && game.phase === 3 && me && game.winner.toLowerCase() === me) {
      setShowParticles(true);
      const timer = setTimeout(() => setShowParticles(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [game?.phase, me]);

  const handleJoin = async () => {
    if (!id || !game) return;
    try {
      const toastId = toast("Confirming on Sepolia...");
      await joinGame(id, joinMove, game.bet);
      toast.dismiss(toastId);
      toast.success("You joined!");
    } catch (err: any) {
      toast.error(err.message || "Failed to join duel");
    }
  };

  const handleReveal = async () => {
    if (!id || !savedCommit) return;
    try {
      const toastId = toast("Confirming on Sepolia...");
      await reveal(id, savedCommit.move as PlayableMove, savedCommit.salt);
      toast.dismiss(toastId);
      toast.success("Revealed!");
    } catch (err: any) {
      toast.error(err.message || "Failed to reveal move");
    }
  };



  const handleCancel = async () => {
    if (!id) return;
    try {
      const toastId = toast("Cancelling on Sepolia...");
      await cancelGame(id);
      toast.dismiss(toastId);
      toast.success("Match cancelled, bet refunded.");
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel");
    }
  };

  const handleClaim = async () => {
    if (!id) return;
    try {
      const toastId = toast("Claiming pot on Sepolia...");
      await claimByDefault(id);
      toast.dismiss(toastId);
      toast.success("Pot claimed by default!");
    } catch (err: any) {
      toast.error(err.message || "Failed to claim");
    }
  };

  if (!id) return <div className="p-8 font-mono text-destructive text-center mt-20">INVALID GAME ID</div>;
  if (isLoading || !game) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 max-w-4xl mx-auto w-full">
      <div className="animate-pulse font-mono text-xl text-primary tracking-widest mb-8">LOADING NEURAL LINK...</div>
      <div className="w-full h-2 bg-primary/20 rounded overflow-hidden">
        <div className="h-full bg-primary w-1/3 animate-[slide_2s_infinite]"></div>
      </div>
      <style>{`@keyframes slide { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`}</style>
    </div>
  );

  const me = address?.toLowerCase();
  const isP1 = me && game.player1.toLowerCase() === me;
  const isP2 = me && game.player2.toLowerCase() === me;
  const myMove = isP1 ? game.move1 : isP2 ? game.move2 : 0;
  const opponentMove = isP1 ? game.move2 : isP2 ? game.move1 : 0;
  const canJoin = isConnected && !isP1 && game.phase === 1;
  const canReveal = isConnected && (isP1 || isP2) && game.phase === 2 && myMove === 0 && !!savedCommit;
  const canCancel = isConnected && isP1 && game.phase === 1;

  const revealDeadline = game.phase === 2 && game.joinedAt > 0n
    ? game.joinedAt + REVEAL_TIMEOUT_SECS
    : 0n;
  const nowSecs = BigInt(Math.floor(Date.now() / 1000));
  const deadlinePassed = revealDeadline > 0n && nowSecs > revealDeadline;
  // I revealed, opponent didn't, deadline passed → I can claim
  const canClaim =
    isConnected &&
    (isP1 || isP2) &&
    game.phase === 2 &&
    myMove !== 0 &&
    opponentMove === 0 &&
    deadlinePassed;

  const joinMoves = [
    { value: Move.Rock, label: "ROCK", color: "text-red-500", border: "border-red-500" },
    { value: Move.Paper, label: "PAPER", color: "text-blue-500", border: "border-blue-500" },
    { value: Move.Scissors, label: "SCISSORS", color: "text-yellow-500", border: "border-yellow-500" }
  ];

  return (
    <div className="min-h-[100dvh] p-4 md:p-8 max-w-4xl mx-auto flex flex-col w-full">
      <ParticleEffect trigger={showParticles} type="confetti" />
      <div className="mb-6 flex justify-between items-center">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          LOBBY
        </Link>
        <div className="arcade-box px-4 py-1 text-xs font-mono text-secondary">
          {formatEther(game.bet)} ETH POOL
        </div>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-6xl font-black arcade-text text-foreground drop-shadow-[0_0_10px_currentColor] mb-2">
          MATCH #{id.toString()}
        </h1>
      </div>

      <PhaseBar phase={game.phase} />

      {game.phase === 1 && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="arcade-box border-secondary/50 p-4 max-w-xl mx-auto mb-8 flex flex-col sm:flex-row gap-3 items-center justify-center flex-wrap"
        >
          <ShareDialog gameId={id!} bet={formatEther(game.bet)} />
          {canCancel && (
            <button
              onClick={handleCancel}
              disabled={cancelStatus === "submitting" || cancelStatus === "confirming"}
              className="arcade-btn px-3 py-1.5 text-xs flex items-center gap-2 bg-background !border-destructive !text-destructive hover:!bg-destructive/20"
            >
              {cancelStatus === "submitting" || cancelStatus === "confirming"
                ? "CANCELLING…"
                : "CANCEL & REFUND"}
            </button>
          )}
        </motion.div>
      )}

      {game.phase === 2 && revealDeadline > 0n && (
        <div className="arcade-box border-accent/40 p-3 max-w-xl mx-auto mb-8 text-center">
          <span className="font-mono text-xs text-muted-foreground tracking-widest mr-3">REVEAL DEADLINE</span>
          <CountdownTimer deadlineSecs={revealDeadline} className="text-lg font-bold" />
        </div>
      )}

      {game.phase === 5 && (
        <div className="arcade-box border-muted-foreground/40 p-6 text-center mb-8">
          <h2 className="text-2xl font-black arcade-text text-muted-foreground mb-1">CANCELLED</h2>
          <p className="font-mono text-sm text-muted-foreground">Bet refunded to creator.</p>
        </div>
      )}

      <div className="grid md:grid-cols-[1fr_auto_1fr] gap-6 items-center mb-12">
        {/* Player 1 Card */}
        <div className={`arcade-box p-6 flex flex-col items-center space-y-4 ${isP1 ? 'border-primary shadow-[0_0_15px_rgba(255,0,255,0.3)]' : ''}`}>
          <div className="font-bold arcade-text text-lg">PLAYER 1 {isP1 && <span className="text-primary text-xs ml-2">(YOU)</span>}</div>
          <div className="font-mono text-sm opacity-80">{shortAddress(game.player1)}</div>
          <div className="w-24 h-24 border-2 border-border/50 bg-black/40 flex items-center justify-center">
            {game.move1 !== 0 ? (
              <MoveIcon move={game.move1} className="w-12 h-12 text-primary" />
            ) : game.phase >= 2 ? (
               <ShieldQuestion className="w-10 h-10 text-muted-foreground animate-pulse" />
            ) : (
               <span className="font-mono text-xs text-muted-foreground text-center px-2">COMMITTED</span>
            )}
          </div>
          <div className="font-mono font-bold">{MOVE_LABELS[game.move1]}</div>
        </div>

        <div className="text-4xl font-black arcade-text text-muted-foreground opacity-50 flex justify-center">VS</div>

        {/* Player 2 Card */}
        <div className={`arcade-box p-6 flex flex-col items-center space-y-4 ${isP2 ? 'border-secondary shadow-[0_0_15px_rgba(0,255,255,0.3)]' : ''}`}>
          <div className="font-bold arcade-text text-lg">PLAYER 2 {isP2 && <span className="text-secondary text-xs ml-2">(YOU)</span>}</div>
          <div className="font-mono text-sm opacity-80">
            {game.player2 === "0x0000000000000000000000000000000000000000" ? "WAITING..." : shortAddress(game.player2)}
          </div>
          <div className="w-24 h-24 border-2 border-border/50 bg-black/40 flex items-center justify-center">
            {game.move2 !== 0 ? (
              <MoveIcon move={game.move2} className="w-12 h-12 text-secondary" />
            ) : game.phase === 1 ? (
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-secondary/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-secondary/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-secondary/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            ) : (
               <ShieldQuestion className="w-10 h-10 text-muted-foreground animate-pulse" />
            )}
          </div>
          <div className="font-mono font-bold">{MOVE_LABELS[game.move2]}</div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {game.phase >= 3 && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`arcade-box p-8 text-center mb-8 border-4 ${game.phase === 4 ? 'border-muted-foreground' : 'border-accent shadow-[0_0_30px_rgba(255,255,0,0.4)]'}`}
          >
            {game.phase === 4 ? (
              <div>
                <h2 className="text-3xl font-black arcade-text text-muted-foreground mb-2">DRAW</h2>
                <p className="font-mono text-sm">FUNDS REFUNDED</p>
              </div>
            ) : (
              <div>
                <Trophy className="w-16 h-16 text-accent mx-auto mb-4 drop-shadow-[0_0_10px_rgba(255,255,0,0.8)]" />
                <h2 className="text-4xl font-black arcade-text text-accent mb-2">WINNER</h2>
                <p className="font-mono text-xl">{shortAddress(game.winner)}</p>
                {me && game.winner.toLowerCase() === me && (
                  <p className="mt-4 text-accent font-bold arcade-text animate-pulse">YOU CLAIMED THE POT!</p>
                )}
              </div>
            )}
          </motion.div>
        )}

        {!isConnected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center mb-8">
            <button onClick={() => connect()} className="arcade-btn px-8 py-3 text-lg">
              CONNECT TO INTERACT
            </button>
          </motion.div>
        )}

        {canJoin && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="arcade-box border-secondary/80 p-6 max-w-xl mx-auto w-full">
            <h2 className="text-xl font-bold arcade-text text-center text-secondary mb-6">JOIN DUEL</h2>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {joinMoves.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setJoinMove(m.value as PlayableMove)}
                  className={`
                    flex flex-col items-center p-3 border-2 transition-all
                    ${joinMove === m.value ? `bg-${m.border.replace('border-', '')}/20 ${m.border} shadow-[0_0_10px_var(--tw-shadow-color)] shadow-${m.border.replace('border-', '')}/50` : 'border-border/30 hover:border-border'}
                  `}
                >
                  <MoveIcon move={m.value} className={`w-8 h-8 mb-2 ${joinMove === m.value ? m.color : 'text-muted-foreground'}`} />
                  <span className="text-xs font-bold arcade-text">{m.label}</span>
                </button>
              ))}
            </div>
            <button
              disabled={joinStatus === "submitting" || joinStatus === "confirming"}
              onClick={handleJoin}
              className="arcade-btn arcade-btn-secondary w-full py-4 text-lg"
            >
              {joinStatus === "submitting" ? "ENCRYPTING..." : 
               joinStatus === "confirming" ? "AWAITING NETWORK..." : 
               `MATCH ${formatEther(game.bet)} ETH`}
            </button>
            {joinError && <div className="mt-4 text-sm font-mono text-destructive text-center">{joinError.message}</div>}
          </motion.div>
        )}

        {canReveal && savedCommit && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="arcade-box border-primary/80 p-6 max-w-xl mx-auto w-full text-center">
            <h2 className="text-2xl font-black arcade-text text-primary mb-2">REVEAL PHASE</h2>
            <p className="font-mono text-sm mb-6">
              YOUR COMMITMENT: <strong className="text-primary bg-primary/10 px-2 py-1 border border-primary/30">{MOVE_LABELS[savedCommit.move]}</strong>
            </p>
            <button
              disabled={revealStatus === "submitting" || revealStatus === "confirming"}
              onClick={handleReveal}
              className="arcade-btn w-full py-4 text-xl"
            >
              {revealStatus === "submitting" ? "DECRYPTING..." : 
               revealStatus === "confirming" ? "AWAITING NETWORK..." : 
               "REVEAL MOVE"}
            </button>
            {revealError && <div className="mt-4 text-sm font-mono text-destructive text-center">{revealError.message}</div>}
          </motion.div>
        )}

        {canClaim && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="arcade-box border-accent/80 p-6 max-w-xl mx-auto w-full text-center">
            <Trophy className="w-12 h-12 text-accent mx-auto mb-3 drop-shadow-[0_0_10px_rgba(255,255,0,0.6)]" />
            <h2 className="text-2xl font-black arcade-text text-accent mb-2">OPPONENT TIMED OUT</h2>
            <p className="font-mono text-sm mb-6 text-muted-foreground">
              They failed to reveal within 24h. Claim the entire pot.
            </p>
            <button
              disabled={claimStatus === "submitting" || claimStatus === "confirming"}
              onClick={handleClaim}
              className="arcade-btn w-full py-4 text-xl !border-accent !text-accent hover:!bg-accent/20"
            >
              {claimStatus === "submitting"
                ? "SUBMITTING…"
                : claimStatus === "confirming"
                  ? "AWAITING NETWORK…"
                  : `CLAIM ${formatEther(game.bet * 2n)} ETH`}
            </button>
          </motion.div>
        )}

        {(isP1 || isP2) && game.phase === 2 && myMove === 0 && !savedCommit && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="arcade-box border-destructive p-6 max-w-xl mx-auto w-full flex items-start gap-4">
            <AlertTriangle className="w-8 h-8 text-destructive shrink-0" />
            <div>
              <h3 className="font-bold arcade-text text-destructive mb-1">SALT NOT FOUND</h3>
              <p className="font-mono text-sm text-destructive-foreground">
                Local storage missing commitment data. You must use the original browser/device that submitted the bet to reveal it.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
