import { Check, X, Gem, Sparkles, Crown, Shield } from 'lucide-react'
import Layout from '@/components/Layout'

const TIERS = [
  {
    id: 'free',
    label: 'Free',
    price: '$0',
    period: null,
    color: '#888888',
    border: '#2a2a4a',
    icon: Shield,
    features: [
      { text: 'Daily challenges', included: true },
      { text: 'Leaderboards', included: true },
      { text: 'Standard cosmetics', included: true },
      { text: 'Premium cosmetics', included: false },
      { text: 'Custom animations', included: false },
    ],
    cta: 'Current Plan',
    ctaDisabled: true,
  },
  {
    id: 'premium',
    label: 'Premium',
    price: '$9.99',
    period: '/month',
    sub: 'or 1 ETH one-time',
    color: '#00ff88',
    border: '#00ff88',
    popular: true,
    icon: Gem,
    features: [
      { text: 'All free features', included: true },
      { text: 'Exclusive cosmetics', included: true },
      { text: 'Custom move animations', included: true },
      { text: '0.5% fee discount', included: true },
      { text: 'Early tournament access', included: true },
    ],
    cta: 'Upgrade Now',
    ctaDisabled: false,
  },
  {
    id: 'vip',
    label: 'VIP',
    price: '$29.99',
    period: '/month',
    sub: 'or 3 ETH one-time',
    color: '#ff006e',
    border: '#ff006e',
    icon: Crown,
    features: [
      { text: 'All premium features', included: true },
      { text: 'VIP cosmetics & NFT', included: true },
      { text: '1% fee discount', included: true },
      { text: 'Private tournaments', included: true },
      { text: 'Weekly bonus challenges', included: true },
    ],
    cta: 'Go VIP',
    ctaDisabled: false,
  },
]

const COSMETICS = [
  { name: 'Neon Rock', type: 'Move Animation', level: 1, rarity: 'Common', color: '#00ff88' },
  { name: 'Matrix Paper', type: 'Move Animation', level: 5, rarity: 'Rare', color: '#00ccff' },
  { name: 'Quantum Scissors', type: 'Move Animation', level: 10, rarity: 'Epic', color: '#a855f7' },
  { name: 'Golden Trophy', type: 'Avatar Frame', level: 1, rarity: 'Legendary', color: '#FFD700' },
  { name: 'Cyber Gloves', type: 'Hand Skin', level: 3, rarity: 'Rare', color: '#00ccff' },
  { name: 'Neon Aura', type: 'Effect', level: 8, rarity: 'Epic', color: '#a855f7' },
  { name: 'Diamond Hands', type: 'Hand Skin', level: 15, rarity: 'Legendary', color: '#FFD700' },
  { name: 'Plasma Trail', type: 'Effect', level: 20, rarity: 'Legendary', color: '#ff006e' },
]

const RARITY_COLORS: Record<string, string> = {
  Common: '#888',
  Rare: '#00ccff',
  Epic: '#a855f7',
  Legendary: '#FFD700',
}

export default function BattlePassPage() {
  return (
    <Layout activePath="/battle-pass">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-16 fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold mb-4 border"
            style={{ borderColor: '#2a2a4a', backgroundColor: 'rgba(168,85,247,0.08)', color: '#a855f7' }}>
            <Sparkles size={12} />
            Season 1 Battle Pass
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">Premium Battle Pass</h1>
          <p className="text-lg max-w-xl mx-auto" style={{ color: '#888' }}>
            Unlock exclusive cosmetics, animations, and perks. Level up your on-chain game.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-20">
          {TIERS.map(tier => {
            const Icon = tier.icon
            return (
              <div
                key={tier.id}
                className="relative rounded-2xl p-7 flex flex-col transition-all duration-300 hover:-translate-y-1"
                style={{
                  backgroundColor: tier.popular ? `${tier.color}08` : 'rgba(26,26,58,0.6)',
                  border: `${tier.popular ? '2px' : '1px'} solid ${tier.popular ? tier.border : '#2a2a4a'}`,
                  boxShadow: tier.popular ? `0 0 30px ${tier.color}15` : 'none',
                }}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full text-xs font-black"
                    style={{ backgroundColor: tier.color, color: '#0f0f23' }}>
                    MOST POPULAR
                  </div>
                )}

                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: `${tier.color}15` }}>
                    <Icon size={22} style={{ color: tier.color }} />
                  </div>
                  <h3 className="text-xl font-black" style={{ color: tier.color }}>{tier.label}</h3>
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-black text-white">{tier.price}</span>
                    {tier.period && <span className="text-sm" style={{ color: '#666' }}>{tier.period}</span>}
                  </div>
                  {tier.sub && <div className="text-sm" style={{ color: '#555' }}>{tier.sub}</div>}
                </div>

                <ul className="space-y-3 flex-1 mb-7">
                  {tier.features.map(({ text, included }) => (
                    <li key={text} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                        style={{ backgroundColor: included ? `${tier.color}15` : 'rgba(100,100,100,0.1)' }}>
                        {included
                          ? <Check size={12} style={{ color: tier.color }} />
                          : <X size={12} style={{ color: '#555' }} />
                        }
                      </div>
                      <span className="text-sm" style={{ color: included ? '#cccccc' : '#555' }}>{text}</span>
                    </li>
                  ))}
                </ul>

                <button
                  disabled={tier.ctaDisabled}
                  className="w-full py-3.5 rounded-xl font-bold text-sm transition-all hover:-translate-y-0.5 disabled:cursor-default disabled:opacity-60"
                  style={!tier.ctaDisabled
                    ? { backgroundColor: tier.color, color: tier.color === '#ff006e' ? '#fff' : '#0f0f23' }
                    : { backgroundColor: 'rgba(100,100,100,0.15)', color: '#666', border: '1px solid #333' }
                  }
                >
                  {tier.cta}
                </button>
              </div>
            )
          })}
        </div>

        <div>
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-2xl font-black text-white">Available Cosmetics</h2>
            <span className="px-3 py-1 rounded-full text-xs font-bold" style={{ backgroundColor: 'rgba(168,85,247,0.15)', color: '#a855f7', border: '1px solid rgba(168,85,247,0.3)' }}>
              {COSMETICS.length} Items
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {COSMETICS.map(cosmetic => (
              <div
                key={cosmetic.name}
                className="rounded-2xl p-5 border transition-all duration-300 hover:-translate-y-1"
                style={{ backgroundColor: 'rgba(26,26,58,0.6)', borderColor: '#2a2a4a' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = RARITY_COLORS[cosmetic.rarity])}
                onMouseLeave={e => (e.currentTarget.style.borderColor = '#2a2a4a')}
              >
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: `${RARITY_COLORS[cosmetic.rarity]}15` }}>
                  <Sparkles size={26} style={{ color: RARITY_COLORS[cosmetic.rarity] }} />
                </div>
                <div className="text-center">
                  <div className="font-bold text-white text-sm mb-1">{cosmetic.name}</div>
                  <div className="text-xs mb-2" style={{ color: '#666' }}>{cosmetic.type}</div>
                  <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-bold"
                    style={{ backgroundColor: `${RARITY_COLORS[cosmetic.rarity]}12`, color: RARITY_COLORS[cosmetic.rarity] }}>
                    {cosmetic.rarity}
                  </div>
                  <div className="text-xs mt-2" style={{ color: '#555' }}>Level {cosmetic.level}+</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  )
}
