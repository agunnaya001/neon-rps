import { useState, useEffect } from 'react'

interface ReferralData {
  referralCode: string
  totalReferred: number
  totalEarned: string
  pendingRewards: string
  referredPlayers: Array<{
    id: number
    walletAddress: string
    displayName?: string
    totalGames: number
    referredAt: string
  }>
  recentRewards: Array<{
    id: number
    rewardAmount: string
    status: 'pending' | 'completed' | 'failed'
    createdAt: string
  }>
}

export default function Referrals({ walletAddress }: { walletAddress?: string }) {
  const [referralData, setReferralData] = useState<ReferralData | null>(null)
  const [loading, setLoading] = useState(!!walletAddress)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (walletAddress) {
      fetchReferralData()
    }
  }, [walletAddress])

  async function fetchReferralData() {
    if (!walletAddress) return

    try {
      setLoading(true)
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001'
      const response = await fetch(`${apiUrl}/api/referrals?wallet=${walletAddress}`)
      const { data } = await response.json()
      setReferralData(data)
    } catch (error) {
      console.error('Failed to fetch referral data:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyReferralCode = () => {
    if (referralData?.referralCode) {
      navigator.clipboard.writeText(referralData.referralCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const getReferralLink = () => {
    if (!referralData?.referralCode) return ''
    return `${window.location.origin}?ref=${referralData.referralCode}`
  }

  if (!walletAddress) {
    return (
      <div className="text-center py-8 text-gray-600">
        Connect your wallet to view referral rewards
      </div>
    )
  }

  if (loading) {
    return <div className="text-center py-8">Loading referral data...</div>
  }

  if (!referralData) {
    return <div className="text-center py-8 text-red-600">Failed to load referral data</div>
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Referral Rewards</h1>

      {/* Referral Code Section */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 mb-6">
        <h2 className="text-xl font-bold mb-3">Your Referral Code</h2>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={referralData.referralCode}
            readOnly
            className="flex-1 px-4 py-2 border border-gray-300 rounded bg-white font-mono"
          />
          <button
            onClick={copyReferralCode}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 font-medium"
          >
            {copied ? '✓ Copied' : 'Copy'}
          </button>
        </div>
        <div className="mb-3 text-sm text-gray-600">
          <p className="font-medium mb-1">Share this link:</p>
          <code className="bg-white px-2 py-1 rounded border border-gray-200 text-xs break-all">
            {getReferralLink()}
          </code>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border rounded-lg p-4">
          <p className="text-gray-600 text-sm mb-1">Players Referred</p>
          <p className="text-3xl font-bold">{referralData.totalReferred}</p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-gray-600 text-sm mb-1">Total Earned</p>
          <p className="text-3xl font-bold">
            Ⓔ {(Number(referralData.totalEarned) / 1e18).toFixed(3)}
          </p>
        </div>
        <div className="bg-white border rounded-lg p-4">
          <p className="text-gray-600 text-sm mb-1">Pending Rewards</p>
          <p className="text-3xl font-bold text-yellow-600">
            Ⓔ {(Number(referralData.pendingRewards) / 1e18).toFixed(3)}
          </p>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="font-bold mb-2">How Referrals Work</h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>✓ Share your referral code with friends</li>
          <li>✓ They use it to join and play</li>
          <li>✓ You earn <strong>1% of their winnings</strong></li>
          <li>✓ Rewards are calculated on-chain and settled weekly</li>
        </ul>
      </div>

      {/* Referred Players */}
      {referralData.totalReferred > 0 && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Your Referrals ({referralData.totalReferred})</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left px-4 py-2">Player</th>
                  <th className="text-center px-4 py-2">Games Played</th>
                  <th className="text-left px-4 py-2">Referred Date</th>
                </tr>
              </thead>
              <tbody>
                {referralData.referredPlayers.map((player) => (
                  <tr key={player.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2">
                      <div className="font-medium truncate">
                        {player.displayName || player.walletAddress.slice(0, 10)}...
                      </div>
                    </td>
                    <td className="text-center px-4 py-2">{player.totalGames}</td>
                    <td className="px-4 py-2 text-gray-600">
                      {new Date(player.referredAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Rewards */}
      {referralData.recentRewards.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-4">Recent Rewards</h2>
          <div className="space-y-2">
            {referralData.recentRewards.slice(0, 5).map((reward) => (
              <div key={reward.id} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                <div>
                  <p className="font-medium">
                    Ⓔ {(Number(reward.rewardAmount) / 1e18).toFixed(6)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(reward.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-2 py-1 rounded text-xs font-semibold ${
                    reward.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : reward.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                  }`}
                >
                  {reward.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
