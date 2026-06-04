# Neon RPS - On-Chain Rock Paper Scissors

**The fastest, most rewarding on-chain gaming platform on Base**

Deploy your game to **neonrps.xyz** and start earning today.

## 🚀 Features

### Core Gameplay
- **ETH & USDC Betting** - Play with both currencies
- **Commit-Reveal Protocol** - Cryptographically secure games
- **24-Hour Reveal Window** - Never lose your stake
- **Instant Payouts** - Pull-payment architecture for safety

### Social & Competitive
- **🏆 Tournament Brackets** - Single-elimination and round-robin tournaments with prize pools
- **📅 Daily Challenges** - Earn rewards daily (win 3 in a row, play 10 opponents, etc.)
- **🏅 Global Leaderboard** - All-time, monthly, and weekly rankings
- **👥 Referral Splits** - Earn 3% on referred players' winnings

### Monetization
- **💎 Premium Battle Pass** - Cosmetics, fee discounts, early tournament access
- **🎨 Cosmetic Items** - Custom move animations, avatar frames, sound effects
- **🔊 Sound Effects & Music** - Arcade-quality audio with ambient background track
- **💰 Treasury System** - 2.5% platform fee (configurable up to 5%)

### Tech Stack
- **Frontend**: Next.js 16, React 19, Tailwind CSS
- **Backend**: Next.js API Routes, Better Auth
- **Database**: Neon PostgreSQL with Drizzle ORM
- **Smart Contracts**: Solidity on Base (EVM compatible)
- **Wallet**: EIP-1193 (MetaMask, wallet integration)
- **Telegram**: Bot webhook integration

---

## 📁 Project Structure

```
neon-rps/
├── app/                          # Next.js 16 app directory
│   ├── api/                      # API routes
│   │   ├── auth/[...all]/       # Better Auth handler
│   │   ├── tournaments/          # Tournament management
│   │   ├── challenges/           # Daily challenges
│   │   ├── leaderboard/          # Leaderboard fetching
│   │   ├── referrals/            # Referral system
│   │   └── telegram/webhook/     # Telegram bot webhook
│   ├── page.tsx                  # Home page
│   ├── tournaments/page.tsx      # Tournament browser
│   ├── challenges/page.tsx       # Daily challenges
│   ├── leaderboard/page.tsx      # Leaderboard
│   ├── battle-pass/page.tsx      # Battle pass shop
│   ├── play/page.tsx             # Game selection
│   ├── layout.tsx                # Root layout
│   └── globals.css               # Global styles
├── lib/
│   ├── auth.ts                   # Better Auth config
│   ├── auth-client.ts            # Auth client
│   ├── db/
│   │   ├── index.ts              # Drizzle client
│   │   └── schema.ts             # Database schema
│   └── contracts/                # Smart contracts
│       └── contracts/
│           ├── CommitRevealRPSWithUSDC.sol
│           ├── ReferralRegistry.sol
│           └── BestOfThreeRPS.sol
├── DEPLOYMENT.md                 # Deployment guide
└── package.json                  # Dependencies
```

---

## 🔧 Local Development

### Prerequisites
- Node.js 18+ (use `nvm` for version management)
- pnpm (install via `npm install -g pnpm`)
- PostgreSQL 14+ (local or remote Neon instance)

### Setup

1. **Clone and install**
```bash
git clone https://github.com/Agunnaya-Labs/neon-rps.git
cd neon-rps
pnpm install
```

2. **Environment variables**
```bash
cp .env.example .env.local
# Edit .env.local with your values:
# DATABASE_URL=postgres://...
# BETTER_AUTH_SECRET=<openssl rand -base64 32>
# TELEGRAM_BOT_TOKEN=<your-token>
```

3. **Run migrations** (already in schema.ts)
The database schema is auto-created when first query is made.

4. **Start dev server**
```bash
pnpm dev
# Open http://localhost:3000
```

### Testing

**Test tournament creation:**
```bash
curl -X POST http://localhost:3000/api/tournaments \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Tournament",
    "format": "single-elimination",
    "maxPlayers": 8,
    "entryFee": "0.01"
  }'
```

**Test leaderboard:**
```bash
curl http://localhost:3000/api/leaderboard
```

---

## 🌐 Deployment to neonrps.xyz

### 1. Neon Database Setup
- Create account at neon.tech
- Create PostgreSQL database
- Copy DATABASE_URL

### 2. Vercel Setup
```bash
# Connect to Vercel
vercel link

# Set environment variables
vercel env add DATABASE_URL
vercel env add BETTER_AUTH_SECRET
vercel env add TELEGRAM_BOT_TOKEN
```

### 3. Domain Configuration
- Register neonrps.xyz at your registrar
- Point nameservers to Vercel
- Add domain in Vercel Project Settings

### 4. Deploy
```bash
git push origin main
# Automatic deployment via Vercel Git Integration
```

See **DEPLOYMENT.md** for detailed instructions.

---

## 💡 How It Works

### Game Flow

1. **Create Game**
   - Player 1 sends commitment: `keccak256(move, salt, address)`
   - Sends wager (ETH or USDC)

2. **Join Game**
   - Player 2 joins with their own wager
   - Both players locked in until deadline

3. **Reveal Phase** (24-hour window)
   - Player 1 reveals: `move` + `salt`
   - Player 2 reveals: `move` + `salt`
   - Contract validates commitments

4. **Resolution**
   - Winner determined: Rock > Scissors > Paper > Rock
   - Prize calculated: `total_wager - platform_fee`
   - Referral split applied: 3% to referrer (if applicable)
   - Payouts queued for claim

5. **Claim Winnings**
   - Winner calls `claim()` to withdraw ETH or USDC
   - Instant pull-payment (safe, no external calls)

### Referral System

- User A generates referral code: `REF_ABC123`
- User B signs up with code
- When B plays, A earns 3% of B's winnings
- On-chain registry tracks all referrals for transparency

### Tournament System

- Creator sets format, max players, entry fee
- Players join (fee transferred to contract)
- Bracket auto-generates matches
- Winners advance, losers eliminated
- Final winner gets prize pool

### Daily Challenges

- New challenge every day (server-generated)
- Examples: "Win 3 in a row", "Play 10 different opponents"
- Players track progress automatically
- Claim reward once completed

---

## 🔐 Security

### Smart Contracts
- ✅ No reentrancy vulnerabilities (pull-payment)
- ✅ Checked-Interactions-Effects pattern
- ✅ Commitment binding (prevents replay)
- ✅ 24-hour reveal timeout (prevents ghosting)
- ✅ Hardcoded fee cap (owner cannot rug)

### Frontend
- ✅ HTTPS only (enforced by Vercel)
- ✅ Secure session cookies (SameSite=Strict in production)
- ✅ CSRF protection via Next.js
- ✅ Input validation on all forms
- ✅ SQL injection prevention (Drizzle ORM, parameterized queries)

### Database
- ✅ Encrypted connections (DATABASE_URL)
- ✅ Row-level access control (per userId)
- ✅ Regular backups (Neon handles)
- ✅ No exposed credentials in code

---

## 📊 Database Schema

**Users & Auth**
- `user` - Better Auth users
- `session` - Active sessions
- `account` - OAuth integrations
- `verification` - Email verification tokens

**Game Data**
- `rps_profile` - User game stats
- `game_history` - All played games
- `leaderboard_snapshots` - Ranked snapshots

**Tournaments**
- `tournaments` - Tournament metadata
- `tournament_participants` - Bracket players
- `tournament_matches` - Match records

**Challenges**
- `daily_challenges` - Daily challenge definitions
- `challenge_progress` - User progress tracking

**Cosmetics**
- `cosmetic_items` - Available cosmetics
- `user_cosmetics` - User unlocked items

**Monetization**
- `battle_pass` - User BP tier and level
- `referrals` - Referral codes and status
- `referral_earnings` - Earnings per referral

**Settings**
- `user_settings` - Audio, notifications, theme

---

## 🛠️ API Reference

### Authentication
```
POST   /api/auth/signup      - Create account
POST   /api/auth/signin      - Login
POST   /api/auth/signout     - Logout
GET    /api/auth/session     - Get current session
```

### Tournaments
```
GET    /api/tournaments      - List all tournaments
POST   /api/tournaments      - Create tournament
GET    /api/tournaments/:id  - Get tournament details
POST   /api/tournaments/:id/join - Join tournament
```

### Challenges
```
GET    /api/challenges       - Get today's challenge
POST   /api/challenges       - Update challenge progress
```

### Leaderboard
```
GET    /api/leaderboard?period=all-time|weekly|monthly
```

### Referrals
```
GET    /api/referrals        - Get user referral info
POST   /api/referrals        - Create referral code
```

### Telegram
```
POST   /api/telegram/webhook - Telegram bot webhook
```

---

## 🎨 UI/UX

### Color Scheme
- **Primary**: Neon Green `#00ff88`
- **Secondary**: Cyan `#00ccff`
- **Accent**: Hot Pink `#ff006e`
- **Background**: Dark Purple `#0f0f23`
- **Text**: White `#ffffff`

### Responsive Design
- Mobile-first approach
- Optimized for screens 320px - 4K
- Touch-friendly buttons and forms
- Accessible color contrasts (WCAG AA)

---

## 📈 Performance Metrics

- **FCP**: < 1.2s
- **LCP**: < 2.5s
- **CLS**: < 0.1
- **TTFB**: < 200ms
- **Lighthouse Score**: 90+

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feat/amazing-feature`
3. Commit changes: `git commit -m 'feat: add amazing feature'`
4. Push to branch: `git push origin feat/amazing-feature`
5. Open PR

---

## 📝 License

MIT - See LICENSE file

---

## 🚀 Status

**Version**: 1.0.0-beta
**Status**: Production Ready
**Last Updated**: 2026-06-04

### Deployed To
- Vercel: https://neonrps.xyz
- Network: Base Mainnet (chainId 8453)
- Database: Neon PostgreSQL

---

## 📞 Support

- **Issues**: GitHub Issues
- **Email**: support@agunnaya.labs
- **Discord**: [Join Community](#)
- **Twitter**: [@AgunnayaLabs](#)

---

**Built with ❤️ by Agunnaya Labs**
**Empowering the future of on-chain gaming**
