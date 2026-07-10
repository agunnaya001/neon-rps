# Neon RPS - Complete Deployment Guide

## Overview

Neon RPS is a production-ready, provably fair Rock-Paper-Scissors game on Base Mainnet. This guide covers deployment, monitoring, and scaling for launch.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Vite + React)                   │
│  - rps-game: Main gaming UI (Base Mainnet)                  │
│  - Mobile-first responsive design                           │
│  - Service Worker for offline support                       │
│  - PWA with install capability                              │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
┌───────▼────────┐   ┌────────▼──────────┐
│   Smart Contracts │   │  Backend API    │
│ - CommitRevealRPS │   │ - rps-api       │
│ - BestOfThreeRPS  │   │ - Neon DB       │
│ (Base Mainnet)    │   │ - Event indexing│
└────────────────┘   └─────────────────┘
```

---

## Prerequisites

- Node.js 18+ and npm/pnpm
- Git
- MetaMask or similar Web3 wallet
- Vercel account (for deployment)
- BaseScan account (for verification)
- Neon PostgreSQL account (for backend)

---

## Step 1: Smart Contract Deployment

### 1.1 Prepare Contracts

```bash
cd lib/contracts

# Install dependencies
npm install

# Set environment variables
export PRIVATE_KEY=<your_private_key>
export BASE_RPC_URL=https://mainnet.base.org
export BASESCAN_API_KEY=<your_basescan_key>
```

### 1.2 Deploy BestOfThreeRPS v2

```bash
# Create deployment script: scripts/deploy-v2.js
npx hardhat run scripts/deploy-v2.js --network base

# Expected output:
# BestOfThreeRPS deployed to: 0x<address>
# Verify with: npx hardhat verify --network base 0x<address>
```

### 1.3 Verify on BaseScan

```bash
npx hardhat verify \
  --network base \
  0x<deployed_address> \
  "0xFfb6505912FCE95B42be4860477201bb4e204E9f" \
  250
```

### 1.4 Update Contract Addresses

In `artifacts/rps-game/src/lib/contract.ts`:

```typescript
export const COMMIT_REVEAL_RPS_ADDRESS = "0x2F2e814aFd9DEb94a23b990725E5C6EF67fC7AAD";
export const BEST_OF_THREE_RPS_ADDRESS = "0x<new_v2_address>";
export const TREASURY_WALLET_ADDRESS = "0xFfb6505912FCE95B42be4860477201bb4e204E9f";
```

---

## Step 2: Backend API Deployment

### 2.1 Set Up Neon Database

```bash
# Create Neon database
# Get connection string: postgresql://...

# Run migration script
node scripts/migrate-db.js

# Seed achievements
npm run seed:achievements
```

### 2.2 Deploy to Vercel

```bash
cd artifacts/rps-api

# Set environment variables in Vercel
vercel env add DATABASE_URL
vercel env add BETTER_AUTH_SECRET

# Generate BETTER_AUTH_SECRET
openssl rand -base64 32

# Deploy
vercel --prod

# Expected output:
# Vercel deployed to: https://rps-api-<team>.vercel.app
```

### 2.3 Configure Event Listener

```bash
# Start indexing blockchain events
npm run start:indexer

# Monitors GameCreated, GameJoined, GameResolved events
# Syncs to database every block
# Updates leaderboards in real-time
```

---

## Step 3: Frontend Deployment

### 3.1 Build for Production

```bash
cd artifacts/rps-game

# Install dependencies
npm install

# Set environment variables
export VITE_CONTRACT_ADDRESS=0x2F2e814aFd9DEb94a23b990725E5C6EF67fC7AAD
export VITE_API_URL=https://rps-api-<team>.vercel.app
export VITE_CHAIN_ID=8453
export PORT=3000
export BASE_PATH=/

# Build
npm run build

# Verify build
npm run preview
```

### 3.2 Deploy to Vercel

```bash
# Initialize Vercel project
vercel

# Add environment variables
vercel env add VITE_CONTRACT_ADDRESS
vercel env add VITE_API_URL
vercel env add VITE_CHAIN_ID

# Deploy
vercel --prod

# Expected output:
# Vercel deployed to: https://neonrps.xyz
```

### 3.3 Configure Domain

```bash
# Add custom domain in Vercel dashboard
# Update DNS records (CNAME)
# SSL certificate auto-provisioned
```

---

## Step 4: Monitoring & Observability

### 4.1 Set Up Sentry

```typescript
// src/lib/sentry.ts
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: import.meta.env.PROD ? "production" : "development",
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
```

### 4.2 Analytics Tracking

```typescript
// Uses built-in analytics.ts
// Tracks: game creation, sharing, referrals, achievements
// Sends to backend API: POST /api/analytics

// Monitor key metrics:
// - Daily active users
// - Game volume
// - Referral conversion
// - Achievement unlock rate
```

### 4.3 Web Vitals

```bash
# Monitor Core Web Vitals
# Set up Lighthouse CI for continuous monitoring
lhci autorun

# Target metrics:
# FCP: < 2 seconds
# LCP: < 2.5 seconds
# CLS: < 0.1
# TTI: < 4 seconds
```

---

## Step 5: Testing & QA

### 5.1 Game Flow Testing

```bash
# Test critical paths:
# 1. Connect wallet
# 2. Create game
# 3. Join game
# 4. Reveal moves
# 5. Claim winnings
# 6. Share game
# 7. Join tournament
```

### 5.2 Device Testing

```
iOS:
- [ ] iPhone 12 (Safari)
- [ ] iPhone 14 Pro (Safari)
- [ ] iPad (Safari)

Android:
- [ ] Pixel 6 (Chrome)
- [ ] Samsung Galaxy (Chrome)
- [ ] Older Android (Chrome)

Desktop:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
```

### 5.3 Network Testing

```bash
# Chrome DevTools:
# - Slow 3G: 400ms latency
# - Fast 3G: 150ms latency
# - Offline: Test service worker

# Verify:
# - Offline game loading
# - Network error recovery
# - Transaction retry logic
```

---

## Step 6: Launch Preparation

### 6.1 Security Checklist

- [ ] Contract audited
- [ ] Private key never committed
- [ ] Environment variables secured
- [ ] Rate limiting enabled
- [ ] CORS properly configured
- [ ] API authentication working
- [ ] Fund safety checks in place

### 6.2 Performance Checklist

- [ ] Bundle size < 300KB (gzipped)
- [ ] FCP < 2 seconds
- [ ] LCP < 2.5 seconds
- [ ] CLS < 0.1
- [ ] Lighthouse score > 85

### 6.3 Functionality Checklist

- [ ] Game creation works
- [ ] Game joining works
- [ ] Commit-reveal flow functional
- [ ] Winning/losing logic correct
- [ ] Leaderboard updates
- [ ] Referrals track correctly
- [ ] Achievements unlock properly
- [ ] Sharing works on all platforms

---

## Step 7: Launch

### 7.1 Pre-Launch

```bash
# 24 hours before:
# - Final testing on production URLs
# - Verify all integrations
# - Check monitoring dashboards
# - Brief support team

# 1 hour before:
# - Sanity check all systems
# - Prepare social media posts
# - Have rollback plan ready
```

### 7.2 Launch

```bash
# 1. Announcement tweet
# "Neon RPS is LIVE on Base! Bet ETH, outsmart opponents, win real money. 
#  Provably fair commit-reveal mechanics. No front-running possible.
#  Play now: neonrps.xyz"

# 2. Share on Farcaster, Discord, Telegram

# 3. Monitor real-time:
# - Error tracking (Sentry)
# - Analytics (Amplitude)
# - User feedback
```

### 7.3 Post-Launch

```bash
# First 24 hours:
# - Monitor for crashes
# - Fix critical bugs immediately
# - Respond to user questions
# - Update documentation

# First week:
# - Launch referral campaign
# - Start weekly tournaments
# - Share strategy guides
# - Highlight top players
```

---

## Scaling Strategy

### Phase 1: Launch (Week 1)
- Target: 100+ players
- Infrastructure: Single region (Vercel)
- Database: Single Neon instance
- Monitoring: Basic (Sentry + Analytics)

### Phase 2: Growth (Weeks 2-4)
- Target: 1,000+ players
- Add CDN for static assets
- Set up database replicas
- Advanced monitoring/alerting

### Phase 3: Scale (Month 2+)
- Target: 5,000+ players
- Multi-region deployment
- Database sharding
- Advanced caching (Redis)

---

## Emergency Procedures

### Game is Crashing

```bash
# 1. Identify error in Sentry
# 2. Check recent deployments
# 3. Rollback if necessary
#    vercel rollback
# 4. Fix and redeploy
#    vercel deploy --prod
```

### Contract Exploited

```bash
# 1. Pause new game creation
# 2. Alert users immediately
# 3. Disable affected functions
# 4. Deploy security patch
# 5. Compensate affected users
```

### RPC Node Down

```bash
# 1. Switch to backup RPC
# 2. Notify users of slowness
# 3. Retry failed transactions
# 4. Scale rate limits
# 5. Monitor until resolved
```

---

## Rollback Procedure

```bash
# If critical issue found:
vercel rollback

# Or redeploy specific commit:
git checkout <commit_hash>
vercel deploy --prod

# Verify fix worked
# Monitor for 1 hour
# Share status update with users
```

---

## Documentation

- User Guide: `https://neonrps.xyz/guide`
- API Docs: `https://rps-api-<team>.vercel.app/docs`
- Smart Contract Docs: `https://github.com/agunnaya001/neon-rps/tree/main/lib/contracts`
- Deployment Notes: This file

---

## Support & Feedback

- Twitter: `@neonrps`
- Discord: Link in game
- Email: `support@agunnayalabs.xyz`
- GitHub: `github.com/agunnaya001/neon-rps`

---

## Success Metrics

### Launch Week
- Players: 100+
- Games: 500+
- Daily Active: 30%
- Retention: 50% D1

### Month 1
- Players: 1,000+
- Games: 50,000+
- DAU: 200+
- Referral chains: 50+

### Quarter 1
- Players: 5,000+
- Games: 500,000+
- Daily volume: 500 ETH
- Featured on major apps list

---

## Continuous Improvement

- Weekly: Review analytics, fix bugs, iterate UX
- Monthly: Feature releases, tournament events
- Quarterly: New game modes, chain expansion
- Annually: Major version release, new features

Good luck launching Neon RPS!
