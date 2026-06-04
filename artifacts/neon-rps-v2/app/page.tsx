'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, Trophy, Gamepad2, TrendingUp, Users, Gift } from 'lucide-react'
import { useSession } from '@/lib/auth-client'

export default function Home() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-hidden">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-cyan-400 via-purple-500 to-cyan-400 bg-clip-text text-transparent">
            Neon RPS
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Battle on Base. Win ETH & USDC. Join tournaments, complete daily challenges, and climb the leaderboard.
          </p>
          <div className="flex gap-4 justify-center">
            {session?.user ? (
              <Link href="/play">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold flex items-center gap-2"
                >
                  <Gamepad2 size={20} />
                  Play Now
                </motion.button>
              </Link>
            ) : (
              <Link href="/sign-in">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-3 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg font-bold"
                >
                  Get Started
                </motion.button>
              </Link>
            )}
            <Link href="/tournaments">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-8 py-3 border-2 border-cyan-500 text-cyan-400 hover:bg-cyan-500/10 rounded-lg font-bold"
              >
                View Tournaments
              </motion.button>
            </Link>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16"
        >
          {[
            { icon: Zap, title: 'Instant Battles', desc: 'Play rock-paper-scissors on-chain with commit-reveal cryptography' },
            { icon: Trophy, title: 'Tournaments', desc: 'Single elimination brackets with real prize pools' },
            { icon: Gift, title: 'Daily Challenges', desc: 'Complete daily missions for rewards and cosmetics' },
            { icon: TrendingUp, title: 'On-Chain Referrals', desc: 'Earn 3% from referred players automatically' },
            { icon: Users, title: 'Battle Pass', desc: 'Premium cosmetics, move animations, and fee discounts' },
            { icon: Gamepad2, title: 'ETH & USDC', desc: 'Play and win in both ETH and stablecoin' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ y: -5 }}
              className="p-6 rounded-lg border border-cyan-500/30 bg-slate-900/50 hover:bg-slate-800/50 transition"
            >
              <feature.icon className="w-8 h-8 text-cyan-400 mb-3" />
              <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-400 text-sm">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 text-center"
        >
          {[
            { label: 'Active Players', value: '1.2K+' },
            { label: 'Games Played', value: '45K+' },
            { label: 'Prize Pool', value: '$125K+' },
            { label: 'Tournaments', value: '42' },
          ].map((stat, i) => (
            <div key={i}>
              <p className="text-3xl font-bold text-cyan-400">{stat.value}</p>
              <p className="text-gray-400 text-sm mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-cyan-900/20 to-purple-900/20 border-t border-cyan-500/20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to battle?</h2>
          <p className="text-gray-300 mb-8">Join thousands of players on Base in the most exciting on-chain game experience.</p>
          <Link href={session?.user ? '/play' : '/sign-in'}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-lg font-bold text-lg"
            >
              Start Playing
            </motion.button>
          </Link>
        </div>
      </section>
    </div>
  )
}
