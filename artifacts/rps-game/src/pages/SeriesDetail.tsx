import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useParams } from "wouter";
import { formatEther } from "viem";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Hand, HandMetal, Scissors, Trophy, AlertTriangle, ShieldQuestion, RefreshCcw, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useChainId } from "wagmi";
import { useSeries, useBot3FeeBps } from "@/hooks/useBot3Series";
import {
  useJoinSeries,
  useCommitRound,
  useRevealRound,
  useCancelSeries,
  useClaimByDefaultSeries,
} from "@/hooks/useBot3Actions";
import { useWallet, shortAddress } from "@/lib/wallet";
import { Move, MOVE_LABELS, type PlayableMove } from "@/lib/contract";
import { Bo3Phase } from "@/lib/bot3-contract";
import { getChainName } from "@/lib/wagmi";
import { parseContractError } from "@/lib/errors";
import { loadSeriesCommitment } from "@/lib/bot3-salt-store";
import { SaltModal } from "@/components/SaltModal";
import { CountdownTimer } from "@/components/CountdownTimer";
import { ParticleEffect } from "@/components/ParticleEffect";
import { FeeBreakdown } from "@/components/FeeBreakdown";
import { Footer } from "@/components/Footer";
import { EthAmount } from "@/components/EthAmount";

const REVEAL_TIMEOUT = BigInt(24 * 60 * 60);

const MoveIcon = ({ move, className }: { move: number; className?: string }) => {
  switch (move) {
    case 1: return <HandMetal className={className} />;
    case 2: return <Hand className={className} />;
    case 3: return <Scissors className={className} />;
    default: return <ShieldQuestion className={className} />;
  }
};

const WinPips = ({ wins, color }: { wins: number; color: "primary" | "secondary" }) => (
  <div className="flex gap-2 justify-center">
    {[0, 1].map((i) => (
      <div
        key={i}
        className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${
          i < wins
            ? color === "primary"
              ? "bg-primary border-primary shadow-[0_0_8px_rgba(255,0,255,0.8)]"
              : "bg-secondary border-secondary shadow-[0_0_8px_rgba(0,255,255,0.8)]"
            : "bg-transparent border-border/40"
        }`}
      />
    ))}
  </div>
);

const moves = [
  { value: Move.Rock, label: "ROCK", icon: HandMetal, color: "text-red-500", border: "border-red-500" },
  { value: Move.Paper, label: "PAPER", icon: Hand, color: "text-blue-500", border: "border-blue-500" },
  { value: Move.Scissors, label: "SCISSORS", icon: Scissors, color: "text-yellow-500", border: "border-yellow-500" },
];

export default function SeriesDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id ? BigInt(params.id) : undefined;
  const { series, isLoading } = useSeries(id);
  const { address, isConnected, connect } = useWallet();
  const [, setLocation] = useLocation();
  const chainName = getChainName(useChainId());
  const feeBps = useBot3FeeBps();

  const { joinSeries, status: joinStatus, error: joinError, pendingSalt: joinSalt, clearPendingSalt: clearJoinSalt } = useJoinSeries();
  const { commitRound, status: commitStatus, error: commitError, pendingSalt: commitSalt, clearPendingSalt: clearCommitSalt } = useCommitRound();
  const { revealRound, status: revealStatus, error: revealError } = useRevealRound();
  const { cancelSeries, status: cancelStatus } = useCancelSeries();
  const { claimByDefault, status: claimStatus } = useClaimByDefaultSeries();

  const [joinMove, setJoinMove] = useState<PlayableMove>(Move.Rock);
  const [commitMove, setCommitMove] = useState<PlayableMove>(Move.Rock);
  const [showParticles, setShowParticles] = useState(false);
  const [copied, setCopied] = useState(false);

  const me = address?.toLowerCase();
  const isP1 = !!(me && series?.player1.toLowerCase() === me);
  const isP2 = !!(me && series?.player2.toLowerCase() === me);

  const savedCommit = useMemo(() => {
    if (!id || !address || !series || series.phase !== Bo3Phase.Revealing) return null;
    return loadSeriesCommitment(id, series.currentRound, address);
  }, [id, address, series?.currentRound, series?.phase]);

  useEffect(() => {
    if (!series || !me) return undefined;
    if (series.phase === Bo3Phase.Completed) {
      const iWon = (isP1 && series.wins1 >= 2) || (isP2 && series.wins2 >= 2);
      if (iWon) {
        setShowParticles(true);
        const t = setTimeout(() => setShowParticles(false), 3000);
        return () => clearTimeout(t);
      }
    }
    return undefined;
  }, [series?.phase, me]);

  if (!id) return <div className="p-8 font-mono text-destructive text-center mt-20">INVALID SERIES ID</div>;

  if (isLoading) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 max-w-4xl mx-auto w-full">
      <div className="animate-pulse font-mono text-xl text-secondary tracking-widest mb-8">LOADING SERIES…</div>
      <div className="w-full h-2 bg-secondary/20 rounded overflow-hidden">
        <div className="h-full bg-secondary w-1/3 animate-[slide_2s_infinite]"></div>
      </div>
      <style>{`@keyframes slide { 0% { transform: translateX(-100%); } 100% { transform: translateX(300%); } }`}</style>
    </div>
  );

  if (!series || series.phase === Bo3Phase.Empty) return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8 max-w-4xl mx-auto w-full text-center">
      <div className="font-mono text-6xl font-bold text-secondary tracking-widest mb-6" style={{ textShadow: "0 0 24px currentColor" }}>404</div>
      <div className="font-mono text-2xl tracking-widest mb-3">SERIES NOT FOUND</div>
      <div className="font-mono text-sm text-muted-foreground mb-10">
        Series #{id.toString()} doesn't exist or was cancelled.
      </div>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link href="/"><button className="arcade-box px-6 py-3 font-mono text-sm tracking-widest hover:bg-primary/10 transition-colors">← LOBBY</button></Link>
        <Link href="/series/new"><button className="arcade-box border-secondary px-6 py-3 font-mono text-sm tracking-widest text-secondary hover:bg-secondary/10 transition-colors">NEW SERIES →</button></Link>
      </div>
    </div>
  );

  const revealDeadline = series.phase === Bo3Phase.Revealing && series.roundStartedAt > 0n
    ? series.roundStartedAt + REVEAL_TIMEOUT
    : 0n;
  const now = BigInt(Math.floor(Date.now() / 1000));
  const deadlinePassed = revealDeadline > 0n && now > revealDeadline;

  const myRevealed = isP1 ? series.revealed1 : isP2 ? series.revealed2 : false;
  const myCommitted = isP1 ? series.committed1 : isP2 ? series.committed2 : false;
  const oppRevealed = isP1 ? series.revealed2 : series.revealed1;

  const canJoin = isConnected && !isP1 && series.phase === Bo3Phase.WaitingForOpponent;
  const canReveal = isConnected && (isP1 || isP2) && series.phase === Bo3Phase.Revealing && !myRevealed && !!savedCommit;
  const canCommit = isConnected && (isP1 || isP2) && series.phase === Bo3Phase.Committing && !myCommitted;
  const canCancel = isConnected && isP1 && series.phase === Bo3Phase.WaitingForOpponent;
  const canClaim = isConnected && (isP1 || isP2) && series.phase === Bo3Phase.Revealing
    && myRevealed && !oppRevealed && deadlinePassed;

  const seriesUrl = `${window.location.origin}/series/${id.toString()}`;

  async function handleJoin() {
    if (!id) return;
    try {
      const toastId = toast(`Confirming on ${chainName}…`);
      await joinSeries(id, joinMove, series!.bet);
      toast.dismiss(toastId);
      toast.success("Joined series! Round 1 committed.");
    } catch (err) { toast.error(parseContractError(err)); }
  }

  async function handleReveal() {
    if (!id || !savedCommit) return;
    try {
      const toastId = toast(`Confirming on ${chainName}…`);
      await revealRound(id, savedCommit.move as PlayableMove, savedCommit.salt);
      toast.dismiss(toastId);
      toast.success("Move revealed!");
    } catch (err) { toast.error(parseContractError(err)); }
  }

  async function handleCommit() {
    if (!id || !series) return;
    try {
      const toastId = toast(`Confirming on ${chainName}…`);
      await commitRound(id, series.currentRound, commitMove);
      toast.dismiss(toastId);
      toast.success(`Round ${series.currentRound} committed!`);
    } catch (err) { toast.error(parseContractError(err)); }
  }

  async function handleCancel() {
    if (!id) return;
    try {
      const toastId = toast(`Cancelling on ${chainName}…`);
      await cancelSeries(id);
      toast.dismiss(toastId);
      toast.success("Series cancelled, stake refunded.");
    } catch (err) { toast.error(parseContractError(err)); }
  }

  async function handleClaim() {
    if (!id) return;
    try {
      const toastId = toast(`Claiming pot on ${chainName}…`);
      await claimByDefault(id);
      toast.dismiss(toastId);
      toast.success("Pot claimed by default!");
    } catch (err) { toast.error(parseContractError(err)); }
  }

  function handleCopyLink() {
    void navigator.clipboard?.writeText(seriesUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Link copied!");
  }

  return (
    <div className="min-h-[100dvh] p-4 md:p-8 max-w-4xl mx-auto flex flex-col w-full pb-20 md:pb-8">
      <ParticleEffect trigger={showParticles} type="confetti" />

      {joinSalt && <SaltModal salt={joinSalt} onConfirm={clearJoinSalt} />}
      {commitSalt && <SaltModal salt={commitSalt} onConfirm={clearCommitSalt} />}

      <div className="mb-6 flex justify-between items-center">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-secondary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          LOBBY
        </Link>
        <div className="arcade-box border-secondary/50 px-4 py-1 text-xs font-mono text-secondary">
          <EthAmount wei={series.bet} className="text-secondary" /> STAKE
        </div>
      </div>

      <div className="text-center mb-6">
        <h1 className="text-4xl md:text-5xl font-black arcade-text text-secondary drop-shadow-[0_0_10px_rgba(0,255,255,0.5)] mb-1">
          SERIES #{id.toString()}
        </h1>
        <p className="font-mono text-xs text-muted-foreground tracking-widest uppercase">
          {series.phase === Bo3Phase.WaitingForOpponent ? "Waiting for opponent" :
           series.phase === Bo3Phase.Revealing ? `Round ${series.currentRound} · Reveal phase` :
           series.phase === Bo3Phase.Committing ? `Round ${series.currentRound} · Commit phase` :
           series.phase === Bo3Phase.Completed ? "Series complete" : ""}
        </p>
      </div>

      {/* Score */}
      <div className="arcade-box border-border/30 p-6 max-w-lg mx-auto w-full mb-8">
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
          <div className="text-center space-y-2">
            <div className="font-mono text-xs text-muted-foreground">
              {isP1 ? <span className="text-primary font-bold">YOU</span> : shortAddress(series.player1)}
            </div>
            <div className="text-5xl font-black arcade-text text-primary">{series.wins1}</div>
            <WinPips wins={series.wins1} color="primary" />
          </div>
          <div className="font-mono text-2xl text-muted-foreground/40 font-bold">VS</div>
          <div className="text-center space-y-2">
            <div className="font-mono text-xs text-muted-foreground">
              {isP2 ? <span className="text-secondary font-bold">YOU</span> :
               series.player2 === "0x0000000000000000000000000000000000000000" ? "?" : shortAddress(series.player2)}
            </div>
            <div className="text-5xl font-black arcade-text text-secondary">{series.wins2}</div>
            <WinPips wins={series.wins2} color="secondary" />
          </div>
        </div>
        {series.phase !== Bo3Phase.WaitingForOpponent && series.phase !== Bo3Phase.Completed && (
          <div className="mt-4 pt-4 border-t border-border/20 text-center">
            <span className="font-mono text-xs text-muted-foreground tracking-widest">
              ROUND {series.currentRound} OF UP TO 3
            </span>
          </div>
        )}
      </div>

      {/* Reveal deadline */}
      {series.phase === Bo3Phase.Revealing && revealDeadline > 0n && (
        <div className="arcade-box border-accent/40 p-3 max-w-lg mx-auto w-full mb-6 text-center">
          <span className="font-mono text-xs text-muted-foreground tracking-widest mr-3">REVEAL DEADLINE</span>
          <CountdownTimer deadlineSecs={revealDeadline} className="text-lg font-bold" />
        </div>
      )}

      <AnimatePresence mode="wait">
        {/* Phase 1: Waiting for opponent */}
        {series.phase === Bo3Phase.WaitingForOpponent && isP1 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="arcade-box border-secondary/40 p-6 max-w-lg mx-auto w-full mb-6 space-y-4">
            <h2 className="font-bold arcade-text text-secondary text-center tracking-widest">SHARE TO CHALLENGE</h2>
            <p className="font-mono text-xs text-muted-foreground text-center">
              Send this link to your opponent — they join with their stake and move.
            </p>
            <div className="flex gap-2">
              <div className="flex-1 bg-black border border-border/40 p-2 font-mono text-xs text-muted-foreground overflow-hidden text-ellipsis whitespace-nowrap">
                {seriesUrl}
              </div>
              <button onClick={handleCopyLink}
                className="arcade-btn px-3 py-2 !border-secondary !text-secondary hover:!bg-secondary/20 flex items-center gap-1.5 text-xs">
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? "COPIED" : "COPY"}
              </button>
            </div>
            <FeeBreakdown bet={series.bet} feeBps={feeBps} className="mt-2" />
            {canCancel && (
              <button onClick={handleCancel}
                disabled={cancelStatus === "submitting" || cancelStatus === "confirming"}
                className="arcade-btn w-full py-2 text-xs !border-destructive !text-destructive hover:!bg-destructive/20">
                {cancelStatus === "submitting" || cancelStatus === "confirming" ? "CANCELLING…" : "CANCEL & REFUND STAKE"}
              </button>
            )}
          </motion.div>
        )}

        {/* Phase 1: Join form for P2 */}
        {canJoin && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="arcade-box border-secondary/80 p-6 max-w-lg mx-auto w-full mb-6">
            <h2 className="text-xl font-bold arcade-text text-center text-secondary mb-2">JOIN SERIES</h2>
            <p className="font-mono text-xs text-muted-foreground text-center mb-6">
              Stake <EthAmount wei={series.bet} showUsd={false} /> · Best of 3 rounds · First to 2 wins
            </p>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {moves.map((m) => {
                const Icon = m.icon;
                const sel = joinMove === m.value;
                return (
                  <button key={m.value} onClick={() => setJoinMove(m.value as PlayableMove)}
                    className={`flex flex-col items-center p-3 border-2 transition-all ${sel ? `${m.border} bg-${m.border.replace('border-','')}/10` : 'border-border/30 hover:border-border'}`}>
                    <Icon className={`w-8 h-8 mb-2 ${sel ? m.color : 'text-muted-foreground'}`} />
                    <span className="text-xs font-bold arcade-text">{m.label}</span>
                  </button>
                );
              })}
            </div>
            <FeeBreakdown bet={series.bet} feeBps={feeBps} className="mb-4" />
            <button disabled={joinStatus === "submitting" || joinStatus === "confirming"}
              onClick={handleJoin} className="arcade-btn arcade-btn-secondary w-full py-4 text-lg">
              {joinStatus === "submitting" ? "ENCRYPTING…" :
               joinStatus === "confirming" ? "AWAITING NETWORK…" :
               <><span>JOIN · STAKE </span><EthAmount wei={series.bet} showUsd={false} /></>}
            </button>
            {joinError && <div className="mt-3 text-sm font-mono text-destructive text-center">{parseContractError(joinError)}</div>}
          </motion.div>
        )}

        {/* Waiting for P2 as spectator */}
        {series.phase === Bo3Phase.WaitingForOpponent && !isP1 && !canJoin && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="arcade-box border-border/30 p-6 max-w-lg mx-auto w-full mb-6 text-center">
            <div className="font-mono text-muted-foreground">Waiting for opponent to join…</div>
          </motion.div>
        )}

        {/* Phase 2: Reveal */}
        {series.phase === Bo3Phase.Revealing && (isP1 || isP2) && (
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="arcade-box border-primary/80 p-6 max-w-lg mx-auto w-full mb-6 text-center space-y-4">
            {myRevealed ? (
              <>
                <h2 className="text-xl font-bold arcade-text text-primary">MOVE REVEALED</h2>
                <div className="font-mono text-sm text-muted-foreground">
                  Waiting for opponent to reveal…
                </div>
                <div className="flex justify-center gap-3 pt-2">
                  <div className={`w-8 h-8 rounded-full border-2 ${(isP1 ? series.revealed1 : series.revealed2) ? 'bg-primary border-primary' : 'border-border'}`} />
                  <div className={`w-8 h-8 rounded-full border-2 ${(isP1 ? series.revealed2 : series.revealed1) ? 'bg-secondary border-secondary' : 'border-border animate-pulse'}`} />
                </div>
              </>
            ) : canReveal && savedCommit ? (
              <>
                <h2 className="text-2xl font-black arcade-text text-primary">REVEAL YOUR MOVE</h2>
                <p className="font-mono text-sm">
                  COMMITTED: <strong className="text-primary bg-primary/10 px-2 py-1 border border-primary/30">{MOVE_LABELS[savedCommit.move]}</strong>
                </p>
                <button disabled={revealStatus === "submitting" || revealStatus === "confirming"}
                  onClick={handleReveal} className="arcade-btn w-full py-4 text-xl">
                  {revealStatus === "submitting" ? "DECRYPTING…" :
                   revealStatus === "confirming" ? "AWAITING NETWORK…" : "REVEAL MOVE"}
                </button>
                {revealError && <div className="text-sm font-mono text-destructive">{parseContractError(revealError)}</div>}
              </>
            ) : (
              <motion.div className="flex items-start gap-4">
                <AlertTriangle className="w-7 h-7 text-destructive shrink-0" />
                <div className="text-left">
                  <h3 className="font-bold arcade-text text-destructive mb-1">SALT NOT FOUND</h3>
                  <p className="font-mono text-xs text-destructive-foreground">
                    Commitment data not in this browser. Use the original device or restore your backed-up salt.
                  </p>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Phase 3: Commit next round */}
        {series.phase === Bo3Phase.Committing && (isP1 || isP2) && (
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="arcade-box border-secondary/80 p-6 max-w-lg mx-auto w-full mb-6">
            {myCommitted ? (
              <div className="text-center space-y-3">
                <h2 className="text-xl font-bold arcade-text text-secondary">ROUND {series.currentRound} COMMITTED</h2>
                <p className="font-mono text-sm text-muted-foreground">Waiting for opponent to commit…</p>
                <div className="flex justify-center gap-3 pt-2">
                  <div className={`w-8 h-8 rounded-full border-2 ${(isP1 ? series.committed1 : series.committed2) ? 'bg-secondary border-secondary' : 'border-border'}`} />
                  <div className={`w-8 h-8 rounded-full border-2 ${(isP1 ? series.committed2 : series.committed1) ? 'bg-secondary border-secondary' : 'border-border animate-pulse'}`} />
                </div>
              </div>
            ) : canCommit ? (
              <>
                <h2 className="text-2xl font-black arcade-text text-secondary text-center mb-5">
                  COMMIT ROUND {series.currentRound}
                </h2>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {moves.map((m) => {
                    const Icon = m.icon;
                    const sel = commitMove === m.value;
                    return (
                      <button key={m.value} onClick={() => setCommitMove(m.value as PlayableMove)}
                        className={`flex flex-col items-center p-3 border-2 transition-all ${sel ? `${m.border} bg-${m.border.replace('border-','')}/10 scale-105` : 'border-border/30 hover:border-border'}`}>
                        <Icon className={`w-8 h-8 mb-2 ${sel ? m.color : 'text-muted-foreground'}`} />
                        <span className="text-xs font-bold arcade-text">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
                <button disabled={commitStatus === "submitting" || commitStatus === "confirming"}
                  onClick={handleCommit} className="arcade-btn arcade-btn-secondary w-full py-4 text-lg">
                  {commitStatus === "submitting" ? "ENCRYPTING…" :
                   commitStatus === "confirming" ? "AWAITING NETWORK…" : `COMMIT ROUND ${series.currentRound}`}
                </button>
                {commitError && <div className="mt-3 text-sm font-mono text-destructive text-center">{parseContractError(commitError)}</div>}
              </>
            ) : null}
          </motion.div>
        )}

        {/* Phase 4: Completed */}
        {series.phase === Bo3Phase.Completed && (
          <>
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="arcade-box p-8 text-center mb-6 border-4 border-accent shadow-[0_0_30px_rgba(255,255,0,0.4)]">
              <Trophy className="w-16 h-16 text-accent mx-auto mb-4 drop-shadow-[0_0_10px_rgba(255,255,0,0.8)]" />
              <h2 className="text-4xl font-black arcade-text text-accent mb-2">SERIES WINNER</h2>
              <p className="font-mono text-xl mb-2">
                {series.wins1 >= 2 ? (isP1 ? "YOU" : shortAddress(series.player1))
                  : (isP2 ? "YOU" : shortAddress(series.player2))}
              </p>
              <p className="font-mono text-sm text-muted-foreground mb-2">
                Final score: {series.wins1} – {series.wins2}
              </p>
              {((isP1 && series.wins1 >= 2) || (isP2 && series.wins2 >= 2)) && (
                <p className="mt-4 text-accent font-bold arcade-text animate-pulse">YOU TOOK THE SERIES!</p>
              )}
              <FeeBreakdown bet={series.bet} feeBps={feeBps} className="mt-4 max-w-sm mx-auto text-left" />
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="flex justify-center mb-6">
              <button onClick={() => setLocation(`/series/new?bet=${formatEther(series.bet)}`)}
                className="arcade-btn px-6 py-3 flex items-center gap-2 !border-secondary !text-secondary hover:!bg-secondary/20">
                <RefreshCcw className="w-4 h-4" />
                REMATCH (<EthAmount wei={series.bet} showUsd={false} />)
              </button>
            </motion.div>
          </>
        )}

        {/* Claim by default */}
        {canClaim && (
          <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="arcade-box border-accent/80 p-6 max-w-lg mx-auto w-full mb-6 text-center space-y-4">
            <Trophy className="w-12 h-12 text-accent mx-auto drop-shadow-[0_0_10px_rgba(255,255,0,0.6)]" />
            <h2 className="text-2xl font-black arcade-text text-accent">OPPONENT TIMED OUT</h2>
            <p className="font-mono text-sm text-muted-foreground">
              They failed to reveal within 24 hours. Claim the entire pot.
            </p>
            <button disabled={claimStatus === "submitting" || claimStatus === "confirming"}
              onClick={handleClaim}
              className="arcade-btn w-full py-4 text-xl !border-accent !text-accent hover:!bg-accent/20">
              {claimStatus === "submitting" ? "SUBMITTING…" :
               claimStatus === "confirming" ? "AWAITING NETWORK…" :
               <><span>CLAIM </span><EthAmount wei={series.bet * 2n} showUsd={false} /></>}
            </button>
          </motion.div>
        )}

        {/* Connect prompt for spectators/non-players */}
        {!isConnected && series.phase === Bo3Phase.WaitingForOpponent && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-center mb-6">
            <button onClick={() => connect()} className="arcade-btn arcade-btn-secondary px-8 py-3 text-lg">
              CONNECT TO JOIN
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
