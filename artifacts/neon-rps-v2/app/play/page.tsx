'use client'

import { useState, useEffect } from 'react'
import { useSession } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Zap, Trophy, TrendingUp } from 'lucide-react'
import GameBoard from '@/components/GameBoard'

export default function PlayPage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()
  const [wagerAmount, setWagerAmount] = useState('0.01')
  const [currency, setCurrency] = useState<'ETH' | 'USDC'>('ETH')
  const [gameStarted, setGameStarted] = useState(false)

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/sign-in')
    }
  }, [session, isPending, router])

  if (isPending || !session?.user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin">
          <Zap className="w-8 h-8 text-cyan-400" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-cyan-400 mb-4">Battle Arena</h1>
          <p className="text-gray-400">Play Rock-Paper-Scissors for real crypto</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Game Board */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-8 border border-cyan-500/30"
            >
              {gameStarted ? (
                <GameBoard onGameEnd={() => setGameStarted(false)} wagerAmount={wagerAmount} currency={currency} />
              ) : (
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-6">Ready to Battle?</h2>
                  <p className="text-gray-400 mb-8">Configure your wager and challenge an opponent</p>
                  
                  <div className="space-y-6">
                    {/* Wager Amount */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Wager Amount</label>
                      <input
                        type="number"
                        value={wagerAmount}
                        onChange={(e) => setWagerAmount(e.target.value)}
                        step="0.001"
                        min="0.001"
                        max="10"
                        className="w-full px-4 py-2 bg-slate-700 border border-cyan-500/30 rounded-lg text-white focus:outline-none focus:border-cyan-500"
                      />
                    </div>

                    {/* Currency */}
                    <div>
                      <label className="block text-sm font-semibold mb-2">Currency</label>
                      <div className="flex gap-4">
                        {(['ETH', 'USDC'] as const).map((cur) => (
                          <button
                            key={cur}
                            onClick={() => setCurrency(cur)}
                            className={`flex-1 py-2 rounded-lg font-semibold transition ${
                              currency === cur
                                ? 'bg-cyan-600 text-white'
                                : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                            }`}
                          >
                            {cur}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Start Button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setGameStarted(true)}
                      className="w-full py-3 bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-bold rounded-lg hover:from-cyan-700 hover:to-purple-700 transition"
                    >
                      Start Game
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 border border-cyan-500/30"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Trophy className="text-yellow-400" size={20} />
                Your Stats
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Win Rate</span>
                  <span className="text-cyan-400 font-semibold">78%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Winnings</span>
                  <span className="text-cyan-400 font-semibold">2.45 ETH</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Ranking</span>
                  <span className="text-cyan-400 font-semibold">#42</span>
                </div>
              </div>
            </motion.div>

            {/* Active Tournaments */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 border border-purple-500/30"
            >
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Zap className="text-purple-400" size={20} />
                Quick Actions
              </h3>
              <div className="space-y-2">
                <button className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold transition">
                  Join Tournament
                </button>
                <button className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold transition">
                  Daily Challenge
                </button>
                <button className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm font-semibold transition">
                  View Referral Code
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
