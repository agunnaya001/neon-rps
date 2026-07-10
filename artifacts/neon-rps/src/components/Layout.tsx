import { useState, memo, useCallback, useMemo } from 'react'
import { Link, useLocation } from 'wouter'
import { Menu, X, Zap } from 'lucide-react'
import { COLORS, ROUTES } from '@/lib/constants'
import { LayoutProps } from '@/types'

const NAV_LINKS = [
  { href: ROUTES.PLAY, label: 'Play' },
  { href: ROUTES.TOURNAMENTS, label: 'Tournaments' },
  { href: ROUTES.CHALLENGES, label: 'Challenges' },
  { href: ROUTES.LEADERBOARD, label: 'Leaderboard' },
  { href: ROUTES.BATTLE_PASS, label: 'Battle Pass' },
]

const LOGO_GRADIENT = 'linear-gradient(135deg, #00ff88, #00ccff)'

const NavLink = memo(function NavLink({
  href,
  label,
  isActive,
  onClick,
  isMobile = false,
}: {
  href: string
  label: string
  isActive: boolean
  onClick?: () => void
  isMobile?: boolean
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`transition-all duration-200 ${
        isMobile ? 'px-4 py-3 rounded-lg text-sm' : 'px-4 py-2 rounded-lg text-sm'
      } font-semibold`}
      style={{
        color: isActive ? COLORS.primary : '#aaaaaa',
        backgroundColor: isActive ? 'rgba(0,255,136,0.1)' : 'transparent',
      }}
    >
      {label}
    </Link>
  )
})

const Layout = memo(function Layout({
  children,
  activePath,
}: LayoutProps) {
  const [location] = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)
  const current = activePath ?? location

  const toggleMenu = useCallback(() => {
    setMenuOpen(prev => !prev)
  }, [])

  const closeMenu = useCallback(() => {
    setMenuOpen(false)
  }, [])

  const currentYear = useMemo(() => new Date().getFullYear(), [])

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'linear-gradient(135deg, #0f0f23 0%, #12122a 50%, #0f0f23 100%)' }}>
      {/* Navigation */}
      <nav
        className="border-b sticky top-0 z-50 backdrop-blur-xl"
        style={{ borderColor: COLORS.border, backgroundColor: 'rgba(15,15,35,0.85)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href={ROUTES.HOME} className="flex items-center gap-2 shrink-0">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: LOGO_GRADIENT }}
              >
                <Zap size={16} className="text-[#0f0f23]" fill="currentColor" />
              </div>
              <span className="text-xl font-black tracking-widest" style={{ color: COLORS.primary }}>
                NEON RPS
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-1">
              {NAV_LINKS.map(({ href, label }) => {
                const isActive = current === href || current.startsWith(href + '/')
                return (
                  <NavLink
                    key={href}
                    href={href}
                    label={label}
                    isActive={isActive}
                  />
                )
              })}
            </div>

            {/* Network Indicator */}
            <div className="hidden md:flex items-center gap-3">
              <div
                className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
                style={{ border: `1px solid ${COLORS.border}`, color: '#666' }}
              >
                <span
                  className="w-2 h-2 rounded-full animate-pulse"
                  style={{ backgroundColor: COLORS.primary }}
                />
                Base Network
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 rounded-lg transition"
              style={{ color: '#aaaaaa' }}
              onClick={toggleMenu}
              aria-label="Toggle menu"
              aria-expanded={menuOpen}
            >
              {menuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div
            className="md:hidden border-t"
            style={{ borderColor: COLORS.border, backgroundColor: 'rgba(15,15,35,0.98)' }}
          >
            <div className="px-4 py-3 flex flex-col gap-1">
              {NAV_LINKS.map(({ href, label }) => {
                const isActive = current === href
                return (
                  <NavLink
                    key={href}
                    href={href}
                    label={label}
                    isActive={isActive}
                    onClick={closeMenu}
                    isMobile
                  />
                )
              })}
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer
        className="border-t py-8 mt-auto"
        style={{ borderColor: COLORS.border, backgroundColor: 'rgba(15,15,35,0.9)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded flex items-center justify-center"
                style={{ background: LOGO_GRADIENT }}
              >
                <Zap size={12} className="text-[#0f0f23]" fill="currentColor" />
              </div>
              <span className="font-bold text-sm" style={{ color: COLORS.primary }}>
                NEON RPS
              </span>
            </div>
            <p className="text-sm text-center" style={{ color: '#555' }}>
              On-chain gaming on Base. Built by Agunnaya Labs. &copy; {currentYear}
            </p>
            <div className="flex items-center gap-4">
              {NAV_LINKS.slice(0, 3).map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-xs transition hover:text-white"
                  style={{ color: '#555' }}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
})

export default Layout
