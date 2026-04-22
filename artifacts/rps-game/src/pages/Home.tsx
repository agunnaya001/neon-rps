import { useMemo } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Swords, Wallet, LogOut, Info, Activity } from "lucide-react";
import { useMyGames, useOpenGames, useAllGames } from "@/hooks/useGames";
import { useWallet, shortAddress } from "@/lib/wallet";
import { CONTRACT_ADDRESS } from "@/lib/contract";
import { formatEther } from "viem";
import { Footer } from "@/components/Footer";

export default function Home() {
  const { address, isConnected, connect, disconnect } = useWallet();
  const { games: myGames, isLoading: loadingMine } = useMyGames();
  const { games: openGames, isLoading: loadingOpen } = useOpenGames();
  const { games: allGames, isLoading: loadingAll } = useAllGames();

  const { wins, losses, ties } = useMemo(() => {
    if (!address) return { wins: 0, losses: 0, ties: 0 };
    const me = address.toLowerCase();
    const resolved = allGames.filter(g => g.phase >= 3 && (g.player1.toLowerCase() === me || g.player2.toLowerCase() === me));
    
    let w = 0, l = 0, t = 0;
    resolved.forEach(g => {
      if (g.phase === 4) t++;
      else if (g.winner.toLowerCase() === me) w++;
      else l++;
    });
    return { wins: w, losses: l, ties: t };
  }, [allGames, address]);

  const recentGames = useMemo(() => {
    return [...allGames].sort((a, b) => Number(b.id - a.id)).slice(0, 5);
  }, [allGames]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const SkeletonRow = () => (
    <div className="arcade-box p-4 animate-pulse flex justify-between items-center bg-primary/5">
      <div className="h-6 bg-primary/20 w-1/3 rounded"></div>
      <div className="h-6 bg-primary/20 w-1/4 rounded"></div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] flex flex-col p-4 md:p-8 max-w-5xl mx-auto w-full">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-12 border-b-2 border-primary/50 pb-6">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Neon RPS Logo" className="w-12 h-12 drop-shadow-[0_0_10px_rgba(255,0,255,0.8)]" />
          <h1 className="text-3xl md:text-4xl font-black arcade-text text-primary drop-shadow-[0_0_10px_rgba(255,0,255,0.5)]">
            NEON RPS
          </h1>
        </div>
        
        {isConnected ? (
          <button 
            onClick={() => disconnect()} 
            className="flex items-center gap-2 arcade-btn arcade-btn-secondary px-4 py-2 text-sm"
          >
            <span className="font-mono">{shortAddress(address)}</span>
            <LogOut className="w-4 h-4" />
          </button>
        ) : (
          <button 
            onClick={() => connect()} 
            className="flex items-center gap-2 arcade-btn px-6 py-2"
          >
            <Wallet className="w-5 h-5" />
            CONNECT WALLET
          </button>
        )}
      </header>

      {!CONTRACT_ADDRESS && (
        <div className="arcade-box border-destructive p-4 mb-8 text-destructive-foreground flex items-start gap-3">
          <Info className="w-6 h-6 shrink-0 mt-0.5 text-destructive" />
          <div>
            <h3 className="font-bold arcade-text mb-1 text-destructive">SYSTEM ERROR</h3>
            <p className="font-mono text-sm opacity-90">
              VITE_CONTRACT_ADDRESS not found. Deploy contract and insert coin to continue.
            </p>
          </div>
        </div>
      )}

      <div className="mb-12 flex justify-center">
        <Link href="/create" className="arcade-btn px-8 py-4 text-xl flex items-center gap-3 w-full md:w-auto justify-center">
          <Swords className="w-6 h-6" />
          START NEW DUEL
        </Link>
      </div>

      {isConnected && (
        <div className="mb-12">
          <h2 className="text-xl font-bold arcade-text text-foreground mb-4 border-b border-primary/30 pb-2">YOUR RECORD</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="arcade-box p-4 text-center border-accent/50 shadow-[0_0_10px_rgba(255,255,0,0.2)]">
              <div className="text-sm font-mono text-muted-foreground uppercase">Wins</div>
              <div className="text-3xl font-black arcade-text text-accent">{wins}</div>
            </div>
            <div className="arcade-box p-4 text-center border-destructive/50 shadow-[0_0_10px_rgba(255,0,0,0.2)]">
              <div className="text-sm font-mono text-muted-foreground uppercase">Losses</div>
              <div className="text-3xl font-black arcade-text text-destructive">{losses}</div>
            </div>
            <div className="arcade-box p-4 text-center border-muted-foreground/50">
              <div className="text-sm font-mono text-muted-foreground uppercase">Ties</div>
              <div className="text-3xl font-black arcade-text text-muted-foreground">{ties}</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8 md:gap-12 mb-12">
        <section>
          <div className="flex items-center gap-3 mb-6 border-b border-primary/30 pb-2">
            <h2 className="text-xl font-bold arcade-text text-foreground">YOUR GAMES</h2>
            <span className="bg-primary/20 text-primary px-2 py-0.5 rounded font-mono text-sm border border-primary/50">
              {myGames.length}
            </span>
          </div>

          {loadingMine ? (
            <div className="space-y-4">
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : myGames.length === 0 ? (
            <div className="arcade-box p-8 text-center flex flex-col items-center justify-center space-y-4">
              <Swords className="w-12 h-12 text-primary/30" />
              <div className="font-mono text-muted-foreground">NO ACTIVE DUELS FOUND</div>
              <Link href="/create" className="text-primary text-sm hover:underline font-mono">Initiate sequence? →</Link>
            </div>
          ) : (
            <motion.ul variants={container} initial="hidden" animate="show" className="space-y-4">
              {myGames.map((g) => (
                <motion.li key={g.id.toString()} variants={item}>
                  <Link href={`/game/${g.id}`} className="block arcade-box p-4 hover:border-primary transition-colors group">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-mono font-bold text-lg group-hover:text-primary transition-colors">#{g.id.toString()}</span>
                      <span className="text-xs uppercase tracking-widest bg-background/80 px-2 py-1 border border-border">
                        PHASE {g.phase}
                      </span>
                    </div>
                    <div className="text-sm font-mono text-muted-foreground flex justify-between">
                      <span>BET: {formatEther(g.bet)} ETH</span>
                    </div>
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </section>

        <section>
          <div className="flex items-center gap-3 mb-6 border-b border-secondary/30 pb-2">
            <h2 className="text-xl font-bold arcade-text text-secondary">OPEN LOBBY</h2>
            <span className="bg-secondary/20 text-secondary px-2 py-0.5 rounded font-mono text-sm border border-secondary/50">
              {openGames.length}
            </span>
          </div>

          {loadingOpen ? (
            <div className="space-y-4">
              <SkeletonRow />
              <SkeletonRow />
              <SkeletonRow />
            </div>
          ) : openGames.length === 0 ? (
            <div className="arcade-box border-secondary/50 p-8 text-center flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 rounded-full border-2 border-secondary/30 border-t-secondary animate-spin" />
              <div className="font-mono text-muted-foreground">No open duels.<br/>Be the first to throw down.</div>
            </div>
          ) : (
            <motion.ul variants={container} initial="hidden" animate="show" className="space-y-4">
              {openGames.map((g) => (
                <motion.li key={g.id.toString()} variants={item}>
                  <Link href={`/game/${g.id}`} className="block arcade-box border-secondary/50 p-4 hover:border-secondary transition-colors group">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-mono font-bold text-lg text-secondary">#{g.id.toString()}</span>
                      <span className="text-xs font-mono bg-secondary/10 text-secondary px-2 py-1 border border-secondary/30">
                        {formatEther(g.bet)} ETH
                      </span>
                    </div>
                    <div className="text-sm font-mono text-muted-foreground">
                      OPPONENT: <span className="text-foreground">{shortAddress(g.player1)}</span>
                    </div>
                  </Link>
                </motion.li>
              ))}
            </motion.ul>
          )}
        </section>
      </div>

      <section className="mb-12">
        <div className="flex items-center gap-3 mb-6 border-b border-border/50 pb-2">
          <Activity className="w-5 h-5 text-muted-foreground" />
          <h2 className="text-lg font-bold arcade-text text-muted-foreground">NETWORK ACTIVITY</h2>
        </div>
        <div className="arcade-box p-4">
          {loadingAll ? (
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-border/20 rounded w-full"></div>
              <div className="h-4 bg-border/20 rounded w-5/6"></div>
              <div className="h-4 bg-border/20 rounded w-4/6"></div>
            </div>
          ) : recentGames.length === 0 ? (
            <div className="text-center font-mono text-sm text-muted-foreground">No recent activity detected.</div>
          ) : (
            <div className="space-y-2 font-mono text-sm overflow-hidden">
              {recentGames.map(g => (
                <div key={g.id.toString()} className="flex justify-between items-center border-b border-border/20 pb-2 last:border-0 last:pb-0 whitespace-nowrap text-ellipsis">
                  <span className="text-muted-foreground">
                    <span className="text-foreground mr-2">#{g.id.toString()}</span>
                    {shortAddress(g.player1)} vs {g.player2 !== "0x0000000000000000000000000000000000000000" ? shortAddress(g.player2) : "????"}
                  </span>
                  <span className="flex items-center gap-3 shrink-0 ml-4">
                    <span className="text-secondary">{formatEther(g.bet)} ETH</span>
                    <span className="text-xs uppercase px-1 border border-border/50 bg-background/50 hidden sm:inline-block">
                      {g.phase === 1 ? "Active" : g.phase === 4 ? "Tied" : g.phase === 3 ? "Resolved" : "Active"}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
