import { useState } from 'react'
import { Medal, RefreshCw } from 'lucide-react'
import { useGetLeaderboard } from '@workspace/api-client-react'
import Layout from '@/components/Layout'

const PERIODS = [
  { id: 'all-time' as const, label: 'All Time' },
  { id: 'monthly' as const, label: 'Monthly' },
  { id: 'weekly' as const, label: 'Weekly' },
]

const RANK_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32']
const RANK_LABELS = ['1st', '2nd', '3rd']

function truncateAddress(addr: string | null | undefined): string {
  if (!addr) return 'Anonymous'
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`
}

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<'all-time' | 'monthly' | 'weekly'>('all-time')
  const { data, isLoading, refetch } = useGetLeaderboard({ period })
  const leaderboard = data?.data ?? []

  return (
    <Layout activePath="/leaderboard">
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl sm:text-5xl font-black text-white mb-2">Leaderboard</h1>
            <p style={{ color: '#888' }}>Top players ranked by wins and earnings</p>
          </div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm transition-all hover:-translate-y-0.5 shrink-0"
            style={{ backgroundColor: 'rgba(0,255,136,0.1)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.2)' }}
          >
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        <div className="flex gap-2 mb-8">
          {PERIODS.map(p => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-sm transition-all"
              style={period === p.id
                ? { backgroundColor: '#00ff88', color: '#0f0f23' }
                : { backgroundColor: 'rgba(26,26,58,0.6)', color: '#888', border: '1px solid #2a2a4a' }
              }
            >
              {p.label}
            </button>
          ))}
        </div>

        {leaderboard.length > 0 && !isLoading && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {leaderboard.slice(0, 3).map((entry, i) => (
              <div key={i} className="rounded-2xl p-4 border text-center"
                style={{ backgroundColor: 'rgba(26,26,58,0.8)', borderColor: `${RANK_COLORS[i]}40` }}>
                <div className="text-2xl font-black mb-1" style={{ color: RANK_COLORS[i] }}>
                  {RANK_LABELS[i]}
                </div>
                <div className="font-mono text-xs text-white mb-1">{truncateAddress(entry.walletAddress)}</div>
                <div className="text-xs font-bold" style={{ color: '#00ff88' }}>{entry.totalWins}W</div>
              </div>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: '#00ff88', borderTopColor: 'transparent' }} />
            <span style={{ color: '#666' }}>Loading leaderboard...</span>
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'rgba(0,255,136,0.08)' }}>
              <Medal size={40} style={{ color: '#00ff88' }} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No players yet</h3>
            <p style={{ color: '#666' }}>Be the first to make the leaderboard!</p>
          </div>
        ) : (
          <div className="rounded-2xl border overflow-hidden" style={{ borderColor: '#2a2a4a' }}>
            <div className="grid grid-cols-12 px-5 py-3" style={{ backgroundColor: '#0f0f23' }}>
              <div className="col-span-2 text-xs font-bold tracking-widest" style={{ color: '#00ff88' }}>RANK</div>
              <div className="col-span-5 text-xs font-bold tracking-widest" style={{ color: '#00ff88' }}>PLAYER</div>
              <div className="col-span-2 text-xs font-bold tracking-widest" style={{ color: '#00ff88' }}>WINS</div>
              <div className="col-span-3 text-xs font-bold tracking-widest text-right" style={{ color: '#00ff88' }}>EARNINGS</div>
            </div>
            {leaderboard.map((entry, idx) => (
              <div
                key={idx}
                className="grid grid-cols-12 px-5 py-4 border-b transition-all hover:bg-white/[0.02]"
                style={{ borderColor: '#1e1e3a' }}
              >
                <div className="col-span-2 flex items-center">
                  {idx < 3 ? (
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black"
                      style={{ backgroundColor: `${RANK_COLORS[idx]}15`, color: RANK_COLORS[idx] }}>
                      {idx + 1}
                    </div>
                  ) : (
                    <span className="font-bold text-sm" style={{ color: '#555' }}>#{entry.rank}</span>
                  )}
                </div>
                <div className="col-span-5 flex items-center">
                  <span className="font-mono text-sm text-white">{truncateAddress(entry.walletAddress)}</span>
                </div>
                <div className="col-span-2 flex items-center">
                  <span className="font-bold text-sm" style={{ color: '#00ff88' }}>{entry.totalWins}</span>
                </div>
                <div className="col-span-3 flex items-center justify-end">
                  <span className="font-bold text-sm" style={{ color: '#00ccff' }}>
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
}
