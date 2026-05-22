import { Link } from "wouter";
import {
  ArrowLeft,
  Coins,
  ExternalLink,
  Wallet,
  TrendingUp,
  Clock,
  BarChart2,
  Bell,
} from "lucide-react";
import { formatEther } from "viem";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import { toast } from "sonner";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  CONTRACT_ADDRESS,
  COMMIT_REVEAL_RPS_ABI,
  CHAIN_ID,
} from "@/lib/contract";
import {
  useFeeBps,
  useTreasuryStats,
  useRevenueAnalytics,
  type DailyRevenue,
} from "@/hooks/useGames";
import { shortAddress } from "@/lib/wallet";
import { Footer } from "@/components/Footer";

const BASESCAN_BASE =
  CHAIN_ID === 8453
    ? "https://basescan.org"
    : CHAIN_ID === 11155111
      ? "https://sepolia.etherscan.io"
      : "https://etherscan.io";

function fmt(wei: bigint, dp = 5): string {
  const s = formatEther(wei);
  const [int, dec = ""] = s.split(".");
  return `${int}.${(dec + "00000").slice(0, dp)}`;
}

function RevenueBar({ bar, max }: { bar: DailyRevenue; max: number }) {
  const pct = max > 0 ? (bar.eth / max) * 100 : 0;
  return (
    <div className="flex flex-col items-center gap-1 flex-1">
      <div className="relative w-full flex items-end justify-center h-20">
        <motion.div
          initial={{ height: 0 }}
          animate={{ height: `${Math.max(pct, bar.eth > 0 ? 4 : 0)}%` }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="w-4/5 rounded-t-sm"
          style={{
            background:
              bar.eth > 0
                ? "linear-gradient(to top, hsl(var(--secondary)), hsl(var(--primary)))"
                : "hsl(var(--muted))",
            minHeight: bar.eth > 0 ? "4px" : "2px",
          }}
        />
      </div>
      <div className="font-mono text-[9px] text-muted-foreground">{bar.label}</div>
    </div>
  );
}

export default function Treasury() {
  const { address } = useAccount();
  const feeBps = useFeeBps();
  const stats = useTreasuryStats();
  const revenue = useRevenueAnalytics();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const [busy, setBusy] = useState(false);
  const [alertSet, setAlertSet] = useState(false);

  const isRecipient =
    address &&
    stats.feeRecipient &&
    address.toLowerCase() === stats.feeRecipient.toLowerCase();

  const handleWithdraw = async () => {
    if (!CONTRACT_ADDRESS || !publicClient) return;
    if (stats.pending === 0n) {
      toast.error("Nothing to withdraw");
      return;
    }
    setBusy(true);
    try {
      const toastId = toast("Withdrawing pending fees…");
      const hash = await writeContractAsync({
        address: CONTRACT_ADDRESS,
        abi: COMMIT_REVEAL_RPS_ABI,
        functionName: "withdrawFees",
      });
      await publicClient.waitForTransactionReceipt({ hash });
      toast.dismiss(toastId);
      toast.success(`Sent ${fmt(stats.pending, 4)} ETH to treasury wallet`);
    } catch (err: unknown) {
      const e = err as { shortMessage?: string; message?: string };
      toast.error(e.shortMessage || e.message || "Withdraw failed");
    } finally {
      setBusy(false);
    }
  };

  const weekly7dAvg = revenue.earned7d / 7n;
  const projectedMonthly = weekly7dAvg * 30n;
  const maxBar = Math.max(...revenue.dailyBars.map((b) => b.eth), 0.000001);

  return (
    <div className="min-h-[100dvh] flex flex-col p-4 md:p-8 max-w-3xl mx-auto w-full">
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-mono text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          LOBBY
        </Link>
      </div>

      <div className="text-center mb-8">
        <Coins className="w-14 h-14 text-secondary mx-auto mb-3 drop-shadow-[0_0_10px_rgba(0,255,255,0.6)]" />
        <h1 className="text-4xl md:text-5xl font-black arcade-text text-secondary drop-shadow-[0_0_10px_rgba(0,255,255,0.4)]">
          TREASURY
        </h1>
        <p className="font-mono text-sm text-muted-foreground mt-2">
          Public, on-chain accounting of every protocol fee.
        </p>
      </div>

      {/* -- Revenue analytics -- */}
      <div className="arcade-box p-5 mb-5">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="w-4 h-4 text-secondary" />
          <span className="font-mono text-xs uppercase tracking-widest text-secondary">
            Revenue analytics
          </span>
        </div>
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="text-center">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
              Last 24 h
            </div>
            <div className="text-xl font-black arcade-text text-accent tabular-nums">
              {fmt(revenue.earned24h, 5)}
            </div>
            <div className="text-[10px] font-mono text-muted-foreground">ETH</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
              Last 7 days
            </div>
            <div className="text-xl font-black arcade-text text-secondary tabular-nums">
              {fmt(revenue.earned7d, 5)}
            </div>
            <div className="text-[10px] font-mono text-muted-foreground">ETH</div>
          </div>
          <div className="text-center">
            <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
              Proj. monthly
            </div>
            <div className="text-xl font-black arcade-text text-primary tabular-nums">
              {fmt(projectedMonthly, 5)}
            </div>
            <div className="text-[10px] font-mono text-muted-foreground">ETH</div>
          </div>
        </div>

        {/* 7-day bar chart */}
        <div className="flex gap-1 items-end h-24 px-1">
          {revenue.dailyBars.length > 0 ? (
            revenue.dailyBars.map((bar) => (
              <RevenueBar key={bar.label} bar={bar} max={maxBar} />
            ))
          ) : (
            Array.from({ length: 7 }, (_, i) => (
              <div key={i} className="flex-1 h-24 flex items-end justify-center">
                <div className="w-4/5 h-1 bg-muted rounded-t-sm" />
              </div>
            ))
          )}
        </div>

        {revenue.earned7d > 0n && (
          <div className="mt-3 font-mono text-[10px] text-muted-foreground text-center flex items-center justify-center gap-1">
            <TrendingUp className="w-3 h-3 text-secondary" />
            7-day avg {fmt(weekly7dAvg, 6)} ETH/day · projected{" "}
            {fmt(projectedMonthly, 4)} ETH/mo
          </div>
        )}
      </div>

      {/* -- Pending + rate -- */}
      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        <div className="arcade-box p-5">
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">
            Protocol fee
          </div>
          <div className="text-3xl font-black arcade-text text-accent">
            {(feeBps / 100).toFixed(2)}%
          </div>
          <div className="text-xs font-mono text-muted-foreground mt-1">
            On winning pot only · ties &amp; cancels free
          </div>
        </div>
        <div className="arcade-box p-5">
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">
            Pending payout
          </div>
          <div
            className={`text-3xl font-black arcade-text tabular-nums ${stats.pending > 0n ? "text-secondary" : "text-muted-foreground"}`}
          >
            {fmt(stats.pending, 5)} <span className="text-base">ETH</span>
          </div>
          {stats.pending > 0n && (
            <div className="text-xs font-mono text-accent mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" /> Ready to withdraw
            </div>
          )}
        </div>
      </div>

      {/* -- Lifetime stats -- */}
      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        <div className="arcade-box p-5">
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">
            Lifetime collected
          </div>
          <div className="text-2xl font-bold arcade-text text-foreground tabular-nums">
            {fmt(stats.totalCollected, 5)} <span className="text-sm">ETH</span>
          </div>
        </div>
        <div className="arcade-box p-5">
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">
            Lifetime withdrawn
          </div>
          <div className="text-2xl font-bold arcade-text text-foreground tabular-nums">
            {fmt(stats.totalWithdrawn, 5)} <span className="text-sm">ETH</span>
          </div>
        </div>
      </div>

      {/* -- Addresses -- */}
      <div className="arcade-box p-5 mb-5 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Treasury wallet
          </div>
          {stats.feeRecipient ? (
            <a
              href={`${BASESCAN_BASE}/address/${stats.feeRecipient}`}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-sm text-secondary hover:text-secondary/80 inline-flex items-center gap-1"
            >
              {shortAddress(stats.feeRecipient)}
              <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <span className="font-mono text-sm text-muted-foreground">—</span>
          )}
        </div>
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Contract
          </div>
          {CONTRACT_ADDRESS && (
            <a
              href={`${BASESCAN_BASE}/address/${CONTRACT_ADDRESS}#code`}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-sm text-primary hover:text-primary/80 inline-flex items-center gap-1"
            >
              {shortAddress(CONTRACT_ADDRESS)}
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
        {isRecipient && (
          <div className="font-mono text-xs text-secondary pt-1 border-t border-border/40">
            ✓ You are connected as the treasury recipient
          </div>
        )}
      </div>

      {/* -- Withdraw CTA -- */}
      <button
        onClick={handleWithdraw}
        disabled={busy || stats.pending === 0n}
        className="arcade-btn w-full py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-40 mb-3"
      >
        <Wallet className="w-5 h-5" />
        {busy
          ? "WITHDRAWING…"
          : stats.pending === 0n
            ? "NO PENDING FEES"
            : `WITHDRAW ${fmt(stats.pending, 4)} ETH`}
      </button>
      <p className="font-mono text-[10px] text-muted-foreground text-center mb-6">
        Anyone can trigger a withdrawal — funds always route to the treasury
        wallet above.
      </p>

      {/* -- Claim alert nudge (owner only) -- */}
      {isRecipient && stats.pending > 0n && !alertSet && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="arcade-box p-4 mb-6 flex items-start gap-3 border-secondary/40"
        >
          <Bell className="w-4 h-4 text-secondary flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-mono text-xs text-secondary uppercase tracking-widest mb-1">
              Earnings ready
            </div>
            <div className="font-mono text-xs text-muted-foreground">
              You have {fmt(stats.pending, 5)} ETH pending. Withdraw now or set
              a browser reminder to claim weekly.
            </div>
          </div>
          <button
            onClick={() => {
              setAlertSet(true);
              toast.success("Set a weekly calendar reminder to check Treasury");
            }}
            className="font-mono text-[10px] text-secondary hover:text-secondary/70 underline flex-shrink-0"
          >
            Remind me
          </button>
        </motion.div>
      )}

      <Footer />
    </div>
  );
}
