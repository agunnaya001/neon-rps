import { useMemo, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Wallet, TrendingUp, Award, Clock } from "lucide-react";
import { formatEther } from "viem";
import { getTreasuryData, FEE_CONFIG } from "@/lib/fee-utils";

export function TreasuryDashboard() {
  const [treasury, setTreasury] = useState(() => getTreasuryData());
  const [gameCount, setGameCount] = useState(0);

  useEffect(() => {
    // Refresh every 5 seconds
    const interval = setInterval(() => {
      setTreasury(getTreasuryData());
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const stats = useMemo(() => {
    return {
      totalFees: formatEther(treasury.totalFeesCollected),
      rewardPool: formatEther(treasury.seasonalRewardPool),
      gamesProcessed: treasury.games.length,
      averageFee: treasury.games.length > 0
        ? formatEther(treasury.totalFeesCollected / BigInt(treasury.games.length))
        : "0",
    };
  }, [treasury]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 mb-6 border-b border-primary/30 pb-3">
        <Wallet className="w-5 h-5 text-secondary" />
        <h3 className="text-lg font-bold arcade-text text-foreground">TREASURY STATUS</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Total Fees */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="arcade-box p-4 border-secondary/50 bg-secondary/5 hover:bg-secondary/10 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-mono text-muted-foreground">Fees Collected</span>
            <TrendingUp className="w-4 h-4 text-secondary" />
          </div>
          <div className="text-xl md:text-2xl font-black arcade-text text-secondary">
            {stats.totalFees}
          </div>
          <div className="text-xs text-muted-foreground mt-1">ETH</div>
        </motion.div>

        {/* Reward Pool */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="arcade-box p-4 border-accent/50 bg-accent/5 hover:bg-accent/10 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-mono text-muted-foreground">Reward Pool</span>
            <Award className="w-4 h-4 text-accent" />
          </div>
          <div className="text-xl md:text-2xl font-black arcade-text text-accent">
            {stats.rewardPool}
          </div>
          <div className="text-xs text-muted-foreground mt-1">ETH</div>
        </motion.div>

        {/* Games Processed */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="arcade-box p-4 border-primary/50 bg-primary/5 hover:bg-primary/10 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-mono text-muted-foreground">Games</span>
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <div className="text-xl md:text-2xl font-black arcade-text text-primary">
            {stats.gamesProcessed}
          </div>
          <div className="text-xs text-muted-foreground mt-1">Processed</div>
        </motion.div>

        {/* Fee Rate */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="arcade-box p-4 border-muted-foreground/50 bg-muted-foreground/5 hover:bg-muted-foreground/10 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase font-mono text-muted-foreground">Fee Rate</span>
            <Wallet className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="text-xl md:text-2xl font-black arcade-text text-muted-foreground">
            {FEE_CONFIG.PLATFORM_FEE_PERCENT}%
          </div>
          <div className="text-xs text-muted-foreground mt-1">Per Bet</div>
        </motion.div>
      </div>

      {/* Treasury Allocation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="arcade-box p-4 border-primary/30 bg-background/50"
      >
        <h4 className="text-sm font-bold arcade-text text-foreground mb-3 uppercase">
          Fee Allocation
        </h4>
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-muted-foreground">Platform Treasury</span>
            <span className="text-primary font-bold">97.5%</span>
          </div>
          <div className="w-full bg-border/30 rounded h-1.5">
            <div className="bg-primary h-full rounded" style={{ width: "97.5%" }} />
          </div>

          <div className="flex justify-between items-center text-xs mt-3">
            <span className="text-muted-foreground">Seasonal Rewards ({FEE_CONFIG.SEASONAL_REWARD_POOL_PERCENT}% of fees)</span>
            <span className="text-accent font-bold">{stats.rewardPool} ETH</span>
          </div>
          <div className="w-full bg-border/30 rounded h-1.5">
            <div
              className="bg-accent h-full rounded"
              style={{
                width: Number(treasury.seasonalRewardPool) > 0
                  ? Math.min(
                      (Number(treasury.seasonalRewardPool) / Number(treasury.totalFeesCollected)) * 100,
                      100
                    )
                  : 0,
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="arcade-box p-3 border-border/30 bg-background/30 text-xs"
      >
        <p className="text-muted-foreground font-mono">
          Platform fees support tournaments, seasonal rewards, and keep the game running. 
          Treasury stats auto-update every 5 seconds.
        </p>
      </motion.div>
    </motion.div>
  );
}
