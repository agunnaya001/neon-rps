import { memo } from 'react'
import { Link } from 'wouter'
import { Gamepad2, Trophy, Calendar, Gem, Zap, TrendingUp, Users, ArrowRight } from 'lucide-react'
import Layout from '@/components/Layout'
import { useWallet } from '@/hooks/use-wallet'
import { StatCard } from '@/components/common/StatCard'
import { COLORS, ROUTES } from '@/lib/constants'
import { COLOR_VARIANTS } from '@/lib/constants'

const HomePage = memo(function HomePage() {
  const { isConnected, formattedAddress, connectWallet, error: walletError } = useWallet()

  const STATS_DATA = [
    { label: 'Wins', value: '0', sub: 'Total wins', color: COLORS.primary },
    { label: 'Losses', value: '0', sub: 'Total losses', color: COLORS.accent },
    { label: 'Earnings', value: '0 ETH', sub: 'All-time', color: COLORS.secondary },
  ]

  const METRICS_DATA = [
    { icon: TrendingUp, label: 'Total Volume', value: '0 ETH', sub: 'Wagered on-chain', color: COLORS.primary },
    { icon: Users, label: 'Active Players', value: '0', sub: 'Playing right now', color: COLORS.secondary },
    { icon: Trophy, label: 'Tournaments', value: '0', sub: 'Open to join', color: COLORS.accent },
  ]

  const QUICK_ACCESS = [
    {
      href: ROUTES.PLAY,
      icon: Gamepad2,
      label: 'Play Now',
      sub: 'Quick 1v1 match with ETH or USDC',
      color: COLORS.primary,
      bg: COLOR_VARIANTS.primary.bgDark,
    },
    {
      href: ROUTES.TOURNAMENTS,
      icon: Trophy,
      label: 'Tournaments',
      sub: 'Compete for massive prize pools',
      color: COLORS.secondary,
      bg: COLOR_VARIANTS.secondary.bgDark,
    },
    {
      href: ROUTES.CHALLENGES,
      icon: Calendar,
      label: 'Daily Challenges',
      sub: 'Earn ETH rewards every day',
      color: COLORS.accent,
      bg: COLOR_VARIANTS.accent.bgDark,
    },
    {
      href: ROUTES.BATTLE_PASS,
      icon: Gem,
      label: 'Battle Pass',
      sub: 'Unlock exclusive cosmetics',
      color: COLORS.purple,
      bg: COLOR_VARIANTS.purple.bgDark,
    },
  ]

  return (
    <Layout activePath={ROUTES.HOME}>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        {/* Hero Section */}
        <div className="text-center mb-16 fade-in">
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-6 border"
            style={{
              borderColor: COLORS.border,
              backgroundColor: COLOR_VARIANTS.primary.bg,
              color: COLORS.primary,
            }}
          >
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ backgroundColor: COLORS.primary }}
            />
            Live on Base Network
          </div>
          <h1 className="text-5xl sm:text-7xl font-black mb-6 glow leading-none tracking-tight">
            <span className="gradient-text">Play. Earn.</span>
            <br />
            <span className="text-white">Dominate.</span>
          </h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10" style={{ color: '#888' }}>
            Rock Paper Scissors on-chain with real ETH &amp; USDC rewards. Compete in tournaments,
            complete daily challenges, and climb the leaderboard.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isConnected ? (
              <button
                onClick={connectWallet}
                className="shimmer-btn inline-flex items-center justify-center gap-2 px-8 py-4 text-[#0f0f23] font-bold text-lg rounded-xl shadow-lg hover:shadow-[#00ff88]/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
                aria-label="Connect wallet to play"
              >
                <Zap size={20} fill="currentColor" />
                Connect Wallet to Play
              </button>
            ) : (
              <Link href={ROUTES.PLAY}>
                <span className="shimmer-btn inline-flex items-center justify-center gap-2 px-8 py-4 text-[#0f0f23] font-bold text-lg rounded-xl shadow-lg hover:shadow-[#00ff88]/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 cursor-pointer">
                  <Gamepad2 size={20} />
                  Start Playing Now
                </span>
              </Link>
            )}
            <Link href={ROUTES.TOURNAMENTS}>
              <span
                className="inline-flex items-center justify-center gap-2 px-8 py-4 font-bold text-lg rounded-xl border transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
                style={{
                  borderColor: COLORS.border,
                  color: '#cccccc',
                  backgroundColor: 'rgba(255,255,255,0.03)',
                }}
              >
                <Trophy size={20} />
                View Tournaments
              </span>
            </Link>
          </div>

          {walletError && (
            <p className="text-sm mt-4" style={{ color: COLORS.accent }}>
              {walletError}
            </p>
          )}
        </div>

        {/* User Stats Card */}
        {isConnected && formattedAddress && (
          <div
            className="max-w-2xl mx-auto mb-12 rounded-2xl p-6 border fade-in"
            style={{
              backgroundColor: COLOR_VARIANTS.primary.bg,
              borderColor: COLOR_VARIANTS.primary.shadow,
            }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold tracking-widest" style={{ color: COLORS.primary }}>
                YOUR STATS
              </span>
              <span
                className="px-3 py-1 rounded-full text-xs font-bold"
                style={{
                  backgroundColor: COLOR_VARIANTS.primary.bgHover,
                  color: COLORS.primary,
                }}
              >
                Connected: {formattedAddress}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {STATS_DATA.map(({ label, value, sub, color }) => (
                <div key={label} className="text-center">
                  <div className="text-2xl font-black mb-1" style={{ color }}>
                    {value}
                  </div>
                  <div className="text-xs font-bold mb-0.5 text-white">{label}</div>
                  <div className="text-xs" style={{ color: '#666' }}>
                    {sub}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {METRICS_DATA.map(({ icon: Icon, label, value, sub, color }) => (
            <StatCard key={label} label={label} value={value} subtext={sub} color={color} />
          ))}
        </div>

        {/* Quick Access */}
        <div className="mb-4">
          <h2 className="text-sm font-bold tracking-widest mb-6" style={{ color: '#666' }}>
            QUICK ACCESS
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {QUICK_ACCESS.map(({ href, icon: Icon, label, sub, color, bg }) => (
              <Link key={href} href={href}>
                <div
                  className="group rounded-2xl p-6 border cursor-pointer transition-all duration-300 hover:-translate-y-1"
                  style={{ backgroundColor: 'rgba(26,26,58,0.6)', borderColor: COLORS.border }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:scale-110"
                    style={{ backgroundColor: bg }}
                  >
                    <Icon size={24} style={{ color }} />
                  </div>
                  <h3 className="font-bold text-white mb-2">{label}</h3>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: '#666' }}>
                    {sub}
                  </p>
                  <div
                    className="flex items-center gap-1 text-xs font-semibold transition-all group-hover:gap-2"
                    style={{ color }}
                  >
                    Open <ArrowRight size={12} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  )
})

export default HomePage
