import { Link } from "wouter";

export function Footer() {
  return (
    <footer className="mt-auto py-6 border-t border-primary/20 text-center flex flex-col items-center gap-2">
      <div className="font-mono text-xs text-muted-foreground">
        Contract:{" "}
        <a 
          href="https://sepolia.etherscan.io/address/0xeE10D066AF750b6A7743029D11CC9cc4aB461418" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-primary hover:underline hover:text-primary/80 transition-colors"
        >
          0xeE10...1418 ↗
        </a>
      </div>
      <div className="font-mono text-xs text-muted-foreground">
        Need Sepolia ETH?{" "}
        <a 
          href="https://sepoliafaucet.com" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-secondary hover:underline hover:text-secondary/80 transition-colors"
        >
          Faucet ↗
        </a>
      </div>
    </footer>
  );
}