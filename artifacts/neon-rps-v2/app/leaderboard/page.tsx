'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, TrendingUp, Award } from 'lucide-react'

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'all-time'>('all-time')
  
  const leaderboard = [
    { rank: 1, name: 'ProPlayer', address: '0x1234...5678', wins: 156, winnings: '12.45 ETH', trending: '↑' },
    { rank: 2, name: 'RPS Master', address: '0x9abc...def0', wins: 142, winnings: '11.20 ETH', trending: '↑' },
    { rank: 3, name: 'Neon Knight', address: '0x2345...6789', wins: 138, winnings: '10.80 ETH', trending: '=' },
    { rank: 4, name: 'CryptoGamer', address: '0x3456...7890', wins: 125, winnings: '9.50 ETH', trending: '↓' },
    { rank: 5, name: 'Rockstar99', address: '0x4567...8901', wins: 119, winnings: '8.95 ETH', trending: '↑' },
    { rank: 6, name: 'PaperHands', address: '0x5678...9012', wins: 114, winnings: '8.40 ETH', trending: '↓' },
    { rank: 7, name: 'ScissorsMaster', address: '0x6789...0123', wins: 108, winnings: '7.85 ETH', trending: '↑' },
    { rank: 8, name: 'Lucky Strike', address: '0x7890...1234', wins: 102, winnings: '7.25 ETH', trending: '=' },
  ]

  const getRankMedal = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-cyan-400 mb-2 flex items-center gap-3">
            <Trophy size={40} />
            Leaderboard
          </h1>
          <p className="text-gray-400">Top players earning the most winnings</p>
        </motion.div>

        {/* Period Selector */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="flex gap-4 mb-8"
        >
          {(['weekly', 'monthly', 'all-time'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-6 py-2 rounded-lg font-semibold transition ${
                period === p
                  ? 'bg-cyan-600 text-white'
                  : 'bg-slate-800 text-gray-400 hover:bg-slate-700'
              }`}
            >
              {p === 'all-time' ? 'All Time' : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </motion.div>

        {/* Leaderboard Table */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-cyan-500/30 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-cyan-500/20 bg-slate-800/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Rank</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Player</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Wallet</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">Wins</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-gray-400">Winnings</th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-400">Trend</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((player, idx) => (
                  <motion.tr
                    key={player.rank}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-cyan-500/10 hover:bg-slate-700/30 transition"
                  >
                    <td className="px-6 py-4 text-lg font-bold text-cyan-400">
                      {getRankMedal(player.rank)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white font-bold">
                          {player.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-white">{player.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm font-mono">{player.address}</td>
                    <td className="px-6 py-4 text-right text-white font-semibold">{player.wins}</td>
                    <td className="px-6 py-4 text-right text-cyan-400 font-semibold">{player.winnings}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-lg ${
                        player.trending === '↑' ? 'text-green-400' :
                        player.trending === '↓' ? 'text-red-400' :
                        'text-gray-400'
                      }`}>
                        {player.trending}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Your Rank */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-r from-cyan-900/30 to-purple-900/30 rounded-xl p-6 border border-cyan-500/30"
        >
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Award size={20} className="text-purple-400" />
            Your Rank
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <p className="text-gray-400 text-sm">Position</p>
              <p className="text-2xl font-bold text-cyan-400">#42</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Wins</p>
              <p className="text-2xl font-bold text-cyan-400">87</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Winnings</p>
              <p className="text-2xl font-bold text-cyan-400">5.45 ETH</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm">Win Rate</p>
              <p className="text-2xl font-bold text-cyan-400">72%</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
