import { Link } from "wouter";
import { motion } from "framer-motion";
import { Home, AlertTriangle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center p-6 bg-background">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="arcade-box max-w-md w-full p-8 space-y-6 text-center"
      >
        <AlertTriangle className="w-12 h-12 text-destructive mx-auto drop-shadow-[0_0_10px_rgba(255,0,0,0.5)]" />

        <div>
          <div className="text-6xl font-black arcade-text text-primary drop-shadow-[0_0_15px_rgba(255,0,255,0.6)] mb-2">
            404
          </div>
          <h1 className="text-xl font-black arcade-text text-foreground mb-1">
            SIGNAL LOST
          </h1>
          <p className="font-mono text-sm text-muted-foreground">
            This sector of the arena doesn't exist.
          </p>
        </div>

        <div className="font-mono text-xs text-muted-foreground/50 space-y-1">
          <div>ERROR CODE: PAGE_NOT_FOUND</div>
          <div>STATUS: 404</div>
        </div>

        <Link
          href="/"
          className="arcade-btn px-6 py-3 flex items-center justify-center gap-2 w-full"
        >
          <Home className="w-4 h-4" />
          RETURN TO LOBBY
        </Link>
      </motion.div>
    </div>
  );
}
