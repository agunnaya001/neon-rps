import { useLocation, Link } from "wouter";
import { Home, Swords, LayoutList, Trophy } from "lucide-react";

const TABS = [
  { href: "/", label: "HOME", icon: Home },
  { href: "/create", label: "DUEL", icon: Swords },
  { href: "/series/new", label: "BEST 3", icon: LayoutList },
  { href: "/leaderboard", label: "RANKS", icon: Trophy },
] as const;

export function BottomNav() {
  const [location] = useLocation();

  const isActive = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t-2 border-primary/30 bg-black/90 backdrop-blur-sm"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="flex items-stretch h-14">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active = isActive(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 transition-colors active:scale-95 touch-none select-none
                ${active
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Icon className={`w-5 h-5 ${active ? "drop-shadow-[0_0_6px_rgba(255,0,255,0.8)]" : ""}`} />
              <span className={`font-mono text-[9px] tracking-widest ${active ? "arcade-text" : ""}`}>
                {label}
              </span>
              {active && (
                <span className="absolute bottom-0 w-8 h-0.5 bg-primary shadow-[0_0_4px_rgba(255,0,255,0.8)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
