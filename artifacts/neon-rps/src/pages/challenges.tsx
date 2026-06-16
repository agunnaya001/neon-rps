import { Link } from 'wouter'
import { useGetDailyChallenge } from '@workspace/api-client-react'

export default function ChallengesPage() {
  const { data, isLoading } = useGetDailyChallenge()

  const challenge = data?.challenge ?? null
  const progress = data?.progress ?? null

  const claimReward = async () => {
    if (!challenge) return
    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId: challenge.id, action: 'claim' }),
      })
      if (res.ok) {
        alert(`Claimed ${challenge.rewardAmount} ETH!`)
      }
    } catch (error) {
      console.error('[neon-rps] Claim reward error:', error)
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a3a] to-[#0f0f23]">
      <nav className="border-b border-[#333333] bg-[#0f0f23]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#00ff88]">NEON RPS</Link>
          <div className="flex gap-6">
            <Link href="/tournaments" className="text-white hover:text-[#00ff88] transition">Tournaments</Link>
            <Link href="/challenges" className="text-[#00ff88]">Challenges</Link>
            <Link href="/leaderboard" className="text-white hover:text-[#00ff88] transition">Leaderboard</Link>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white mb-8">📅 Daily Challenges</h1>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-[#666666]">Loading today's challenge...</p>
          </div>
        ) : challenge ? (
          <div className="max-w-2xl mx-auto">
            <div className="bg-[#1a1a3a] border border-[#333333] rounded-lg p-8">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-3xl font-bold text-[#00ff88]">{challenge.title}</h2>
                  <div className="text-right">
                    <div className="text-[#666666] text-sm">REWARD</div>
                    <div className="text-2xl font-bold text-[#00ccff]">{challenge.rewardAmount} ETH</div>
                  </div>
                </div>
              </div>

              <p className="text-white text-lg mb-6">{challenge.description}</p>

              <div className="bg-[#0f0f23] border border-[#333333] rounded p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[#666666] font-bold">Progress</span>
                  <span className="text-[#00ff88] font-bold">
                    {progress?.progress ?? 0} / {challenge.target}
                  </span>
                </div>
                <div className="w-full bg-[#1a1a3a] rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#00ff88] to-[#00ccff] h-full transition-all duration-500"
                    style={{ width: `${Math.min(((progress?.progress ?? 0) / challenge.target) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-[#0f0f23] border border-[#333333] rounded p-4">
                  <div className="text-[#666666] text-sm">Requirement</div>
                  <div className="text-[#00ff88] font-bold capitalize">{challenge.requirement.replace('-', ' ')}</div>
                </div>
                <div className="bg-[#0f0f23] border border-[#333333] rounded p-4">
                  <div className="text-[#666666] text-sm">Status</div>
                  <div className={`font-bold ${progress?.completed ? 'text-[#00ff88]' : 'text-[#666666]'}`}>
                    {progress?.completed ? '✅ Completed' : '⏳ In Progress'}
                  </div>
                </div>
              </div>

              {progress?.completed ? (
                <button
                  onClick={claimReward}
                  className="w-full px-6 py-3 bg-gradient-to-r from-[#00ff88] to-[#00ccff] text-[#0f0f23] font-bold text-lg rounded hover:shadow-lg hover:shadow-[#00ff88]/50 transition"
                >
                  Claim Reward
                </button>
              ) : (
                <Link href="/play">
                  <span className="block w-full text-center px-6 py-3 bg-[#00ff88] text-[#0f0f23] font-bold text-lg rounded hover:bg-[#00ccff] transition cursor-pointer">
                    Play to Progress
                  </span>
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto text-center py-12">
            <p className="text-[#666666] mb-4">No challenge for today. Check back tomorrow!</p>
            <Link href="/play">
              <span className="inline-block px-6 py-2 bg-[#00ff88] text-[#0f0f23] font-bold rounded hover:bg-[#00ccff] transition cursor-pointer">
                Play Now
              </span>
            </Link>
          </div>
        )}
      </section>
    </main>
  )
}
