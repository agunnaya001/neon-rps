'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Gift, Clock, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

export default function ChallengesPage() {
  const [challenges] = useState([
    { id: '1', title: 'Win Streak', description: 'Win 3 games in a row', progress: 2, target: 3, reward: '0.01 ETH', completed: false },
    { id: '2', title: 'Challenger', description: 'Play 5 different opponents', progress: 3, target: 5, reward: '0.005 ETH', completed: false },
    { id: '3', title: 'High Roller', description: 'Win 2 games with USDC bets', progress: 0, target: 2, reward: '10 USDC', completed: false },
    { id: '4', title: 'Tournament Victor', description: 'Win a tournament', progress: 0, target: 1, reward: 'Exclusive NFT', completed: false },
  ])

  const handleClaimReward = (challengeId: string) => {
    toast.success('Reward claimed!')
  }

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl font-bold text-cyan-400 mb-2">Daily Challenges</h1>
          <p className="text-gray-400">Complete challenges to earn rewards and cosmetics</p>
        </motion.div>

        {/* Challenges */}
        <div className="space-y-6">
          {challenges.map((challenge, idx) => {
            const progressPercent = (challenge.progress / challenge.target) * 100
            const isCompleted = challenge.progress >= challenge.target

            return (
              <motion.div
                key={challenge.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 border border-cyan-500/30"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">{challenge.title}</h3>
                    <p className="text-gray-400 text-sm">{challenge.description}</p>
                  </div>
                  <div className="flex items-center gap-2 px-4 py-2 bg-purple-900/30 rounded-lg">
                    <Gift size={18} className="text-purple-400" />
                    <span className="text-purple-400 font-semibold">{challenge.reward}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Progress Bar */}
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-cyan-400 font-semibold">{challenge.progress}/{challenge.target}</span>
                    </div>
                    <div className="w-full h-3 bg-slate-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercent}%` }}
                        transition={{ duration: 0.5, delay: idx * 0.1 + 0.2 }}
                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-600"
                      />
                    </div>
                  </div>

                  {/* Claim Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleClaimReward(challenge.id)}
                    disabled={!isCompleted}
                    className={`w-full py-2 rounded-lg font-bold transition flex items-center justify-center gap-2 ${
                      isCompleted
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {isCompleted ? (
                      <>
                        <CheckCircle size={18} />
                        Claim Reward
                      </>
                    ) : (
                      <>
                        <Clock size={18} />
                        In Progress
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Upcoming Challenges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 border border-purple-500/30"
        >
          <h3 className="text-xl font-bold mb-4 text-purple-400">Next Challenge Refreshes In</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-cyan-400">18</p>
              <p className="text-gray-400 text-sm">Hours</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-cyan-400">42</p>
              <p className="text-gray-400 text-sm">Minutes</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-cyan-400">35</p>
              <p className="text-gray-400 text-sm">Seconds</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
