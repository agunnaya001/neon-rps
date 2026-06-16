'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Users, Zap, Plus } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function TournamentsPage() {
  const [tournaments] = useState([
    { id: '1', name: 'Elite Championship', players: 32, entryFee: '0.1 ETH', prizePool: '3.2 ETH', status: 'open' },
    { id: '2', name: 'Daily Grind', players: 16, entryFee: '0.01 ETH', prizePool: '0.16 ETH', status: 'open' },
    { id: '3', name: 'USDC Showdown', players: 8, entryFee: '10 USDC', prizePool: '80 USDC', status: 'in-progress' },
    { id: '4', name: 'Speed Battle', players: 4, entryFee: '0.05 ETH', prizePool: '0.2 ETH', status: 'completed' },
  ])

  const handleJoinTournament = (tournamentId: string) => {
    toast.success('Joined tournament! Check back soon for match details.')
  }

  return (
    <div className="min-h-screen bg-slate-950 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-12"
        >
          <div>
            <h1 className="text-4xl font-bold text-cyan-400 mb-2">Tournaments</h1>
            <p className="text-gray-400">Compete for huge prize pools</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-600 to-purple-600 text-white font-bold rounded-lg"
          >
            <Plus size={20} />
            Create Tournament
          </motion.button>
        </motion.div>

        {/* Tournaments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {tournaments.map((tournament, idx) => (
            <motion.div
              key={tournament.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 border border-cyan-500/30 hover:border-cyan-500/60 transition"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{tournament.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Users size={16} />
                    {tournament.players} players
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
                  tournament.status === 'open' ? 'bg-green-900/50 text-green-400' :
                  tournament.status === 'in-progress' ? 'bg-blue-900/50 text-blue-400' :
                  'bg-gray-900/50 text-gray-400'
                }`}>
                  {tournament.status.replace('-', ' ').toUpperCase()}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Entry Fee</span>
                  <span className="text-cyan-400 font-semibold">{tournament.entryFee}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Prize Pool</span>
                  <span className="text-yellow-400 font-semibold">{tournament.prizePool}</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleJoinTournament(tournament.id)}
                disabled={tournament.status !== 'open'}
                className={`w-full py-2 rounded-lg font-bold transition ${
                  tournament.status === 'open'
                    ? 'bg-cyan-600 hover:bg-cyan-700 text-white'
                    : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                }`}
              >
                {tournament.status === 'open' ? 'Join Tournament' : 'Tournament ' + tournament.status.toUpperCase()}
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
        >
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 border border-cyan-500/30 text-center">
            <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
            <p className="text-3xl font-bold text-cyan-400 mb-1">42</p>
            <p className="text-gray-400 text-sm">Total Tournaments</p>
          </div>
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 border border-cyan-500/30 text-center">
            <Users className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
            <p className="text-3xl font-bold text-cyan-400 mb-1">1.2K</p>
            <p className="text-gray-400 text-sm">Active Participants</p>
          </div>
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-6 border border-cyan-500/30 text-center">
            <Zap className="w-8 h-8 text-purple-400 mx-auto mb-3" />
            <p className="text-3xl font-bold text-cyan-400 mb-1">$125K</p>
            <p className="text-gray-400 text-sm">Prize Pool Distributed</p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
