# Neon RPS - Deployment Guide

## Pre-Deployment Checklist

### Environment Variables
Set these in your Vercel project settings:

```bash
# Database
DATABASE_URL=postgres://... # From Neon integration

# Authentication
BETTER_AUTH_SECRET=<generate with: openssl rand -base64 32>
BETTER_AUTH_URL=https://neonrps.xyz # Or your domain

# Telegram Bot (optional)
TELEGRAM_BOT_TOKEN=your_telegram_bot_token

# Next.js
NEXT_PUBLIC_API_URL=https://neonrps.xyz
NODE_ENV=production
```

### Smart Contracts - Deploy to Base Mainnet

**CommitRevealRPSWithUSDC.sol**
```bash
cd lib/contracts
npx hardhat run scripts/deploy.ts --network base
# Copy contract address to frontend env vars
```

**Set env variables after deployment:**
```
NEXT_PUBLIC_RPS_CONTRACT_ADDRESS=0x...
NEXT_PUBLIC_USDC_ADDRESS=0xd9aAEc9bA6250582301e504891D75BE128c9DBbF  # Base USDC
```

### Domain Setup - neonrps.xyz

1. **Register Domain**: Use Namecheap, Vercel Domains, or your registrar
2. **DNS Configuration**: Point to Vercel nameservers
3. **Vercel Setup**:
   - Go to Project Settings → Domains
   - Add `neonrps.xyz` and `www.neonrps.xyz`
   - Wait for DNS propagation (~5 minutes)

## Deployment Steps

### 1. Push to GitHub
```bash
git add .
git commit -m "feat: complete neon rps with tournaments, challenges, referrals, and battle pass"
git push origin main
```

### 2. Connect to Vercel
```bash
# If not already connected
vercel link

# Verify environment variables are set in Vercel dashboard
```

### 3. Deploy
```bash
# Automatic deploy on push to main, OR manual:
vercel deploy --prod
```

### 4. Post-Deployment Verification

#### Test Database Connection
```bash
curl -X GET https://neonrps.xyz/api/leaderboard
# Should return leaderboard data (empty array if no users yet)
```

#### Test Auth
```bash
# Verify auth routes are working
curl -X POST https://neonrps.xyz/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'
```

#### Test Tournament API
```bash
curl -X GET https://neonrps.xyz/api/tournaments
# Should return empty array or existing tournaments
```

#### Test Telegram Bot Webhook (if configured)
```bash
curl -X POST https://neonrps.xyz/api/telegram/webhook \
  -H "Content-Type: application/json" \
  -d '{"update_id":123,"message":{"chat":{"id":456},"text":"/start"}}'
```

## Features Deployed

✅ **Authentication**
- Email/password signup and login via Better Auth
- Session management with secure cookies

✅ **Tournaments**
- Create tournaments with custom entry fees
- Join tournaments with bracket support
- Single elimination and round-robin formats

✅ **Daily Challenges**
- Automatic daily challenge generation
- Progress tracking per user
- Reward claiming

✅ **Leaderboard**
- All-time, monthly, and weekly rankings
- Win counts and total earnings
- Top 100 players visible

✅ **Referral System**
- Generate unique referral codes
- Track referral earnings
- On-chain splits via ReferralRegistry contract

✅ **Battle Pass**
- Free and premium tiers
- Cosmetic item unlocking
- Experience progression

✅ **Sound & Settings**
- Sound effects toggle
- Music control
- Dark mode (default)
- Volume adjustment

✅ **Smart Contracts**
- CommitRevealRPSWithUSDC: ETH and USDC betting
- ReferralRegistry: On-chain referral tracking
- Fee management (2.5% default, max 5%)

✅ **Telegram Bot**
- `/start` - Show commands
- `/tournaments` - View active tournaments
- `/daily` - Today's challenge
- `/stats` - User stats
- `/leaderboard` - Top players

## Monitoring

### Logging
All API logs are prefixed with `[v0]` for easy filtering in Vercel logs.

### Performance
Monitor these metrics in Vercel Analytics:
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- Time to First Byte (TTFB)

### Database
Monitor Neon dashboard for:
- Query performance
- Connection pool status
- Storage usage

## Scaling Considerations

1. **Database**: Neon auto-scales; consider read replicas for heavy traffic
2. **Caching**: Add Redis (Upstash) for leaderboard and tournament state
3. **WebSockets**: Upgrade to Socket.IO for real-time tournament updates
4. **CDN**: Images and static assets via Vercel CDN (automatic)

## Rollback

If needed:
```bash
vercel rollback
# Or redeploy from git history:
vercel deploy --prod --token <token>
```

## Support & Monitoring

- Monitor Vercel dashboard for deployment status
- Check PostgreSQL (Neon) dashboard for database health
- Enable Sentry for error tracking (optional)
- Monitor Telegram bot logs for webhook errors

---

**Deployment Status**: Ready for production
**Last Updated**: 2026-06-04
**Version**: 1.0.0-beta
