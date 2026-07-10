import { useState, memo, useCallback } from 'react'
import { Medal, RefreshCw, AlertCircle } from 'lucide-react'
import { useGetLeaderboard } from '@workspace/api-client-react'
import Layout from '@/components/Layout'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { COLORS, ROUTES, LEADERBOARD_SORTS } from '@/lib/constants'
import { COLOR_VARIANTS } from '@/lib/constants'

const PERIODS = [
  { id: 'all-time' as const, label: 'All Time' },
  { id: 'monthly' as const, label: 'Monthly' },
  { id: 'weekly' as const, label: 'Weekly' },
]

const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32']
const RANK_LABELS = ['1st', '2nd', '3rd']

const truncateAddress = (addr: string | null | undefined): string => {
  if (!addr) return 'Anonymous'
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

const LeaderboardPage = memo(function LeaderboardPage() {
  const [period, setPeriod] = useState<'all-time' | 'monthly' | 'weekly'>('all-time')
  const { data, isLoading, isError, error, refetch } = useGetLeaderboard({ period })
  const leaderboard = data?.data ?? []

  const handleRefresh = useCallback(() => {
    refetch()
  }, [refetch])

  return (
    <Layout activePath={ROUTES.LEADERBOARD}>
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-2">Leaderboard</h1>
            <p style={{ color: '#888' }}>Top players ranked by wins and earnings</p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5 shrink-0 disabled:opacity-50"
            style={{
              backgroundColor: COLOR_VARIANTS.primary.bg,
              color: COLORS.primary,
              border: `1px solid ${COLOR_VARIANTS.primary.shadow}`,
            }}
            aria-label="Refresh leaderboard"
          >
            <RefreshCw size={15} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Period Filter */}
        <div className="flex gap-2 mb-8">
          {PERIODS.map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
              style={
                period === p.id
                  ? { backgroundColor: COLORS.primary, color: COLORS.background }
                  : {
                      backgroundColor: 'rgba(26,26,58,0.6)',
                      color: '#888',
                      border: `1px solid ${COLORS.border}`,
                    }
              }
              aria-pressed={period === p.id}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Top 3 Podium */}
        {leaderboard.length > 0 && !isLoading && !isError && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {leaderboard.slice(0, 3).map((entry, i) => (
              <div
                key={i}
                className="rounded-2xl p-4 border text-center"
                style={{
                  backgroundColor: 'rgba(26,26,58,0.8)',
                  borderColor: `${RANK_COLORS[i]}40`,
                }}
              >
                <div className="text-2xl font-black mb-1" style={{ color: RANK_COLORS[i] }}>
                  {RANK_LABELS[i]}
                </div>
                <div className="font-mono text-xs text-white mb-1">{truncateAddress(entry.walletAddress)}</div>
                <div className="text-xs font-bold" style={{ color: COLORS.primary }}>
                  {entry.totalWins}W
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <LoadingSpinner size="lg" color={COLORS.primary} />
            <span style={{ color: '#666' }}>Loading leaderboard...</span>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div
            className="flex items-center gap-4 p-6 rounded-2xl border"
            style={{
              backgroundColor: COLOR_VARIANTS.accent.bg,
              borderColor: COLOR_VARIANTS.accent.shadow,
            }}
            role="alert"
          >
            <AlertCircle size={24} style={{ color: COLORS.accent }} className="shrink-0" />
            <div className="flex-1">
              <h3 className="font-bold text-white mb-1">Failed to load leaderboard</h3>
              <p style={{ color: '#888', fontSize: '0.875rem' }}>
                {error?.message || 'An error occurred while loading the leaderboard.'}
              </p>
            </div>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 rounded-lg font-semibold text-sm shrink-0 transition-all hover:-translate-y-0.5"
              style={{ backgroundColor: COLORS.accent, color: '#ffffff' }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && leaderboard.length === 0 && (
          <div className="text-center py-24">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: COLOR_VARIANTS.primary.bgDark }}
            >
              <Medal size={40} style={{ color: COLORS.primary }} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No players yet</h3>
            <p style={{ color: '#666' }}>Be the first to make the leaderboard!</p>
          </div>
        )}

        {/* Leaderboard Table */}
        {!isLoading && !isError && leaderboard.length > 0 && (
          <div
            className="rounded-2xl border overflow-hidden"
            style={{ borderColor: COLORS.border }}
            role="table"
            aria-label="Player leaderboard"
          >
            <div
              className="grid grid-cols-12 px-5 py-3"
              style={{ backgroundColor: COLORS.background }}
              role="row"
            >
              <div
                className="col-span-2 text-xs font-bold tracking-widest"
                style={{ color: COLORS.primary }}
                role="columnheader"
              >
                RANK
              </div>
              <div
                className="col-span-5 text-xs font-bold tracking-widest"
                style={{ color: COLORS.primary }}
                role="columnheader"
              >
                PLAYER
              </div>
              <div
                className="col-span-2 text-xs font-bold tracking-widest"
                style={{ color: COLORS.primary }}
                role="columnheader"
              >
                WINS
              </div>
              <div
                className="col-span-3 text-xs font-bold tracking-widest text-right"
                style={{ color: COLORS.primary }}
                role="columnheader"
              >
                EARNINGS
              </div>
            </div>
            {leaderboard.map((entry, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 px-5 py-4 border-b transition-all hover:bg-white/[0.02]"
                style={{ borderColor: '#1e1e3a' }}
                role="row"
              >
                <div className="col-span-2 flex items-center" role="cell">
                  {idx < 3 ? (
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black"
                      style={{
                        backgroundColor: `${RANK_COLORS[idx]}15`,
                        color: RANK_COLORS[idx],
                      }}
                    >
                      {idx + 1}
                    </div>
                  ) : (
                    <span className="font-bold text-sm" style={{ color: '#555' }}>
                      #{entry.rank}
                    </span>
                  )}
                </div>
                <div className="col-span-5 flex items-center" role="cell">
                  <span className="font-mono text-sm text-white">{truncateAddress(entry.walletAddress)}</span>
                </div>
                <div className="col-span-2 flex items-center" role="cell">
                  <span className="font-bold text-sm" style={{ color: COLORS.primary }}>
                    {entry.totalWins}
                  </span>
                </div>
                <div className="col-span-3 flex items-center justify-end" role="cell">
                  <span className="font-bold text-sm" style={{ color: COLORS.secondary }}>
                    {parseFloat(entry.totalWinnings).toFixed(4)} ETH
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </Layout>
  )
})

export default LeaderboardPage
