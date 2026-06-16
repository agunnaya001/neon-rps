import { useState, useEffect } from 'react'
import { Link } from 'wouter'
import { Gamepad2, Trophy, Calendar, Gem, Zap, TrendingUp, Users, ArrowRight } from 'lucide-react'
import Layout from '@/components/Layout'

export default function HomePage() {
  const [isConnected, setIsConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      (window as any).ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
        if (accounts.length > 0) {
          setIsConnected(true)
          setWalletAddress(accounts[0])
        }
      }).catch(() => {})
    }
  }, [])

  const connectWallet = async () => {
    if (!(window as any).ethereum) {
      alert('Please install MetaMask or another Web3 wallet to play.')
      return
    }
    try {
      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
      if (accounts.length > 0) {
        setIsConnected(true)
        setWalletAddress(accounts[0])
      }
    } catch (error) {
      console.error('[neon-rps] Wallet connection error:', error)
    }
  }

  const shortAddress = walletAddress
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : null

  return (
    <Layout activePath="/">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
        <div className="text-center mb-16 fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-6 border"
            style={{ borderColor: '#2a2a4a', backgroundColor: 'rgba(0,255,136,0.06)', color: '#00ff88' }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: '#00ff88' }} />
            Live on Base Network
          </div>
          <h1 className="text-5xl sm:text-7xl font-black mb-6 glow leading-none tracking-tight">
            <span className="gradient-text">Play. Earn.</span>
            <br />
            <span className="text-white">Dominate.</span>
          </h1>
          <p className="text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed mb-10" style={{ color: '#888' }}>
            Rock Paper Scissors on-chain with real ETH &amp; USDC rewards.
            Compete in tournaments, complete daily challenges, and climb the leaderboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isConnected ? (
              <button
                onClick={connectWallet}
                className="shimmer-btn inline-flex items-center justify-center gap-2 px-8 py-4 text-[#0f0f23] font-bold text-lg rounded-xl shadow-lg hover:shadow-[#00ff88]/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5"
              >
                <Zap size={20} fill="currentColor" />
                Connect Wallet to Play
              </button>
            ) : (
              <Link href="/play">
                <span className="shimmer-btn inline-flex items-center justify-center gap-2 px-8 py-4 text-[#0f0f23] font-bold text-lg rounded-xl shadow-lg hover:shadow-[#00ff88]/30 hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5 cursor-pointer">
                  <Gamepad2 size={20} />
                  Start Playing Now
                </span>
              </Link>
            )}
            <Link href="/tournaments">
              <span className="inline-flex items-center justify-center gap-2 px-8 py-4 font-bold text-lg rounded-xl border transition-all duration-300 hover:-translate-y-0.5 cursor-pointer"
                style={{ borderColor: '#2a2a4a', color: '#cccccc', backgroundColor: 'rgba(255,255,255,0.03)' }}>
                <Trophy size={20} />
                View Tournaments
              </span>
            </Link>
          </div>
        </div>

        {isConnected && shortAddress && (
          <div className="max-w-2xl mx-auto mb-12 rounded-2xl p-6 border fade-in"
            style={{ backgroundColor: 'rgba(0,255,136,0.05)', borderColor: 'rgba(0,255,136,0.3)' }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold tracking-widest" style={{ color: '#00ff88' }}>YOUR STATS</span>
              <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: 'rgba(0,255,136,0.15)', color: '#00ff88' }}>
                Connected: {shortAddress}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Wins', value: '0', sub: 'Total wins', color: '#00ff88' },
                { label: 'Losses', value: '0', sub: 'Total losses', color: '#ff006e' },
                { label: 'Earnings', value: '0 ETH', sub: 'All-time', color: '#00ccff' },
              ].map(({ label, value, sub, color }) => (
                <div key={label} className="text-center">
                  <div className="text-2xl font-black mb-1" style={{ color }}>{value}</div>
                  <div className="text-xs font-bold mb-0.5 text-white">{label}</div>
                  <div className="text-xs" style={{ color: '#666' }}>{sub}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {[
            { icon: TrendingUp, label: 'Total Volume', value: '0 ETH', sub: 'Wagered on-chain', color: '#00ff88' },
            { icon: Users, label: 'Active Players', value: '0', sub: 'Playing right now', color: '#00ccff' },
            { icon: Trophy, label: 'Tournaments', value: '0', sub: 'Open to join', color: '#ff006e' },
          ].map(({ icon: Icon, label, value, sub, color }) => (
            <div key={label} className="rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-1"
              style={{ backgroundColor: 'rgba(26,26,58,0.6)', borderColor: '#2a2a4a' }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
                  <Icon size={20} style={{ color }} />
                </div>
                <span className="text-xs font-bold tracking-wider" style={{ color: '#666' }}>{label.toUpperCase()}</span>
              </div>
              <div className="text-3xl font-black text-white mb-1">{value}</div>
              <div className="text-sm" style={{ color: '#666' }}>{sub}</div>
            </div>
          ))}
        </div>

        <div className="mb-4">
          <h2 className="text-sm font-bold tracking-widest mb-6" style={{ color: '#666' }}>QUICK ACCESS</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { href: '/play', icon: Gamepad2, label: 'Play Now', sub: 'Quick 1v1 match with ETH or USDC', color: '#00ff88', bg: 'rgba(0,255,136,0.08)' },
              { href: '/tournaments', icon: Trophy, label: 'Tournaments', sub: 'Compete for massive prize pools', color: '#00ccff', bg: 'rgba(0,204,255,0.08)' },
              { href: '/challenges', icon: Calendar, label: 'Daily Challenges', sub: 'Earn ETH rewards every day', color: '#ff006e', bg: 'rgba(255,0,110,0.08)' },
              { href: '/battle-pass', icon: Gem, label: 'Battle Pass', sub: 'Unlock exclusive cosmetics', color: '#a855f7', bg: 'rgba(168,85,247,0.08)' },
            ].map(({ href, icon: Icon, label, sub, color, bg }) => (
              <Link key={href} href={href}>
                <div className="group rounded-2xl p-6 border cursor-pointer transition-all duration-300 hover:-translate-y-1"
                  style={{ backgroundColor: 'rgba(26,26,58,0.6)', borderColor: '#2a2a4a' }}>
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all group-hover:scale-110"
                    style={{ backgroundColor: bg }}>
                    <Icon size={24} style={{ color }} />
                  </div>
                  <h3 className="font-bold text-white mb-2">{label}</h3>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: '#666' }}>{sub}</p>
                  <div className="flex items-center gap-1 text-xs font-semibold transition-all group-hover:gap-2" style={{ color }}>
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
}
