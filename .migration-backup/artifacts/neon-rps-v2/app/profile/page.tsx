'use client'

import { useSession } from '@/lib/auth-client'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Copy, LogOut, Settings } from 'lucide-react'
import { toast } from 'sonner'

export default function ProfilePage() {
  const { data: session, isPending } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/sign-in')
    }
  }, [session, isPending, router])

  if (isPending || !session?.user) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>
  }

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    toast.success('Copied to clipboard!')
  }

  const referralCode = `ref_${session.user.id.slice(0, 8)}`
  const walletAddress = '0x' + session.user.id.slice(0, 40)

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-cyan-400 mb-2">Your Profile</h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Info */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="lg:col-span-2 bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-8 border border-cyan-500/30"
          >
            <div className="flex items-start gap-6 mb-8">
              <img
                src={session.user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`}
                alt="Avatar"
                className="w-24 h-24 rounded-full border-4 border-cyan-500"
              />
              <div>
                <h2 className="text-3xl font-bold text-white mb-2">{session.user.name || 'Player'}</h2>
                <p className="text-gray-400 mb-4">{session.user.email}</p>
                <button className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-semibold flex items-center gap-2">
                  <Settings size={18} />
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Total Wins</p>
                <p className="text-2xl font-bold text-cyan-400">87</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Win Rate</p>
                <p className="text-2xl font-bold text-cyan-400">72%</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Total Winnings</p>
                <p className="text-2xl font-bold text-cyan-400">5.45 ETH</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Current Rank</p>
                <p className="text-2xl font-bold text-cyan-400">#42</p>
              </div>
            </div>

            {/* Wallet & Referral */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Wallet Address</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={walletAddress}
                    readOnly
                    className="flex-1 px-4 py-2 bg-slate-700 border border-cyan-500/30 rounded-lg text-white text-sm font-mono"
                  />
                  <button
                    onClick={() => handleCopyAddress(walletAddress)}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-white font-semibold flex items-center gap-2"
                  >
                    <Copy size={18} />
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Referral Code</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={referralCode}
                    readOnly
                    className="flex-1 px-4 py-2 bg-slate-700 border border-purple-500/30 rounded-lg text-white text-sm font-mono"
                  />
                  <button
                    onClick={() => handleCopyAddress(referralCode)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-semibold flex items-center gap-2"
                  >
                    <Copy size={18} />
                  </button>
                </div>
                <p className="text-xs text-gray-400 mt-2">Share your code and earn 3% of referral winnings!</p>
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-6"
          >
            {/* Battle Pass Status */}
            <div className="bg-gradient-to-br from-purple-900/30 to-cyan-900/30 rounded-xl p-6 border border-purple-500/30">
              <h3 className="text-lg font-bold mb-4">Battle Pass</h3>
              <p className="text-2xl font-bold text-purple-400 mb-2">Level 8</p>
              <p className="text-gray-400 text-sm mb-4">Premium • Expires in 28 days</p>
              <button className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-lg font-semibold text-sm">
                Manage Pass
              </button>
            </div>

            {/* Referral Stats */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 border border-cyan-500/30">
              <h3 className="text-lg font-bold mb-4">Referral Stats</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm">Referrals</p>
                  <p className="text-2xl font-bold text-cyan-400">12</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Earnings</p>
                  <p className="text-2xl font-bold text-cyan-400">0.32 ETH</p>
                </div>
              </div>
            </div>

            {/* Logout */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 font-bold rounded-lg flex items-center justify-center gap-2"
            >
              <LogOut size={18} />
              Sign Out
            </motion.button>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
