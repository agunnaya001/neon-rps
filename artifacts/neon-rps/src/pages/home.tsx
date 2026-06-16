import { useState, useEffect } from 'react'
import { Link } from 'wouter'
import { useGetLeaderboard } from '@workspace/api-client-react'

export default function HomePage() {
  const [isConnected, setIsConnected] = useState(false)
  const [stats, setStats] = useState({ wins: 0, losses: 0, earnings: '0' })

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      setIsConnected(true)
    }
  }, [])

  const connectWallet = async () => {
    if (!(window as any).ethereum) {
      alert('Please install MetaMask or another Web3 wallet')
      return
    }
    try {
      const accounts = await (window as any).ethereum.request({ method: 'eth_requestAccounts' })
      if (accounts.length > 0) setIsConnected(true)
    } catch (error) {
      console.error('[neon-rps] Wallet connection error:', error)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a3a] to-[#0f0f23]">
      <nav className="border-b border-[#333333] bg-[#0f0f23]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="text-2xl font-bold text-[#00ff88]">NEON RPS</div>
          <div className="flex gap-6">
            <Link href="/tournaments" className="text-white hover:text-[#00ff88] transition">Tournaments</Link>
            <Link href="/challenges" className="text-white hover:text-[#00ff88] transition">Challenges</Link>
            <Link href="/leaderboard" className="text-white hover:text-[#00ff88] transition">Leaderboard</Link>
            <Link href="/battle-pass" className="text-white hover:text-[#00ff88] transition">Battle Pass</Link>
          </div>
          <button
            onClick={connectWallet}
            className="px-6 py-2 bg-[#00ff88] text-[#0f0f23] font-bold rounded hover:bg-[#00ccff] transition"
          >
            {isConnected ? 'Connected' : 'Connect Wallet'}
          </button>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <h1 className="text-6xl font-bold mb-4 text-white" style={{ animation: 'glow 2s ease-in-out infinite' }}>
            Play. Earn. Dominate.
          </h1>
          <p className="text-xl text-[#666666] mb-8">
            Rock Paper Scissors on-chain with real rewards. ETH, USDC, tournaments, and daily challenges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[#1a1a3a] border border-[#00ff88] rounded p-6" style={{ animation: 'pulse-border 2s ease-in-out infinite' }}>
            <div className="text-[#00ff88] text-sm font-bold mb-2">YOUR STATS</div>
            <div className="text-3xl font-bold mb-2">{stats.wins}W {stats.losses}L</div>
            <div className="text-[#666666]">Winrate: {stats.wins + stats.losses > 0 ? ((stats.wins / (stats.wins + stats.losses)) * 100).toFixed(1) : 0}%</div>
          </div>
          <div className="bg-[#1a1a3a] border border-[#00ccff] rounded p-6">
            <div className="text-[#00ccff] text-sm font-bold mb-2">TOTAL EARNINGS</div>
            <div className="text-3xl font-bold mb-2">{stats.earnings} ETH</div>
            <div className="text-[#666666]">All-time winnings</div>
          </div>
          <div className="bg-[#1a1a3a] border border-[#ff006e] rounded p-6">
            <div className="text-[#ff006e] text-sm font-bold mb-2">REFERRAL BONUS</div>
            <div className="text-3xl font-bold mb-2">0 ETH</div>
            <div className="text-[#666666]">Share your code</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Link href="/play">
            <div className="bg-[#1a1a3a] border border-[#333333] rounded-lg p-6 hover:border-[#00ff88] transition cursor-pointer">
              <div className="text-3xl mb-2">🎮</div>
              <h3 className="font-bold text-white mb-2">Play Now</h3>
              <p className="text-[#666666] text-sm">Quick match with ETH or USDC</p>
            </div>
          </Link>
          <Link href="/tournaments">
            <div className="bg-[#1a1a3a] border border-[#333333] rounded-lg p-6 hover:border-[#00ccff] transition cursor-pointer">
              <div className="text-3xl mb-2">🏆</div>
              <h3 className="font-bold text-white mb-2">Tournaments</h3>
              <p className="text-[#666666] text-sm">Compete for massive prize pools</p>
            </div>
          </Link>
          <Link href="/challenges">
            <div className="bg-[#1a1a3a] border border-[#333333] rounded-lg p-6 hover:border-[#ff006e] transition cursor-pointer">
              <div className="text-3xl mb-2">📅</div>
              <h3 className="font-bold text-white mb-2">Daily Challenges</h3>
              <p className="text-[#666666] text-sm">Earn rewards every day</p>
            </div>
          </Link>
          <Link href="/battle-pass">
            <div className="bg-[#1a1a3a] border border-[#333333] rounded-lg p-6 hover:border-[#00ff88] transition cursor-pointer">
              <div className="text-3xl mb-2">💎</div>
              <h3 className="font-bold text-white mb-2">Battle Pass</h3>
              <p className="text-[#666666] text-sm">Unlock cosmetics &amp; exclusive perks</p>
            </div>
          </Link>
        </div>

        <div className="text-center">
          {!isConnected ? (
            <button
              onClick={connectWallet}
              className="px-12 py-4 bg-gradient-to-r from-[#00ff88] to-[#00ccff] text-[#0f0f23] font-bold text-lg rounded hover:shadow-lg hover:shadow-[#00ff88]/50 transition"
            >
              Connect Wallet to Play
            </button>
          ) : (
            <Link href="/play">
              <span className="inline-block px-12 py-4 bg-gradient-to-r from-[#00ff88] to-[#00ccff] text-[#0f0f23] font-bold text-lg rounded hover:shadow-lg hover:shadow-[#00ff88]/50 transition cursor-pointer">
                Start Playing Now
              </span>
            </Link>
          )}
        </div>
      </section>

      <footer className="border-t border-[#333333] bg-[#0f0f23] py-8 mt-20">
        <div className="max-w-7xl mx-auto px-4 text-center text-[#666666]">
          <p>© 2024 Neon RPS. On-chain gaming on Base. Built by Agunnaya Labs.</p>
        </div>
      </footer>
    </main>
  )
}
