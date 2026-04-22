import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Share2, Copy, Twitter, Mail, Link2, Check } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

interface ShareDialogProps {
  gameId: string | bigint;
  bet?: string;
}

export function ShareDialog({ gameId, bet = "0.01" }: ShareDialogProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/game/${gameId.toString()}`;
  const shareText = `Just put ${bet} ETH on the line in a Rock-Paper-Scissors duel. Think you can read me? #Web3Gaming`;

  const copyInvite = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Invite link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy");
    }
  };

  const shareToX = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, "_blank", "width=550,height=420");
  };

  const shareViaEmail = () => {
    const subject = "Join my Rock-Paper-Scissors Duel!";
    const body = `${shareText}\n\nJoin here: ${shareUrl}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const shareOptions = [
    {
      icon: Copy,
      label: "Copy Link",
      action: copyInvite,
      color: "text-primary",
    },
    {
      icon: Twitter,
      label: "Share on X",
      action: shareToX,
      color: "text-blue-400",
    },
    {
      icon: Mail,
      label: "Email",
      action: shareViaEmail,
      color: "text-amber-500",
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="arcade-btn arcade-btn-secondary px-3 py-1.5 text-xs flex items-center gap-2 bg-background">
          <Share2 className="w-3 h-3" />
          SHARE
        </button>
      </DialogTrigger>
      <DialogContent className="arcade-box border-secondary/80 bg-background/95 backdrop-blur-sm">
        <DialogHeader>
          <DialogTitle className="arcade-text text-secondary flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            CHALLENGE YOUR FRIENDS
          </DialogTitle>
        </DialogHeader>

        <motion.div className="space-y-4">
          <div className="arcade-box p-3 bg-background/50 border-secondary/40">
            <p className="font-mono text-xs text-muted-foreground mb-2">GAME LINK</p>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 bg-black/50 border border-border/50 p-2 font-mono text-xs text-foreground focus:border-secondary focus:outline-none"
              />
              <motion.button
                onClick={copyInvite}
                className="arcade-btn px-3 py-2 text-xs"
                whileHover={{ scale: 1.05 }}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </motion.button>
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-mono text-xs text-muted-foreground">SHARE VIA</p>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-3 gap-2"
            >
              {shareOptions.map((option, i) => {
                const Icon = option.icon;
                return (
                  <motion.button
                    key={option.label}
                    onClick={option.action}
                    className={`
                      arcade-box p-3 flex flex-col items-center justify-center gap-2
                      border-border/50 hover:border-secondary transition-all
                    `}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <Icon className={`w-5 h-5 ${option.color}`} />
                    <span className="text-[10px] font-bold arcade-text text-center">
                      {option.label}
                    </span>
                  </motion.button>
                );
              })}
            </motion.div>
          </div>

          <div className="arcade-box p-3 bg-secondary/10 border-secondary/30">
            <p className="font-mono text-xs text-secondary">
              <strong>Pro Tip:</strong> Share your duel to increase engagement and track your wins across social!
            </p>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}
