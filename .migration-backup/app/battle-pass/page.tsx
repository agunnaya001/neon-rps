'use client'

import Link from 'next/link'

export default function BattlePassPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a3a] to-[#0f0f23]">
      {/* Navigation */}
      <nav className="border-b border-[#333333] bg-[#0f0f23]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-[#00ff88]">
            NEON RPS
          </Link>
          <div className="flex gap-6">
            <Link href="/tournaments" className="text-[#ffffff]">Tournaments</Link>
            <Link href="/challenges" className="text-[#ffffff]">Challenges</Link>
            <Link href="/leaderboard" className="text-[#ffffff]">Leaderboard</Link>
          </div>
        </div>
      </nav>

      <section className="max-w-7xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white mb-8">💎 Premium Battle Pass</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Free Tier */}
          <div className="bg-[#1a1a3a] border border-[#333333] rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Free Tier</h3>
            <div className="text-3xl font-bold text-[#00ff88] mb-6">$0</div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-[#ffffff]">
                <span className="text-[#00ff88] mr-2">✓</span> Daily challenges
              </li>
              <li className="flex items-center text-[#ffffff]">
                <span className="text-[#00ff88] mr-2">✓</span> Leaderboards
              </li>
              <li className="flex items-center text-[#ffffff]">
                <span className="text-[#00ff88] mr-2">✓</span> Standard cosmetics
              </li>
              <li className="flex items-center text-[#666666]">
                <span className="text-[#666666] mr-2">✗</span> Premium cosmetics
              </li>
            </ul>
            <button className="w-full px-4 py-2 bg-[#333333] text-[#ffffff] font-bold rounded cursor-default">
              Current Plan
            </button>
          </div>

          {/* Premium Tier */}
          <div className="bg-[#1a1a3a] border-2 border-[#00ff88] rounded-lg p-6 relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-[#00ff88] text-[#0f0f23] px-4 py-1 rounded-full font-bold text-sm">
              POPULAR
            </div>
            <h3 className="text-xl font-bold text-[#00ff88] mb-4">Premium</h3>
            <div className="text-3xl font-bold text-[#00ff88] mb-2">$9.99<span className="text-sm text-[#666666]">/month</span></div>
            <div className="text-[#666666] text-sm mb-6">or 1 ETH one-time</div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-[#ffffff]">
                <span className="text-[#00ff88] mr-2">✓</span> All free features
              </li>
              <li className="flex items-center text-[#ffffff]">
                <span className="text-[#00ff88] mr-2">✓</span> Exclusive cosmetics
              </li>
              <li className="flex items-center text-[#ffffff]">
                <span className="text-[#00ff88] mr-2">✓</span> Custom move animations
              </li>
              <li className="flex items-center text-[#ffffff]">
                <span className="text-[#00ff88] mr-2">✓</span> 0.5% fee discount
              </li>
              <li className="flex items-center text-[#ffffff]">
                <span className="text-[#00ff88] mr-2">✓</span> Early access to tournaments
              </li>
            </ul>
            <button className="w-full px-4 py-2 bg-[#00ff88] text-[#0f0f23] font-bold rounded hover:bg-[#00ccff] transition">
              Upgrade Now
            </button>
          </div>

          {/* VIP Tier */}
          <div className="bg-[#1a1a3a] border border-[#ff006e] rounded-lg p-6">
            <h3 className="text-xl font-bold text-[#ff006e] mb-4">VIP</h3>
            <div className="text-3xl font-bold text-[#ff006e] mb-2">$29.99<span className="text-sm text-[#666666]">/month</span></div>
            <div className="text-[#666666] text-sm mb-6">or 3 ETH one-time</div>
            <ul className="space-y-3 mb-8">
              <li className="flex items-center text-[#ffffff]">
                <span className="text-[#ff006e] mr-2">✓</span> All premium features
              </li>
              <li className="flex items-center text-[#ffffff]">
                <span className="text-[#ff006e] mr-2">✓</span> VIP cosmetics & NFT
              </li>
              <li className="flex items-center text-[#ffffff]">
                <span className="text-[#ff006e] mr-2">✓</span> 1% fee discount
              </li>
              <li className="flex items-center text-[#ffffff]">
                <span className="text-[#ff006e] mr-2">✓</span> Private tournaments
              </li>
              <li className="flex items-center text-[#ffffff]">
                <span className="text-[#ff006e] mr-2">✓</span> Weekly challenges
              </li>
            </ul>
            <button className="w-full px-4 py-2 bg-[#ff006e] text-white font-bold rounded hover:bg-[#ff3385] transition">
              Go VIP
            </button>
          </div>
        </div>

        {/* Cosmetics Showcase */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">🎨 Available Cosmetics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: 'Neon Rock', type: 'Animation', level: 1 },
              { name: 'Matrix Paper', type: 'Animation', level: 5 },
              { name: 'Quantum Scissors', type: 'Animation', level: 10 },
              { name: 'Golden Trophy', type: 'Avatar Frame', level: 1 },
            ].map((cosmetic, idx) => (
              <div key={idx} className="bg-[#1a1a3a] border border-[#333333] rounded p-4">
                <div className="text-center mb-4">
                  <div className="text-4xl mb-2">✨</div>
                  <h4 className="font-bold text-[#00ff88]">{cosmetic.name}</h4>
                  <p className="text-[#666666] text-sm">{cosmetic.type}</p>
                </div>
                <div className="text-center text-[#666666] text-sm">
                  Unlocks at Level {cosmetic.level}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
