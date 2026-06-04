import { toast } from "sonner";
import { AlertTriangle, Copy, ArrowRight } from "lucide-react";

interface SaltModalProps {
  salt: `0x${string}`;
  onConfirm: () => void;
}

export function SaltModal({ salt, onConfirm }: SaltModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="arcade-box border-accent shadow-[0_0_30px_rgba(255,255,0,0.25)] p-6 max-w-md w-full space-y-5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-accent shrink-0 mt-0.5 drop-shadow-[0_0_8px_currentColor]" />
          <div>
            <h2 className="font-bold arcade-text text-accent text-lg mb-1 tracking-widest">
              SAVE YOUR SECRET KEY
            </h2>
            <p className="font-mono text-xs text-muted-foreground leading-relaxed">
              Your move is hidden by this salt. If browser storage is cleared or you switch
              devices, you'll need it to reveal your move and recover your bet.
            </p>
          </div>
        </div>

        <div className="bg-black border border-accent/30 p-3 space-y-1.5">
          <div className="font-mono text-[10px] text-muted-foreground tracking-widest uppercase">
            Salt (hex — back this up):
          </div>
          <div className="font-mono text-xs text-accent break-all select-all leading-relaxed">
            {salt}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              void navigator.clipboard?.writeText(salt);
              toast.success("Salt copied to clipboard!");
            }}
            className="arcade-btn flex-1 py-2.5 text-sm !border-accent !text-accent hover:!bg-accent/20 flex items-center justify-center gap-2"
          >
            <Copy className="w-4 h-4" />
            COPY
          </button>
          <button
            onClick={onConfirm}
            className="arcade-btn flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
          >
            CONTINUE
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
