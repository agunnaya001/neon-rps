import { useMemo } from "react";
import { Link } from "wouter";
import { ArrowLeft, Trophy, Crown } from "lucide-react";
import { formatEther } from "viem";
import { useAllGames } from "@/hooks/useGames";
import { useWallet, shortAddress } from "@/lib/wallet";
import { Footer } from "@/components/Footer";

type Row = {
  address: `0x${string}`;
  wins: number;
  losses: number;
  ties: number;
  totalWagered: bigint;
  netProfit: bigint;
};

export default function Leaderboard() {
  const { games, isLoading } = useAllGames();
  const { address } = useWallet();

  const rows = useMemo<Row[]>(() => {
    const map = new Map<string, Row>();
    const ensure = (addr: `0x${string}`): Row => {
      const k = addr.toLowerCase();
      let row = map.get(k);
      if (!row) {
        row = {
          address: addr,
          wins: 0,
          losses: 0,
          ties: 0,
          totalWagered: 0n,
          netProfit: 0n,
        };
        map.set(k, row);
      }
      return row;
    };

    for (const g of games) {
      const isP1 = g.player1 !== "0x0000000000000000000000000000000000000000";
      const isP2 = g.player2 !== "0x0000000000000000000000000000000000000000";
      if (isP1) {
        const r = ensure(g.player1);
        if (g.phase === 2 || g.phase === 3 || g.phase === 4) r.totalWagered += g.bet;
      }
      if (isP2) {
        const r = ensure(g.player2);
        if (g.phase === 2 || g.phase === 3 || g.phase === 4) r.totalWagered += g.bet;
      }

      // Resolved with winner
      if (g.phase === 3 && g.winner !== "0x0000000000000000000000000000000000000000") {
        const winner = ensure(g.winner);
        winner.wins += 1;
        winner.netProfit += g.bet;
        const loserAddr =
          g.winner.toLowerCase() === g.player1.toLowerCase() ? g.player2 : g.player1;
        if (loserAddr !== "0x0000000000000000000000000000000000000000") {
          const loser = ensure(loserAddr);
          loser.losses += 1;
          loser.netProfit -= g.bet;
        }
      }
      // Tie
      if (g.phase === 4) {
        if (isP1) ensure(g.player1).ties += 1;
        if (isP2) ensure(g.player2).ties += 1;
      }
    }

    return Array.from(map.values())
      .filter((r) => r.wins + r.losses + r.ties > 0)
      .sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        return Number(b.netProfit - a.netProfit);
      });
  }, [games]);

  const me = address?.toLowerCase();

  return (
    <div className="min-h-[100dvh] flex flex-col p-4 md:p-8 max-w-4xl mx-auto w-full">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          LOBBY
        </Link>
      </div>

      <div className="text-center mb-12">
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
          <div className="font-mono text-center text-muted-foreground py-8 animate-pulse">
            INDEXING DUELS…
          </div>
        ) : rows.length === 0 ? (
          <div className="font-mono text-center text-muted-foreground py-8">
            No completed matches yet. Be the first to make history.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full font-mono text-sm">
              <thead>
                <tr className="text-xs uppercase tracking-widest text-muted-foreground border-b border-border/50">
                  <th className="text-left py-3 px-2">#</th>
                  <th className="text-left py-3 px-2">Player</th>
                  <th className="text-right py-3 px-2">W</th>
                  <th className="text-right py-3 px-2">L</th>
                  <th className="text-right py-3 px-2">T</th>
                  <th className="text-right py-3 px-2">Net ETH</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => {
                  const isMe = me && r.address.toLowerCase() === me;
                  const profit = Number(r.netProfit) / 1e18;
                  return (
                    <tr
                      key={r.address}
                      className={`border-b border-border/20 ${isMe ? "bg-primary/10" : ""}`}
                    >
                      <td className="py-3 px-2">
                        {i === 0 ? (
                          <Trophy className="w-4 h-4 text-accent" />
                        ) : (
                          <span className="text-muted-foreground">{i + 1}</span>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        <span className={isMe ? "text-primary font-bold" : "text-foreground"}>
                          {shortAddress(r.address)}
                        </span>
                        {isMe && (
                          <span className="ml-2 text-[10px] uppercase text-primary tracking-widest">
                            you
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-2 text-right text-accent font-bold">{r.wins}</td>
                      <td className="py-3 px-2 text-right text-destructive">{r.losses}</td>
                      <td className="py-3 px-2 text-right text-muted-foreground">{r.ties}</td>
                      <td
                        className={`py-3 px-2 text-right tabular-nums ${profit >= 0 ? "text-secondary" : "text-destructive"}`}
                      >
                        {profit >= 0 ? "+" : ""}
                        {profit.toFixed(4)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div className="text-xs font-mono text-muted-foreground mt-4 text-right">
              Showing {rows.length} player{rows.length === 1 ? "" : "s"} · Wagered total{" "}
              {formatEther(rows.reduce((s, r) => s + r.totalWagered, 0n))} ETH
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
