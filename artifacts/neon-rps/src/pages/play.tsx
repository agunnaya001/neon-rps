import { useState } from 'react'
import { Link } from 'wouter'
import { Zap, Trophy, Calendar, ChevronLeft, Swords } from 'lucide-react'
import Layout from '@/components/Layout'

type GameMode = 'quick' | 'tournament' | 'challenge' | null

const MODES = [
  {
    id: 'quick' as const,
    icon: Zap,
    label: 'Quick Match',
    sub: 'Play immediately against a random opponent. Set your own wager.',
    color: '#00ff88',
    tags: ['1v1', 'ETH/USDC'],
  },
  {
    id: 'tournament' as const,
    icon: Trophy,
    label: 'Tournament',
    sub: 'Join or create a tournament bracket. Compete for prize pools.',
    color: '#00ccff',
    tags: ['Multi-Round', 'Prizes'],
  },
  {
    id: 'challenge' as const,
    icon: Calendar,
    label: 'Daily Challenge',
    sub: 'Complete today\'s challenge and earn ETH rewards automatically.',
    color: '#ff006e',
    tags: ['Daily', 'Rewards'],
  },
]

export default function PlayPage() {
  const [gameMode, setGameMode] = useState<GameMode>(null)
  const [wagerAmount, setWagerAmount] = useState('0.01')
  const [wagerType, setWagerType] = useState<'eth' | 'usdc'>('eth')

  return (
    <Layout activePath="/play">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {!gameMode ? (
          <div className="fade-in">
            <div className="mb-10">
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">Choose Mode</h1>
              <p className="text-lg" style={{ color: '#888' }}>Pick how you want to compete</p>
            </div>
            <div className="flex flex-col gap-4">
              {MODES.map(({ id, icon: Icon, label, sub, color, tags }) => (
                <button
                  key={id}
                  onClick={() => setGameMode(id)}
                  className="group flex items-center gap-5 rounded-2xl p-6 border text-left transition-all duration-300 hover:-translate-x-1"
                  style={{ backgroundColor: 'rgba(26,26,58,0.6)', borderColor: '#2a2a4a' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = color)}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#2a2a4a')}
                >
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 transition-all group-hover:scale-110"
                    style={{ backgroundColor: `${color}15` }}>
                    <Icon size={32} style={{ color }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-white mb-1">{label}</h3>
                    <p className="text-sm leading-relaxed mb-3" style={{ color: '#888' }}>{sub}</p>
                    <div className="flex gap-2">
                      {tags.map((tag, i) => (
                        <span key={tag} className="px-3 py-1 rounded-md text-xs font-bold"
                          style={i === 0
                            ? { backgroundColor: color, color: '#0f0f23' }
                            : { border: `1px solid ${color}`, color, backgroundColor: `${color}10` }
                          }>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <ChevronLeft size={20} style={{ color: '#444' }} className="rotate-180 shrink-0 transition-all group-hover:translate-x-1" />
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-lg mx-auto fade-in">
            <button
              onClick={() => setGameMode(null)}
              className="flex items-center gap-2 mb-8 font-semibold transition-all hover:gap-3"
              style={{ color: '#00ff88' }}
            >
              <ChevronLeft size={18} />
              Back to Modes
            </button>

            {gameMode === 'quick' && (
              <div className="rounded-2xl p-8 border" style={{ backgroundColor: 'rgba(26,26,58,0.6)', borderColor: '#2a2a4a' }}>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(0,255,136,0.15)' }}>
                    <Zap size={24} style={{ color: '#00ff88' }} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">Quick Match</h2>
                    <p className="text-sm" style={{ color: '#888' }}>1v1 against a random opponent</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold tracking-widest mb-3" style={{ color: '#00ff88' }}>WAGER AMOUNT</label>
                    <div className="flex gap-3">
                      <input
                        type="number"
                        value={wagerAmount}
                        onChange={e => setWagerAmount(e.target.value)}
                        step="0.001"
                        min="0"
                        className="flex-1 rounded-xl px-4 py-3 text-white font-bold text-lg focus:outline-none transition-all"
                        style={{ backgroundColor: '#0f0f23', border: '1px solid #2a2a4a' }}
                        placeholder="0.01"
                        onFocus={e => (e.target.style.borderColor = '#00ff88')}
                        onBlur={e => (e.target.style.borderColor = '#2a2a4a')}
                      />
                      <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: '#2a2a4a' }}>
                        {(['eth', 'usdc'] as const).map(t => (
                          <button
                            key={t}
                            onClick={() => setWagerType(t)}
                            className="px-5 py-3 text-sm font-bold transition-all"
                            style={wagerType === t
                              ? { backgroundColor: '#00ff88', color: '#0f0f23' }
                              : { backgroundColor: '#0f0f23', color: '#666' }
                            }
                          >
                            {t.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl p-5 border" style={{ backgroundColor: '#0f0f23', borderColor: '#2a2a4a' }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold tracking-widest mb-1" style={{ color: '#666' }}>POTENTIAL WIN</div>
                        <div className="text-3xl font-black" style={{ color: '#00ccff' }}>
                          {(parseFloat(wagerAmount || '0') * 1.9).toFixed(3)} {wagerType.toUpperCase()}
                        </div>
                        <div className="text-xs mt-1" style={{ color: '#666' }}>After 2.5% protocol fee</div>
                      </div>
                      <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ backgroundColor: 'rgba(0,204,255,0.1)' }}>
                        <Swords size={28} style={{ color: '#00ccff' }} />
                      </div>
                    </div>
                  </div>

                  <button className="w-full py-4 rounded-xl font-bold text-lg text-[#0f0f23] shimmer-btn transition-all hover:shadow-lg hover:shadow-[#00ff88]/30 hover:-translate-y-0.5">
                    Find Opponent
                  </button>
                </div>
              </div>
            )}

            {gameMode === 'tournament' && (
              <div className="rounded-2xl p-8 border" style={{ backgroundColor: 'rgba(26,26,58,0.6)', borderColor: '#2a2a4a' }}>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(0,204,255,0.15)' }}>
                    <Trophy size={24} style={{ color: '#00ccff' }} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">Tournaments</h2>
                    <p className="text-sm" style={{ color: '#888' }}>Multi-round bracket play</p>
                  </div>
                </div>
                <p className="mb-6" style={{ color: '#888' }}>
                  Join an existing tournament or create a new one with custom rules and prize pools.
                </p>
                <Link href="/tournaments">
                  <span className="block w-full py-4 rounded-xl font-bold text-lg text-center cursor-pointer transition-all hover:-translate-y-0.5"
                    style={{ backgroundColor: '#00ccff', color: '#0f0f23' }}>
                    Browse Tournaments
                  </span>
                </Link>
              </div>
            )}

            {gameMode === 'challenge' && (
              <div className="rounded-2xl p-8 border" style={{ backgroundColor: 'rgba(26,26,58,0.6)', borderColor: '#2a2a4a' }}>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255,0,110,0.15)' }}>
                    <Calendar size={24} style={{ color: '#ff006e' }} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">Daily Challenge</h2>
                    <p className="text-sm" style={{ color: '#888' }}>Resets every 24 hours</p>
                  </div>
                </div>
                <p className="mb-6" style={{ color: '#888' }}>
                  Complete today's challenge to earn automatic ETH rewards. Progress is tracked on-chain.
                </p>
                <Link href="/challenges">
                  <span className="block w-full py-4 rounded-xl font-bold text-lg text-center cursor-pointer transition-all hover:-translate-y-0.5"
                    style={{ backgroundColor: '#ff006e', color: '#ffffff' }}>
                    View Today's Challenge
                  </span>
                </Link>
              </div>
            )}
          </div>
        )}
      </section>
    </Layout>
  )
}
