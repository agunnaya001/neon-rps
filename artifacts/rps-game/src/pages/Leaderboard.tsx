import { Link } from "wouter";
import { ArrowLeft, Trophy, Crown } from "lucide-react";
import { formatEther } from "viem";
import { motion } from "framer-motion";
import { useLeaderboardData } from "@/hooks/useGames";
import { useWallet, shortAddress } from "@/lib/wallet";
import { Footer } from "@/components/Footer";
import { useEthPrice, formatUsd } from "@/lib/useEthPrice";

export default function Leaderboard() {
  const { rows, isLoading } = useLeaderboardData();
  const { address } = useWallet();
  const { data: ethPrice } = useEthPrice();
  const me = address?.toLowerCase();

  const totalWagered = rows.reduce((s, r) => s + r.totalWagered, 0n);
  const totalWageredUsd = formatUsd(totalWagered, ethPrice);

  return (
    <div className="min-h-[100dvh] flex flex-col p-4 md:p-8 max-w-4xl mx-auto w-full pb-20 md:pb-8">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-primary transition-colors">
          <ArrowLeft className="w-4 h-4" />
          LOBBY
        </Link>
      </div>

      <div className="text-center mb-10">
        <Crown className="w-16 h-16 text-accent mx-auto mb-4 drop-shadow-[0_0_10px_rgba(255,255,0,0.6)]" />
        <h1 className="text-4xl md:text-5xl font-black arcade-text text-accent drop-shadow-[0_0_10px_rgba(255,255,0,0.4)]">
          LEADERBOARD
        </h1>
        <p className="font-mono text-sm text-muted-foreground mt-2">
          Top duellists ranked by wins · then by net ETH profit
        </p>
      </div>

      <div className="arcade-box p-4 md:p-6">
        {isLoading ? (
          <div className="py-12 flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-2 border-accent/40 border-t-accent rounded-full animate-spin" />
            <div className="font-mono text-sm text-muted-foreground animate-pulse tracking-widest">
              INDEXING DUELS…
            </div>
          </div>
        ) : rows.length === 0 ? (
          <div className="py-12 text-center">
            <Trophy className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <div className="font-mono text-muted-foreground">
              No completed matches yet.<br />
              <span className="text-xs">Be the first to make history.</span>
            </div>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="overflow-x-auto"
          >
            <table className="w-full font-mono text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-widest text-muted-foreground border-b border-border/50">
                  <th className="text-left py-3 px-2">#</th>
                  <th className="text-left py-3 px-2">Player</th>
                  <th className="text-right py-3 px-2">W</th>
                  <th className="text-right py-3 px-2">L</th>
                  <th className="text-right py-3 px-2">T</th>
                  <th className="text-right py-3 px-2 hidden sm:table-cell">Wagered</th>
                  <th className="text-right py-3 px-2">Net ETH</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const isMe = me && r.address.toLowerCase() === me;
                  const profit = Number(r.netProfit) / 1e18;
                  const wageredUsd = formatUsd(r.totalWagered, ethPrice);
                  return (
                    <motion.tr
                      key={r.address}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className={`border-b border-border/20 transition-all ${isMe ? "bg-primary/10 border-primary/30" : ""}`}
                      whileHover={{ backgroundColor: "rgba(255,0,255,0.05)" }}
                    >
                      <td className="py-3 px-2">
                        {i === 0 ? (
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                          >
                            <Trophy className="w-4 h-4 text-accent" />
                          </motion.div>
                        ) : i === 1 ? (
                          <span className="text-muted-foreground font-bold">2</span>
                        ) : i === 2 ? (
                          <span className="text-muted-foreground font-bold">3</span>
                        ) : (
                          <span className="text-muted-foreground">{i + 1}</span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <span className={isMe ? "text-primary font-bold" : "text-foreground"}>
                          {shortAddress(r.address)}
                        </span>
                        {isMe && (
                          <span className="ml-2 text-[10px] uppercase text-primary tracking-widest">you</span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right text-accent font-bold">{r.wins}</td>
                      <td className="py-3 px-2 text-right text-destructive">{r.losses}</td>
                      <td className="py-3 px-2 text-right text-muted-foreground">{r.ties}</td>
                      <td className="py-3 px-2 text-right hidden sm:table-cell">
                        <div className="text-muted-foreground tabular-nums">{formatEther(r.totalWagered).slice(0, 8)}</div>
                        {wageredUsd && <div className="text-muted-foreground/50 text-[10px]">{wageredUsd}</div>}
                      </td>
                      <td className={`py-3 px-2 text-right tabular-nums font-bold ${profit >= 0 ? "text-secondary" : "text-destructive"}`}>
                        {profit >= 0 ? "+" : ""}
                        {profit.toFixed(4)}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xs font-mono text-muted-foreground mt-4 text-right"
            >
              {rows.length} player{rows.length === 1 ? "" : "s"} · Total wagered{" "}
              {formatEther(totalWagered).slice(0, 8)} ETH
              {totalWageredUsd && <span className="ml-1 text-muted-foreground/60">({totalWageredUsd})</span>}
            </motion.div>
          </motion.div>
        )}
      </div>

      <Footer />
    </div>
  );
}
