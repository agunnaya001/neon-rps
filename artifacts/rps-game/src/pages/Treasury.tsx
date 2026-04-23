import { Link } from "wouter";
import { ArrowLeft, Coins, ExternalLink, Wallet } from "lucide-react";
import { formatEther } from "viem";
import { useAccount, useWriteContract, usePublicClient } from "wagmi";
import { toast } from "sonner";
import { useState } from "react";
import {
  CONTRACT_ADDRESS,
  COMMIT_REVEAL_RPS_ABI,
  CHAIN_ID,
} from "@/lib/contract";
import { useFeeBps, useTreasuryStats } from "@/hooks/useGames";
import { shortAddress } from "@/lib/wallet";
import { Footer } from "@/components/Footer";

const ETHERSCAN_BASE =
  CHAIN_ID === 11155111
    ? "https://sepolia.etherscan.io"
    : "https://etherscan.io";

export default function Treasury() {
  const { address } = useAccount();
  const feeBps = useFeeBps();
  const stats = useTreasuryStats();
  const { writeContractAsync } = useWriteContract();
  const publicClient = usePublicClient();
  const [busy, setBusy] = useState(false);

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
      toast.success(`Sent ${formatEther(stats.pending)} ETH to treasury`);
    } catch (err: any) {
      toast.error(err.shortMessage || err.message || "Withdraw failed");
    } finally {
      setBusy(false);
    }
  };

  const isRecipient =
    address && stats.feeRecipient && address.toLowerCase() === stats.feeRecipient.toLowerCase();

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

      <div className="text-center mb-10">
        <Coins className="w-16 h-16 text-secondary mx-auto mb-4 drop-shadow-[0_0_10px_rgba(0,255,255,0.6)]" />
        <h1 className="text-4xl md:text-5xl font-black arcade-text text-secondary drop-shadow-[0_0_10px_rgba(0,255,255,0.4)]">
          TREASURY
        </h1>
        <p className="font-mono text-sm text-muted-foreground mt-2">
          Public, on-chain accounting of every protocol fee.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="arcade-box p-5">
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">
            Protocol fee
          </div>
          <div className="text-3xl font-black arcade-text text-accent">
            {(feeBps / 100).toFixed(2)}%
          </div>
          <div className="text-xs font-mono text-muted-foreground mt-1">
            Taken from winning pot only · ties &amp; cancels are fee-free
          </div>
        </div>
        <div className="arcade-box p-5">
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">
            Pending payout
          </div>
          <div className="text-3xl font-black arcade-text text-secondary tabular-nums">
            {formatEther(stats.pending)} <span className="text-base">ETH</span>
          </div>
          <div className="text-xs font-mono text-muted-foreground mt-1">
            Awaiting withdrawal
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="arcade-box p-5">
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">
            Lifetime collected
          </div>
          <div className="text-2xl font-bold arcade-text text-foreground tabular-nums">
            {formatEther(stats.totalCollected)} <span className="text-sm">ETH</span>
          </div>
        </div>
        <div className="arcade-box p-5">
          <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">
            Lifetime withdrawn
          </div>
          <div className="text-2xl font-bold arcade-text text-foreground tabular-nums">
            {formatEther(stats.totalWithdrawn)} <span className="text-sm">ETH</span>
          </div>
        </div>
      </div>

      <div className="arcade-box p-5 mb-6 space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Treasury wallet
          </div>
          {stats.feeRecipient ? (
            <a
              href={`${ETHERSCAN_BASE}/address/${stats.feeRecipient}`}
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
              href={`${ETHERSCAN_BASE}/address/${CONTRACT_ADDRESS}#code`}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-sm text-primary hover:text-primary/80 inline-flex items-center gap-1"
            >
              {shortAddress(CONTRACT_ADDRESS)}
              <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
      </div>

      <button
        onClick={handleWithdraw}
        disabled={busy || stats.pending === 0n}
        className="arcade-btn w-full py-4 text-lg flex items-center justify-center gap-2 disabled:opacity-40"
      >
        <Wallet className="w-5 h-5" />
        {busy
          ? "WITHDRAWING…"
          : stats.pending === 0n
            ? "NO PENDING FEES"
            : `WITHDRAW ${formatEther(stats.pending)} ETH`}
      </button>
      <div className="font-mono text-[10px] text-muted-foreground text-center mt-2">
        Anyone can trigger a withdrawal — funds always go to the treasury wallet above.
        {isRecipient && (
          <span className="block text-secondary mt-1">
            You're connected as the treasury recipient.
          </span>
        )}
      </div>

      <Footer />
    </div>
  );
}
