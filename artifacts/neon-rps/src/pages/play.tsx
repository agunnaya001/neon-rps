import { memo, useCallback } from 'react'
import { Link } from 'wouter'
import { Zap, Trophy, Calendar, ChevronLeft, Swords } from 'lucide-react'
import Layout from '@/components/Layout'
import { ModeCard } from '@/components/common/ModeCard'
import { useGame } from '@/hooks/use-game'
import { COLORS, ROUTES, GAME_CONFIG } from '@/lib/constants'
import { COLOR_VARIANTS } from '@/lib/constants'
import { GameMode } from '@/types'

const MODES: Array<{
  id: GameMode
  icon: typeof Zap
  label: string
  sub: string
  color: string
  tags: string[]
}> = [
  {
    id: 'quick',
    icon: Zap,
    label: 'Quick Match',
    sub: 'Play immediately against a random opponent. Set your own wager.',
    color: COLORS.primary,
    tags: ['1v1', 'ETH/USDC'],
  },
  {
    id: 'tournament',
    icon: Trophy,
    label: 'Tournament',
    sub: 'Join or create a tournament bracket. Compete for prize pools.',
    color: COLORS.secondary,
    tags: ['Multi-Round', 'Prizes'],
  },
  {
    id: 'challenge',
    icon: Calendar,
    label: 'Daily Challenge',
    sub: 'Complete today\'s challenge and earn ETH rewards automatically.',
    color: COLORS.accent,
    tags: ['Daily', 'Rewards'],
  },
]

const PlayPage = memo(function PlayPage() {
  const { gameMode, wagerAmount, wagerType, potentialWinnings, protocolFee, setGameMode, setWagerAmount, setWagerType } = useGame({
    initialMode: null,
    initialWager: '0.01',
    initialWagerType: 'eth',
  })

  const handleModeSelect = useCallback((mode: GameMode | null) => {
    setGameMode(mode)
  }, [setGameMode])

  return (
    <Layout activePath={ROUTES.PLAY}>
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {!gameMode ? (
          <div className="fade-in">
            <div className="mb-10">
              <h1 className="text-4xl sm:text-5xl font-black text-white mb-3">Choose Mode</h1>
              <p className="text-lg" style={{ color: '#888' }}>Pick how you want to compete</p>
            </div>
            <div className="flex flex-col gap-4">
              {MODES.map(mode => (
                <ModeCard
                  key={mode.id}
                  {...mode}
                  onClick={handleModeSelect}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-lg mx-auto fade-in">
            <button
              onClick={() => handleModeSelect(null)}
              className="flex items-center gap-2 mb-8 font-semibold transition-all hover:gap-3"
              style={{ color: COLORS.primary }}
            >
              <ChevronLeft size={18} />
              Back to Modes
            </button>

            {gameMode === 'quick' && (
              <div className="rounded-2xl p-8 border" style={{ backgroundColor: 'rgba(26,26,58,0.6)', borderColor: COLORS.border }}>
                <div className="flex items-center gap-3 mb-8">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: COLOR_VARIANTS.primary.bgHover }}
                  >
                    <Zap size={24} style={{ color: COLORS.primary }} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">Quick Match</h2>
                    <p className="text-sm" style={{ color: '#888' }}>1v1 against a random opponent</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold tracking-widest mb-3" style={{ color: COLORS.primary }}>
                      WAGER AMOUNT
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="number"
                        value={wagerAmount}
                        onChange={e => setWagerAmount(e.target.value)}
                        step="0.001"
                        min={GAME_CONFIG.MIN_WAGER}
                        max={GAME_CONFIG.MAX_WAGER}
                        className="flex-1 rounded-xl px-4 py-3 text-white font-bold text-lg focus:outline-none transition-all"
                        style={{ backgroundColor: COLORS.background, border: `1px solid ${COLORS.border}` }}
                        placeholder="0.01"
                        aria-label="Wager amount"
                      />
                      <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: COLORS.border }}>
                        {(['eth', 'usdc'] as const).map(t => (
                          <button
                            key={t}
                            onClick={() => setWagerType(t)}
                            className="px-5 py-3 text-sm font-bold transition-all"
                            style={
                              wagerType === t
                                ? { backgroundColor: COLORS.primary, color: COLORS.background }
                                : { backgroundColor: COLORS.background, color: '#666' }
                            }
                            aria-pressed={wagerType === t}
                          >
                            {t.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl p-5 border" style={{ backgroundColor: COLORS.background, borderColor: COLORS.border }}>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs font-bold tracking-widest mb-1" style={{ color: '#666' }}>
                          POTENTIAL WIN
                        </div>
                        <div className="text-3xl font-black" style={{ color: COLORS.secondary }}>
                          {potentialWinnings} {wagerType.toUpperCase()}
                        </div>
                        <div className="text-xs mt-1" style={{ color: '#666' }}>
                          After {GAME_CONFIG.PROTOCOL_FEE_PERCENT}% protocol fee
                        </div>
                      </div>
                      <div
                        className="w-14 h-14 rounded-2xl flex items-center justify-center"
                        style={{ backgroundColor: COLOR_VARIANTS.secondary.bgDark }}
                      >
                        <Swords size={28} style={{ color: COLORS.secondary }} />
                      </div>
                    </div>
                  </div>

                  <button
                    className="w-full py-4 rounded-xl font-bold text-lg text-[#0f0f23] shimmer-btn transition-all hover:shadow-lg hover:shadow-[#00ff88]/30 hover:-translate-y-0.5"
                    aria-label="Find opponent"
                  >
                    Find Opponent
                  </button>
                </div>
              </div>
            )}

            {gameMode === 'tournament' && (
              <div className="rounded-2xl p-8 border" style={{ backgroundColor: 'rgba(26,26,58,0.6)', borderColor: COLORS.border }}>
                <div className="flex items-center gap-3 mb-8">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: COLOR_VARIANTS.secondary.bgHover }}
                  >
                    <Trophy size={24} style={{ color: COLORS.secondary }} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">Tournaments</h2>
                    <p className="text-sm" style={{ color: '#888' }}>Multi-round bracket play</p>
                  </div>
                </div>
                <p className="mb-6" style={{ color: '#888' }}>
                  Join an existing tournament or create a new one with custom rules and prize pools.
                </p>
                <Link href={ROUTES.TOURNAMENTS}>
                  <span
                    className="block w-full py-4 rounded-xl font-bold text-lg text-center cursor-pointer transition-all hover:-translate-y-0.5"
                    style={{ backgroundColor: COLORS.secondary, color: COLORS.background }}
                  >
                    Browse Tournaments
                  </span>
                </Link>
              </div>
            )}

            {gameMode === 'challenge' && (
              <div className="rounded-2xl p-8 border" style={{ backgroundColor: 'rgba(26,26,58,0.6)', borderColor: COLORS.border }}>
                <div className="flex items-center gap-3 mb-8">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: COLOR_VARIANTS.accent.bgHover }}
                  >
                    <Calendar size={24} style={{ color: COLORS.accent }} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-white">Daily Challenge</h2>
                    <p className="text-sm" style={{ color: '#888' }}>Resets every 24 hours</p>
                  </div>
                </div>
                <p className="mb-6" style={{ color: '#888' }}>
                  Complete today&apos;s challenge to earn automatic ETH rewards. Progress is tracked on-chain.
                </p>
                <Link href={ROUTES.CHALLENGES}>
                  <span
                    className="block w-full py-4 rounded-xl font-bold text-lg text-center cursor-pointer transition-all hover:-translate-y-0.5"
                    style={{ backgroundColor: COLORS.accent, color: '#ffffff' }}
                  >
                    View Today&apos;s Challenge
                  </span>
                </Link>
              </div>
            )}
          </div>
        )}
      </section>
    </Layout>
  )
})

export default PlayPage
