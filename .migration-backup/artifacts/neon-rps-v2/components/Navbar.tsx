'use client'

import Link from 'next/link'
import { useSession } from '@/lib/auth-client'
import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { data: session } = useSession()

  return (
    <nav className="sticky top-0 z-50 bg-slate-950/95 backdrop-blur border-b border-cyan-500/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center font-bold text-white">
              RPS
            </div>
            <span className="text-xl font-bold text-white hidden sm:inline">Neon RPS</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/play" className="text-gray-300 hover:text-cyan-400 transition">
              Play
            </Link>
            <Link href="/tournaments" className="text-gray-300 hover:text-cyan-400 transition">
              Tournaments
            </Link>
            <Link href="/challenges" className="text-gray-300 hover:text-cyan-400 transition">
              Challenges
            </Link>
            <Link href="/leaderboard" className="text-gray-300 hover:text-cyan-400 transition">
              Leaderboard
            </Link>
            <Link href="/battle-pass" className="text-gray-300 hover:text-cyan-400 transition">
              Battle Pass
            </Link>
          </div>

          {/* Auth & Mobile */}
          <div className="flex items-center gap-4">
            {session?.user ? (
              <div className="flex items-center gap-2">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold">{session.user.name || 'Player'}</p>
                  <p className="text-xs text-gray-400">{session.user.email}</p>
                </div>
                <Link href="/profile">
                  <motion.img
                    src={session.user.image || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.user.id}`}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full border-2 border-cyan-500"
                    whileHover={{ scale: 1.05 }}
                  />
                </Link>
              </div>
            ) : (
              <Link
                href="/sign-in"
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition font-semibold hidden sm:inline"
              >
                Sign In
              </Link>
            )}
            
            <button
              className="md:hidden text-cyan-400"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden border-t border-cyan-500/20 mt-4 pt-4 space-y-2"
          >
            <Link href="/play" className="block px-4 py-2 text-gray-300 hover:text-cyan-400">
              Play
            </Link>
            <Link href="/tournaments" className="block px-4 py-2 text-gray-300 hover:text-cyan-400">
              Tournaments
            </Link>
            <Link href="/challenges" className="block px-4 py-2 text-gray-300 hover:text-cyan-400">
              Challenges
            </Link>
            <Link href="/leaderboard" className="block px-4 py-2 text-gray-300 hover:text-cyan-400">
              Leaderboard
            </Link>
            <Link href="/battle-pass" className="block px-4 py-2 text-gray-300 hover:text-cyan-400">
              Battle Pass
            </Link>
            {!session?.user && (
              <Link href="/sign-in" className="block px-4 py-2 bg-cyan-600 text-white rounded">
                Sign In
              </Link>
            )}
          </motion.div>
        )}
      </div>
    </nav>
  )
}
