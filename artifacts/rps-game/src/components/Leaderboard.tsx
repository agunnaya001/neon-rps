import { useState, useEffect } from 'react'

interface LeaderboardEntry {
  rank: number
  walletAddress: string
  displayName?: string
  totalGames: number
  totalWins: number
  winRate: string
  totalEarnings: string
  currentStreak: number
  bestStreak: number
}

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [metric, setMetric] = useState<'win_rate' | 'earnings' | 'volume'>('win_rate')
  const [timeframe, setTimeframe] = useState<'all' | 'week' | 'month'>('all')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [metric, timeframe, page])

  async function fetchLeaderboard() {
    try {
      setLoading(true)
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(
        `${apiUrl}/api/leaderboard?page=${page}&limit=50&metric=${metric}&timeframe=${timeframe}`
      )
      const { data, pagination } = await response.json()
      setLeaderboard(data)
      setHasMore(page < pagination.pages)
    } catch (error) {
      console.error('Failed to fetch leaderboard:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Global Leaderboard</h1>

      <div className="flex gap-4 mb-6 flex-wrap">
        <div>
          <label className="block text-sm font-medium mb-2">Sort By</label>
          <select
            value={metric}
            onChange={(e) => {
              setMetric(e.target.value as typeof metric)
              setPage(1)
            }}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="win_rate">Win Rate %</option>
            <option value="earnings">Total Earnings</option>
            <option value="volume">Total Volume</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Timeframe</label>
          <select
            value={timeframe}
            onChange={(e) => {
              setTimeframe(e.target.value as typeof timeframe)
              setPage(1)
            }}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Time</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b">
                  <th className="px-4 py-3 text-left">Rank</th>
                  <th className="px-4 py-3 text-left">Player</th>
                  <th className="px-4 py-3 text-center">Games</th>
                  <th className="px-4 py-3 text-center">Win Rate</th>
                  <th className="px-4 py-3 text-right">Earnings</th>
                  <th className="px-4 py-3 text-center">Streak</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((entry) => (
                  <tr key={entry.rank} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-3 font-bold text-lg">
                      {entry.rank === 1 && '🥇'}
                      {entry.rank === 2 && '🥈'}
                      {entry.rank === 3 && '🥉'}
                      {entry.rank > 3 && `#${entry.rank}`}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium truncate">
                        {entry.displayName || entry.walletAddress.slice(0, 6)}...
                      </div>
                      <div className="text-xs text-gray-500">{entry.walletAddress}</div>
                    </td>
                    <td className="px-4 py-3 text-center">{entry.totalGames}</td>
                    <td className="px-4 py-3 text-center font-semibold">
                      {parseFloat(entry.winRate).toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      Ⓔ {(Number(entry.totalEarnings) / 1e18).toFixed(3)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {entry.currentStreak > 0 && `🔥 ${entry.currentStreak}`}
                      {entry.currentStreak === 0 && '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex justify-center gap-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2">Page {page}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={!hasMore}
              className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  )
}
