import { useState } from 'react'
import { Link, useLocation } from 'wouter'
import { Menu, X, Zap } from 'lucide-react'

const NAV_LINKS = [
  { href: '/play', label: 'Play' },
  { href: '/tournaments', label: 'Tournaments' },
  { href: '/challenges', label: 'Challenges' },
  { href: '/leaderboard', label: 'Leaderboard' },
  { href: '/battle-pass', label: 'Battle Pass' },
]

interface LayoutProps {
  children: React.ReactNode
  activePath?: string
}

export default function Layout({ children, activePath }: LayoutProps) {
  const [location] = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const current = activePath ?? location

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #0f0f23 0%, #12122a 50%, #0f0f23 100%)' }}>
      <nav className="border-b sticky top-0 z-50 backdrop-blur-xl" style={{ borderColor: '#2a2a4a', backgroundColor: 'rgba(15,15,35,0.85)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00ff88, #00ccff)' }}>
                <Zap size={16} className="text-[#0f0f23]" fill="currentColor" />
              </div>
              <span className="text-xl font-black tracking-widest" style={{ color: '#00ff88' }}>NEON RPS</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ href, label }) => {
                const active = current === href || current.startsWith(href + '/')
                return (
                  <Link
                    key={href}
                    href={href}
                    className="px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
                    style={{
                      color: active ? '#00ff88' : '#aaaaaa',
                      backgroundColor: active ? 'rgba(0,255,136,0.1)' : 'transparent',
                    }}
                  >
                    {label}
                  </Link>
                )
              })}
            </div>

            <div className="hidden md:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold" style={{ border: '1px solid #2a2a4a', color: '#666' }}>
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#00ff88' }} />
                Base Network
              </div>
            </div>

            <button
              className="md:hidden p-2 rounded-lg transition"
              style={{ color: '#aaaaaa' }}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Toggle menu"
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden border-t" style={{ borderColor: '#2a2a4a', backgroundColor: 'rgba(15,15,35,0.98)' }}>
            <div className="px-4 py-3 flex flex-col gap-1">
              {NAV_LINKS.map(({ href, label }) => {
                const active = current === href
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMenuOpen(false)}
                    className="px-4 py-3 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      color: active ? '#00ff88' : '#cccccc',
                      backgroundColor: active ? 'rgba(0,255,136,0.1)' : 'transparent',
                    }}
                  >
                    {label}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-1">
        {children}
      </main>

      <footer className="border-t py-8 mt-auto" style={{ borderColor: '#2a2a4a', backgroundColor: 'rgba(15,15,35,0.9)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #00ff88, #00ccff)' }}>
                <Zap size={12} className="text-[#0f0f23]" fill="currentColor" />
              </div>
              <span className="font-bold text-sm" style={{ color: '#00ff88' }}>NEON RPS</span>
            </div>
            <p className="text-sm text-center" style={{ color: '#555' }}>
              On-chain gaming on Base. Built by Agunnaya Labs. &copy; {new Date().getFullYear()}
            </p>
            <div className="flex items-center gap-4">
              {NAV_LINKS.slice(0, 3).map(({ href, label }) => (
                <Link key={href} href={href} className="text-xs transition hover:text-white" style={{ color: '#555' }}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
