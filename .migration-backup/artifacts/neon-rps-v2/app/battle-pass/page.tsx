'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Star, Lock, Zap, Crown } from 'lucide-react'
import { toast } from 'sonner'

export default function BattlePassPage() {
  const [tier, setTier] = useState<'free' | 'premium'>('free')
  const [level, setLevel] = useState(8)
  const [exp, setExp] = useState(450)

  const rewards = [
    { level: 1, name: 'Welcome Badge', icon: '🎖️', tier: 'free', unlocked: true },
    { level: 2, name: 'Rock Animation', icon: '✊', tier: 'free', unlocked: true },
    { level: 3, name: 'Paper Animation', icon: '✋', tier: 'free', unlocked: true },
    { level: 4, name: 'Victory Sound', icon: '🔊', tier: 'premium', unlocked: tier === 'premium' },
    { level: 5, name: 'Neon Trail Effect', icon: '✨', tier: 'premium', unlocked: tier === 'premium' },
    { level: 6, name: '2% Fee Discount', icon: '💎', tier: 'premium', unlocked: tier === 'premium' },
    { level: 7, name: 'Avatar Frame', icon: '🖼️', tier: 'premium', unlocked: tier === 'premium' },
    { level: 8, name: 'Early Tournament Access', icon: '🚀', tier: 'premium', unlocked: tier === 'premium' },
  ]

  const handleBuyPremium = () => {
    toast.success('Premium purchased! You now have access to all premium rewards.')
    setTier('premium')
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
            <Crown size={40} />
            Battle Pass
          </h1>
          <p className="text-gray-400">Unlock cosmetics, animations, and exclusive perks</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Progress Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-8 border border-cyan-500/30"
          >
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-white">Level {level}</h3>
                <span className="text-sm text-gray-400">{exp}/1000 EXP</span>
              </div>
              <div className="w-full h-4 bg-slate-700 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(exp / 1000) * 100}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="h-full bg-gradient-to-r from-cyan-500 to-purple-600"
                />
              </div>
            </div>

            <p className="text-gray-400 text-sm">
              Earn experience by playing games. Level up to unlock new rewards!
            </p>
          </motion.div>

          {/* Tier Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className={`rounded-xl p-6 border-2 ${
              tier === 'free'
                ? 'bg-slate-800/50 border-gray-500/30'
                : 'bg-gradient-to-br from-purple-900/30 to-cyan-900/30 border-purple-500/50'
            }`}
          >
            <h3 className="text-xl font-bold mb-4">{tier === 'free' ? 'Free' : 'Premium'} Pass</h3>
            
            {tier === 'free' ? (
              <div>
                <p className="text-2xl font-bold text-cyan-400 mb-6">$9.99</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleBuyPremium}
                  className="w-full py-2 bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-bold rounded-lg hover:from-cyan-700 hover:to-purple-700"
                >
                  Upgrade Now
                </motion.button>
              </div>
            ) : (
              <div>
                <div className="space-y-2 text-sm text-gray-300">
                  <p>✓ All premium rewards</p>
                  <p>✓ 2% fee discount</p>
                  <p>✓ Exclusive animations</p>
                  <p>✓ Early tournament access</p>
                </div>
                <div className="mt-4 text-xs text-purple-400 font-semibold">
                  Expires in 28 days
                </div>
              </div>
            )}
          </motion.div>
        </div>

        {/* Rewards Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-2xl font-bold mb-6">Rewards</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {rewards.map((reward, idx) => (
              <motion.div
                key={reward.level}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`rounded-xl p-4 text-center border-2 ${
                  reward.unlocked
                    ? reward.tier === 'free'
                      ? 'bg-cyan-900/20 border-cyan-500/50'
                      : 'bg-purple-900/20 border-purple-500/50'
                    : 'bg-slate-800/30 border-slate-600/30 opacity-60'
                }`}
              >
                <div className="text-3xl mb-2">{reward.icon}</div>
                <p className="text-sm font-semibold mb-1">{reward.name}</p>
                <p className="text-xs text-gray-400">Level {reward.level}</p>
                {!reward.unlocked && <Lock size={16} className="mx-auto mt-2 text-gray-500" />}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Benefits Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 border border-cyan-500/30">
            <Zap className="w-8 h-8 text-cyan-400 mb-3" />
            <h4 className="text-lg font-bold mb-2">Premium Animations</h4>
            <p className="text-gray-400 text-sm">Custom move animations and visual effects</p>
          </div>
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 border border-purple-500/30">
            <Star className="w-8 h-8 text-purple-400 mb-3" />
            <h4 className="text-lg font-bold mb-2">Fee Discount</h4>
            <p className="text-gray-400 text-sm">Reduce transaction fees by 2%</p>
          </div>
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 border border-yellow-500/30">
            <Crown className="w-8 h-8 text-yellow-400 mb-3" />
            <h4 className="text-lg font-bold mb-2">Exclusive Access</h4>
            <p className="text-gray-400 text-sm">Early access to tournaments and events</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
