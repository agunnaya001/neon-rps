import { useState } from 'react'
import { Link } from 'wouter'

export default function PlayPage() {
  const [gameMode, setGameMode] = useState<'quick' | 'tournament' | 'challenge' | null>(null)
  const [wagerAmount, setWagerAmount] = useState('0.01')
  const [wagerType, setWagerType] = useState<'eth' | 'usdc'>('eth')

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a3a] to-[#0f0f23]">
      <nav className="border-b border-[#333333] bg-[#0f0f23]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#00ff88]">NEON RPS</Link>
          <div className="flex gap-6">
            <Link href="/tournaments" className="text-white hover:text-[#00ff88] transition">Tournaments</Link>
            <Link href="/challenges" className="text-white hover:text-[#00ff88] transition">Challenges</Link>
            <Link href="/leaderboard" className="text-white hover:text-[#00ff88] transition">Leaderboard</Link>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 py-12">
        {!gameMode ? (
          <div>
            <h1 className="text-4xl font-bold text-white mb-8 text-center">🎮 Choose Game Mode</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              <button
                onClick={() => setGameMode('quick')}
                className="bg-[#1a1a3a] border border-[#333333] rounded-lg p-8 hover:border-[#00ff88] transition text-left"
              >
                <div className="text-4xl mb-4">⚡</div>
                <h3 className="text-xl font-bold text-white mb-2">Quick Match</h3>
                <p className="text-[#666666] mb-6">Play immediately against a random opponent. Set your own wager.</p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-[#00ff88] text-[#0f0f23] rounded text-sm font-bold">1v1</span>
                  <span className="px-3 py-1 bg-[#00ccff] text-[#0f0f23] rounded text-sm font-bold">ETH/USDC</span>
                </div>
              </button>
              <button
                onClick={() => setGameMode('tournament')}
                className="bg-[#1a1a3a] border border-[#333333] rounded-lg p-8 hover:border-[#00ccff] transition text-left"
              >
                <div className="text-4xl mb-4">🏆</div>
                <h3 className="text-xl font-bold text-white mb-2">Tournament</h3>
                <p className="text-[#666666] mb-6">Join or create a tournament bracket. Compete for prize pools.</p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-[#00ccff] text-[#0f0f23] rounded text-sm font-bold">Multi-Round</span>
                  <span className="px-3 py-1 bg-[#ff006e] text-white rounded text-sm font-bold">Prizes</span>
                </div>
              </button>
              <button
                onClick={() => setGameMode('challenge')}
                className="bg-[#1a1a3a] border border-[#333333] rounded-lg p-8 hover:border-[#ff006e] transition text-left"
              >
                <div className="text-4xl mb-4">📅</div>
                <h3 className="text-xl font-bold text-white mb-2">Daily Challenge</h3>
                <p className="text-[#666666] mb-6">Complete today's challenge and earn ETH rewards automatically.</p>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-[#ff006e] text-white rounded text-sm font-bold">Daily</span>
                  <span className="px-3 py-1 bg-[#00ff88] text-[#0f0f23] rounded text-sm font-bold">Rewards</span>
                </div>
              </button>
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="bg-[#1a1a3a] border border-[#333333] rounded-lg p-8 mb-8">
              <button
                onClick={() => setGameMode(null)}
                className="mb-6 text-[#00ff88] hover:text-[#00ccff] transition font-bold"
              >
                ← Back to Modes
              </button>
              <h2 className="text-2xl font-bold text-white mb-6">
                {gameMode === 'quick' && '⚡ Quick Match Setup'}
                {gameMode === 'tournament' && '🏆 Tournament Setup'}
                {gameMode === 'challenge' && '📅 Challenge Setup'}
              </h2>
              {gameMode === 'quick' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-[#00ff88] font-bold mb-2">Wager Amount</label>
                    <div className="flex gap-4">
                      <input
                        type="number"
                        value={wagerAmount}
                        onChange={(e) => setWagerAmount(e.target.value)}
                        step="0.001"
                        min="0"
                        className="flex-1 bg-[#0f0f23] border border-[#333333] rounded px-4 py-2 text-white"
                        placeholder="0.01"
                      />
                      <select
                        value={wagerType}
                        onChange={(e) => setWagerType(e.target.value as 'eth' | 'usdc')}
                        className="bg-[#0f0f23] border border-[#333333] rounded px-4 py-2 text-white font-bold"
                      >
                        <option value="eth">ETH</option>
                        <option value="usdc">USDC</option>
                      </select>
                    </div>
                  </div>
                  <div className="bg-[#0f0f23] border border-[#333333] rounded p-4">
                    <div className="text-[#666666] text-sm mb-2">Potential Winnings</div>
                    <div className="text-2xl font-bold text-[#00ccff]">
                      {(parseFloat(wagerAmount || '0') * 1.9).toFixed(3)} {wagerType.toUpperCase()}
                    </div>
                    <div className="text-[#666666] text-xs mt-2">After 2.5% fee</div>
                  </div>
                  <button className="w-full px-6 py-3 bg-gradient-to-r from-[#00ff88] to-[#00ccff] text-[#0f0f23] font-bold text-lg rounded hover:shadow-lg hover:shadow-[#00ff88]/50 transition">
                    Start Game
                  </button>
                </div>
              )}
              {gameMode === 'tournament' && (
                <div className="space-y-6">
                  <div className="bg-[#0f0f23] border border-[#333333] rounded p-4">
                    <p className="text-[#666666]">Join an existing tournament or create a new one with custom rules.</p>
                  </div>
                  <Link href="/tournaments">
                    <span className="block w-full px-6 py-3 bg-[#00ccff] text-[#0f0f23] font-bold text-lg rounded text-center hover:bg-[#00ff88] transition cursor-pointer">
                      Browse Tournaments
                    </span>
                  </Link>
                </div>
              )}
              {gameMode === 'challenge' && (
                <div className="space-y-6">
                  <div className="bg-[#0f0f23] border border-[#333333] rounded p-4">
                    <p className="text-[#666666]">Complete today's challenge. Progress is tracked automatically.</p>
                  </div>
                  <Link href="/challenges">
                    <span className="block w-full px-6 py-3 bg-[#ff006e] text-white font-bold text-lg rounded text-center hover:bg-[#ff3385] transition cursor-pointer">
                      View Daily Challenge
                    </span>
                  </Link>
                </div>
              )}
            </div>
            <div className="bg-[#1a1a3a] border border-[#333333] rounded-lg p-12 text-center">
              <div className="text-6xl mb-4">🎮</div>
              <p className="text-[#666666] text-lg">Game client loads here</p>
              <p className="text-[#666666] text-sm mt-2">Integration with existing RPS game component</p>
            </div>
          </div>
        )}
      </section>
    </main>
  )
}
