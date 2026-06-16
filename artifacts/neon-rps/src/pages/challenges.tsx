import { Link } from 'wouter'
import { Calendar, CheckCircle, Clock, Zap } from 'lucide-react'
import { useGetDailyChallenge } from '@workspace/api-client-react'
import Layout from '@/components/Layout'

export default function ChallengesPage() {
  const { data, isLoading, refetch } = useGetDailyChallenge()

  const challenge = data?.challenge ?? null
  const progress = data?.progress ?? null

  const progressPct = challenge
    ? Math.min(((progress?.progress ?? 0) / challenge.target) * 100, 100)
    : 0

  const claimReward = async () => {
    if (!challenge) return
    try {
      const base = import.meta.env.BASE_URL?.replace(/\/$/, '') ?? ''
      const res = await fetch(`${base}/api/challenges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ challengeId: challenge.id, action: 'claim' }),
      })
      if (res.ok) {
        alert(`Claimed ${challenge.rewardAmount} ETH!`)
        refetch()
      }
    } catch (error) {
      console.error('[neon-rps] Claim reward error:', error)
    }
  }

  return (
    <Layout activePath="/challenges">
      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-2">Daily Challenges</h1>
          <p style={{ color: '#888' }}>Complete today's challenge to earn ETH rewards</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20 gap-3">
            <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: '#00ff88', borderTopColor: 'transparent' }} />
            <span style={{ color: '#666' }}>Loading today's challenge...</span>
          </div>
        ) : challenge ? (
          <div className="fade-in">
            <div className="rounded-2xl p-8 border mb-4" style={{ backgroundColor: 'rgba(26,26,58,0.6)', borderColor: '#2a2a4a' }}>
              <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="px-3 py-1 rounded-full text-xs font-bold"
                      style={{ backgroundColor: 'rgba(255,0,110,0.15)', color: '#ff006e', border: '1px solid rgba(255,0,110,0.3)' }}>
                      ACTIVE TODAY
                    </div>
                  </div>
                  <h2 className="text-3xl font-black text-white leading-tight">{challenge.title}</h2>
                </div>
                <div className="shrink-0 text-right rounded-2xl p-4" style={{ backgroundColor: 'rgba(0,204,255,0.1)', border: '1px solid rgba(0,204,255,0.2)' }}>
                  <div className="text-xs font-bold tracking-widest mb-1" style={{ color: '#666' }}>REWARD</div>
                  <div className="text-2xl font-black" style={{ color: '#00ccff' }}>{challenge.rewardAmount}</div>
                  <div className="text-xs font-bold" style={{ color: '#00ccff' }}>ETH</div>
                </div>
              </div>

              <p className="text-base leading-relaxed mb-8" style={{ color: '#cccccc' }}>{challenge.description}</p>

              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold tracking-widest" style={{ color: '#888' }}>PROGRESS</span>
                  <span className="font-bold text-sm" style={{ color: '#00ff88' }}>
                    {progress?.progress ?? 0} / {challenge.target}
                  </span>
                </div>
                <div className="w-full rounded-full h-3 overflow-hidden" style={{ backgroundColor: '#0f0f23' }}>
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${progressPct}%`,
                      background: 'linear-gradient(90deg, #00ff88, #00ccff)',
                      boxShadow: progressPct > 0 ? '0 0 8px rgba(0,255,136,0.5)' : 'none',
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs" style={{ color: '#555' }}>0</span>
                  <span className="text-xs font-bold" style={{ color: progressPct >= 100 ? '#00ff88' : '#555' }}>
                    {progressPct.toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-8">
                <div className="rounded-xl p-4" style={{ backgroundColor: '#0f0f23', border: '1px solid #1e1e3a' }}>
                  <div className="text-xs mb-1" style={{ color: '#555' }}>Requirement</div>
                  <div className="font-bold capitalize" style={{ color: '#00ff88' }}>
                    {challenge.requirement.replace(/-/g, ' ')}
                  </div>
                </div>
                <div className="rounded-xl p-4" style={{ backgroundColor: '#0f0f23', border: '1px solid #1e1e3a' }}>
                  <div className="text-xs mb-1" style={{ color: '#555' }}>Status</div>
                  <div className="flex items-center gap-2 font-bold">
                    {progress?.completed ? (
                      <>
                        <CheckCircle size={16} style={{ color: '#00ff88' }} />
                        <span style={{ color: '#00ff88' }}>Completed</span>
                      </>
                    ) : (
                      <>
                        <Clock size={16} style={{ color: '#888' }} />
                        <span style={{ color: '#888' }}>In Progress</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {progress?.completed ? (
                <button
                  onClick={claimReward}
                  className="w-full py-4 rounded-xl font-bold text-lg text-[#0f0f23] shimmer-btn transition-all hover:shadow-lg hover:shadow-[#00ff88]/30 hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  <Zap size={20} fill="currentColor" />
                  Claim {challenge.rewardAmount} ETH Reward
                </button>
              ) : (
                <Link href="/play">
                  <span className="block w-full text-center py-4 rounded-xl font-bold text-lg cursor-pointer transition-all hover:-translate-y-0.5"
                    style={{ backgroundColor: 'rgba(0,255,136,0.15)', color: '#00ff88', border: '1px solid rgba(0,255,136,0.3)' }}>
                    Play to Progress
                  </span>
                </Link>
              )}
            </div>

            <div className="rounded-2xl p-5 text-sm" style={{ backgroundColor: 'rgba(0,204,255,0.05)', border: '1px solid rgba(0,204,255,0.15)' }}>
              <div className="flex items-center gap-2 mb-1" style={{ color: '#00ccff' }}>
                <Calendar size={14} />
                <span className="font-bold">Challenge resets daily</span>
              </div>
              <p style={{ color: '#666' }}>New challenges are posted every day at midnight UTC. Come back tomorrow for a fresh challenge!</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-24 fade-in">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: 'rgba(255,0,110,0.1)' }}>
              <Calendar size={40} style={{ color: '#ff006e' }} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No challenge today</h3>
            <p className="mb-8" style={{ color: '#666' }}>Check back tomorrow for a new daily challenge!</p>
            <Link href="/play">
              <span className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-bold cursor-pointer transition-all hover:-translate-y-0.5 shimmer-btn text-[#0f0f23]">
                Play Now
              </span>
            </Link>
          </div>
        )}
      </section>
    </Layout>
  )
}
