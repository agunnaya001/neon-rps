import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Wallet, Smartphone } from "lucide-react";
import { useWallet } from "@/lib/wallet";
import { toast } from "sonner";

export function WalletModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { connect, connectWalletConnect, isConnecting } = useWallet();
  const [busy, setBusy] = useState<"injected" | "wc" | null>(null);

  const handleInjected = async () => {
    setBusy("injected");
    try {
      await connect();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "Wallet connection failed");
    } finally {
      setBusy(null);
    }
  };

  const handleWC = async () => {
    setBusy("wc");
    try {
      await connectWalletConnect();
      onClose();
    } catch (err: any) {
      toast.error(err.message || "WalletConnect failed");
    } finally {
      setBusy(null);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-40"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="arcade-box bg-black/95 p-6 w-full max-w-sm shadow-[0_0_40px_rgba(255,0,255,0.3)]">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black arcade-text text-primary">CONNECT WALLET</h2>
                <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <button
                  onClick={handleInjected}
                  disabled={isConnecting || busy !== null}
                  className="w-full arcade-btn py-4 flex items-center gap-3 justify-start px-4"
                >
                  <Wallet className="w-5 h-5 shrink-0" />
                  <div className="text-left">
                    <div className="font-bold arcade-text">METAMASK / BROWSER</div>
                    <div className="text-xs font-mono text-muted-foreground">
                      Injected wallet extension
                    </div>
                  </div>
                  {busy === "injected" && (
                    <span className="ml-auto font-mono text-xs animate-pulse">CONNECTING…</span>
                  )}
                </button>

                <button
                  onClick={handleWC}
                  disabled={isConnecting || busy !== null}
                  className="w-full arcade-btn arcade-btn-secondary py-4 flex items-center gap-3 justify-start px-4"
                >
                  <Smartphone className="w-5 h-5 shrink-0" />
                  <div className="text-left">
                    <div className="font-bold arcade-text">WALLETCONNECT</div>
                    <div className="text-xs font-mono text-muted-foreground">
                      Coinbase, Rainbow, Trust & more
                    </div>
                  </div>
                  {busy === "wc" && (
                    <span className="ml-auto font-mono text-xs animate-pulse">CONNECTING…</span>
                  )}
                </button>
              </div>

              <p className="font-mono text-[10px] text-muted-foreground/60 text-center mt-4">
                Base mainnet · 2.5% fee on wins only
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
