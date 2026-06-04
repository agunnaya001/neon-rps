'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface LeaderboardEntry {
  rank: number
  walletAddress: string
  totalWins: number
  totalWinnings: string
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [period, setPeriod] = useState('all-time')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadLeaderboard()
  }, [period])

  const loadLeaderboard = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/leaderboard?period=${period}`)
      const data = await res.json()
      setLeaderboard(data.data || [])
    } catch (error) {
      console.error('[v0] Load leaderboard error:', error)
    } finally {
      setLoading(false)
    }
  }

  const truncateAddress = (addr: string) => {
    return addr ? `${addr.slice(0, 6)}...${addr.slice(-4)}` : ''
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a3a] to-[#0f0f23]">
      {/* Navigation */}
      <nav className="border-b border-[#333333] bg-[#0f0f23]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#00ff88]">
            NEON RPS
          </Link>
          <div className="flex gap-6">
            <Link href="/tournaments" className="text-[#ffffff]">Tournaments</Link>
            <Link href="/challenges" className="text-[#ffffff]">Challenges</Link>
            <Link href="/leaderboard" className="text-[#00ff88]">Leaderboard</Link>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white mb-8">🏅 Global Leaderboard</h1>

        {/* Period Filter */}
        <div className="flex gap-4 mb-8">
          {['all-time', 'monthly', 'weekly'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-6 py-2 font-bold rounded transition ${
                period === p
                  ? 'bg-[#00ff88] text-[#0f0f23]'
                  : 'bg-[#1a1a3a] text-[#ffffff] border border-[#333333] hover:border-[#00ff88]'
              }`}
            >
              {p === 'all-time' ? '∞ All-Time' : p === 'monthly' ? '📅 Monthly' : '📆 Weekly'}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-[#666666]">Loading leaderboard...</p>
          </div>
        ) : (
          <div className="bg-[#1a1a3a] border border-[#333333] rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#0f0f23] border-b border-[#333333]">
                <tr>
                  <th className="px-6 py-4 text-left text-[#00ff88] font-bold">Rank</th>
                  <th className="px-6 py-4 text-left text-[#00ff88] font-bold">Player</th>
                  <th className="px-6 py-4 text-left text-[#00ff88] font-bold">Wins</th>
                  <th className="px-6 py-4 text-right text-[#00ff88] font-bold">Total Earnings</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-[#666666]">
                      No players on leaderboard yet
                    </td>
                  </tr>
                ) : (
                  leaderboard.map((entry, idx) => (
                    <tr key={idx} className={`border-b border-[#333333] ${idx < 3 ? 'bg-[#1a2a3a]' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {entry.rank === 1 && <span className="text-2xl mr-2">🥇</span>}
                          {entry.rank === 2 && <span className="text-2xl mr-2">🥈</span>}
                          {entry.rank === 3 && <span className="text-2xl mr-2">🥉</span>}
                          {entry.rank > 3 && <span className="text-[#666666] font-bold">{entry.rank}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-white font-mono text-sm">
                        {truncateAddress(entry.walletAddress)}
                      </td>
                      <td className="px-6 py-4 text-[#00ff88] font-bold">{entry.totalWins}</td>
                      <td className="px-6 py-4 text-right text-[#00ccff] font-bold">
                        {parseFloat(entry.totalWinnings).toFixed(4)} ETH
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  )
}
