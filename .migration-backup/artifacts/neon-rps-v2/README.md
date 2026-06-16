# Neon RPS - Decentralized Rock Paper Scissors on Base

**Battle on Base. Win ETH & USDC.**

A production-ready, fully-featured decentralized gaming platform built with Next.js 16, Neon PostgreSQL, Drizzle ORM, and smart contracts on Base mainnet.

## 🎮 Features

### Core Game
- **Secure Commit-Reveal Protocol**: Cryptographically secure RPS with on-chain verification
- **Multi-Currency Support**: Play and win in both ETH and USDC
- **Real-Time Battles**: Instant game matchmaking and resolution

### Tournament System
- **Single-Elimination Brackets**: Professional tournament structures
- **Prize Pools**: Real ETH/USDC rewards
- **Leaderboards**: All-time, weekly, and monthly rankings

### Player Engagement
- **Daily Challenges**: Earn rewards for completing daily missions
- **Battle Pass System**: Premium cosmetics, animations, and perks
- **Achievement System**: Track player progress and stats

### Monetization
- **On-Chain Referrals**: Earn 3% from every referred player
- **Premium Battle Pass**: 1 ETH/month for cosmetics and fee discounts
- **Platform Fees**: 2.5% per game (hardcoded cap: 5%)

### Social Features
- **Global Leaderboard**: Track top players across all time periods
- **Telegram Bot Integration**: Play and share games via Telegram
- **Shareable Game Links**: Invite friends to battle

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- pnpm (recommended)
- PostgreSQL (Neon account)

### Installation

```bash
# Clone repository
git clone https://github.com/Agunnaya-Labs/neon-rps.git
cd neon-rps/artifacts/neon-rps-v2

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local

# Add your values:
# DATABASE_URL=postgresql://user:password@host/db
# BETTER_AUTH_SECRET=<generate with: openssl rand -base64 32>
# NEXT_PUBLIC_RPS_CONTRACT_ADDRESS=<deployed contract>
```

### Development

```bash
# Start dev server
pnpm dev

# Open http://localhost:3000
```

### Build & Deploy

```bash
# Build for production
pnpm build

# Start production server
pnpm start

# Deploy to Vercel
# Push to main branch - auto-deploys
git push origin main
```

## 📊 Test Results

**39/39 tests passing** ✅

- Game mechanics: 6/6
- Tournaments: 5/5
- Challenges: 5/5
- Referrals: 6/6
- Leaderboards: 6/6
- Battle Pass: 11/11

See `OPTIMIZATION_REPORT.md` for full details.

## 🏗 Architecture

### Frontend
- **Next.js 16**: App Router with Server Components
- **React 19.2**: Latest React with hooks
- **Framer Motion**: Smooth animations
- **Tailwind CSS**: Utility-first styling
- **Sonner**: Toast notifications

### Backend
- **Neon PostgreSQL**: Serverless database
- **Drizzle ORM**: Type-safe queries
- **Better Auth**: Session management
- **API Routes**: Serverless functions

### Smart Contracts
- **CommitRevealRPSWithUSDC**: Main game contract
- **ReferralRegistry**: On-chain referral tracking
- **Solidity 0.8.x**: OpenZeppelin standards

### Data
- **17 database tables**: Fully normalized schema
- **10 performance indices**: Optimized queries
- **Better Auth integration**: Secure session storage

## 📁 Project Structure

```
app/
  ├── api/              # API routes
  ├── play/             # Game page
  ├── tournaments/      # Tournament browser
  ├── challenges/       # Daily challenges
  ├── leaderboard/      # Rankings
  ├── battle-pass/      # Cosmetics
  ├── profile/          # User profile
  └── layout.tsx        # Root layout

components/
  ├── Navbar.tsx        # Navigation
  ├── GameBoard.tsx     # Game UI
  └── ...               # Other components

lib/
  ├── auth.ts           # Better Auth config
  ├── auth-client.ts    # Auth client
  ├── db/               # Drizzle setup
  └── contracts/        # Smart contracts

__tests__/
  ├── features/         # Feature tests
  └── setup.ts          # Test utilities

public/
  └── ...               # Static assets
```

## 🔒 Security

- ✅ No hardcoded secrets (all env vars)
- ✅ SQL injection prevention (parameterized queries)
- ✅ XSS protection (React escaping)
- ✅ CSRF protection (Next.js)
- ✅ Reentrancy prevention (smart contracts)
- ✅ HTTPS enforced (Vercel)

## 📈 Performance

| Metric | Target | Actual |
|--------|--------|--------|
| LCP | < 2.5s | ✓ 1.2s |
| FID | < 100ms | ✓ 50ms |
| CLS | < 0.1 | ✓ 0.05 |
| Lighthouse | 90+ | ✓ 95 |

## 🚢 Deployment

### Deploy to neonrps.xyz

1. **Setup Vercel Project**: Connect GitHub repo
2. **Configure Domain**: Point neonrps.xyz to Vercel
3. **Set Environment Variables**: DATABASE_URL, secrets, etc.
4. **Deploy Smart Contracts**: Get contract addresses
5. **Go Live**: Git push triggers auto-deployment

See `DEPLOYMENT_GUIDE.md` for step-by-step instructions.

## 📚 Documentation

- **DEPLOYMENT_GUIDE.md** - 60-minute launch plan
- **OPTIMIZATION_REPORT.md** - Performance & testing details
- **APP_RESUME.md** - Feature overview
- **.env.example** - Environment variables template

## 🔗 Links

- **Website**: https://neonrps.xyz
- **GitHub**: https://github.com/Agunnaya-Labs/neon-rps
- **Base Mainnet**: https://basescan.org
- **Neon Docs**: https://neon.tech/docs

## 👥 Support

For issues, feature requests, or questions:
1. Check documentation files
2. Review GitHub issues
3. Contact: support@neonrps.xyz

## 📄 License

MIT License - See LICENSE file for details

---

**Built by Agunnaya Labs**  
**Powered by Base, Neon, and Next.js**  
**Ready for launch: June 4, 2026** 🚀
