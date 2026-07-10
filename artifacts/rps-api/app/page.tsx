export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-4">RPS Game API</h1>
        <p className="text-gray-300 mb-8">
          Backend API for on-chain Rock-Paper-Scissors gaming with leaderboards,
          achievements, tournaments, and referral rewards.
        </p>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">API Endpoints</h2>
          <div className="bg-gray-800 rounded-lg p-6 space-y-4">
            <div>
              <h3 className="font-semibold text-lg mb-2">Leaderboards</h3>
              <code className="bg-black px-3 py-1 rounded text-sm">
                GET /api/leaderboard?page=1&limit=50&timeframe=all&metric=win_rate
              </code>
              <p className="text-gray-400 text-sm mt-2">
                Get global leaderboards sorted by win rate, earnings, or volume.
                Timeframe options: all, week, month
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Achievements</h3>
              <code className="bg-black px-3 py-1 rounded text-sm">
                GET /api/achievements?wallet=0x...
              </code>
              <p className="text-gray-400 text-sm mt-2">
                Get all achievements and unlock status for a player
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Referrals</h3>
              <code className="bg-black px-3 py-1 rounded text-sm">
                GET /api/referrals?wallet=0x...
              </code>
              <p className="text-gray-400 text-sm mt-2">
                Get referral code, earned rewards, and referred players
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Games</h3>
              <code className="bg-black px-3 py-1 rounded text-sm">
                GET /api/games?wallet=0x...&page=1&limit=20
              </code>
              <p className="text-gray-400 text-sm mt-2">
                Get game history for a player
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-lg mb-2">Tournaments</h3>
              <code className="bg-black px-3 py-1 rounded text-sm">
                GET /api/tournaments?status=registration&page=1&limit=20
              </code>
              <p className="text-gray-400 text-sm mt-2">
                Get active tournaments with participant counts
              </p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-4">Status</h2>
          <div className="bg-green-900 text-green-100 px-4 py-3 rounded-lg">
            ✓ API is operational and ready for integration
          </div>
        </section>
      </div>
    </main>
  )
}
