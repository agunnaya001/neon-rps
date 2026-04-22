import { Link } from "wouter";
import { motion } from "framer-motion";
import { Gamepad2, Swords, Wallet, LogOut, Info } from "lucide-react";
import { useMyGames, useOpenGames } from "@/hooks/useGames";
import { useWallet, shortAddress } from "@/lib/wallet";
import { CONTRACT_ADDRESS } from "@/lib/contract";
import { formatEther } from "viem";

export default function Home() {
  const { address, isConnected, connect, disconnect } = useWallet();
  const { games: myGames, isLoading: loadingMine } = useMyGames();
  const { games: openGames, isLoading: loadingOpen } = useOpenGames();

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

  return (
    <div className="min-h-[100dvh] flex flex-col p-4 md:p-8 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-12 border-b-2 border-primary/50 pb-6">
        <div className="flex items-center gap-3">
          <Gamepad2 className="w-10 h-10 text-primary drop-shadow-[0_0_10px_rgba(255,0,255,0.8)]" />
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

      <div className="grid md:grid-cols-2 gap-8 md:gap-12">
        <section>
          <div className="flex items-center gap-3 mb-6 border-b border-primary/30 pb-2">
            <h2 className="text-xl font-bold arcade-text text-foreground">YOUR GAMES</h2>
            <span className="bg-primary/20 text-primary px-2 py-0.5 rounded font-mono text-sm border border-primary/50">
              {myGames.length}
            </span>
          </div>

          {loadingMine ? (
            <div className="animate-pulse font-mono text-primary/70">SCANNING...</div>
          ) : myGames.length === 0 ? (
            <div className="arcade-box p-8 text-center text-muted-foreground font-mono">
              NO ACTIVE DUELS FOUND
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
            <div className="animate-pulse font-mono text-secondary/70">SCANNING...</div>
          ) : openGames.length === 0 ? (
            <div className="arcade-box border-secondary/50 p-8 text-center text-muted-foreground font-mono">
              LOBBY IS EMPTY
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
    </div>
  );
}
