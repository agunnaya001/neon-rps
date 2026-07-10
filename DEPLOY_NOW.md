# 🚀 Neon RPS - Deployment Guide

## Quick Start (5 minutes)

### Step 1: Deploy BestOfThreeRPS v2 to Base Mainnet

```bash
cd lib/contracts

# Install Hardhat (if not already installed)
npm install

# Set up environment variables
export PRIVATE_KEY=your_wallet_private_key
export BASE_RPC_URL=https://mainnet.base.org

# Deploy contract
npx hardhat run scripts/deploy-bestofthree-v2.ts --network base

# Verify on BaseScan
npx hardhat verify --network base <CONTRACT_ADDRESS> \
  --constructor-args scripts/args.js
```

**Expected output:**
```
✅ BestOfThreeRPS v2 deployed to: 0x...
```

Update `artifacts/rps-game/src/lib/contract.ts` with the new address.

---

### Step 2: Deploy Backend API to Vercel

```bash
cd artifacts/rps-api

# Install dependencies
npm install

# Set up Vercel project
vercel link

# Add environment variables to Vercel
vercel env add DATABASE_URL

# When prompted, paste your Neon database URL from:
# https://console.neon.tech -> Project -> Connection string

# Deploy to production
vercel --prod
```

**Note:** Keep the API URL shown (e.g., `https://rps-api-abc123.vercel.app`)

---

### Step 3: Deploy Frontend to Vercel

```bash
cd artifacts/rps-game

# Install dependencies
npm install

# Build locally to verify
npm run build

# Set up Vercel project
vercel link

# Add environment variable
vercel env add VITE_API_URL

# When prompted, enter the backend API URL from Step 2
# Example: https://rps-api-abc123.vercel.app

# Deploy to production
vercel --prod
```

---

## Environment Variables Checklist

### Backend (rps-api)
- [ ] `DATABASE_URL` - PostgreSQL connection string from Neon
- [ ] `NODE_ENV` - Set to "production" 
- [ ] `CRON_SECRET` - Random secret for cron job verification

### Frontend (rps-game)
- [ ] `VITE_API_URL` - Backend API URL (e.g., https://rps-api.vercel.app)
- [ ] `VITE_CONTRACT_ADDRESS` - BestOfThreeRPS v2 address (optional, defaults to v1)
- [ ] `VITE_CHAIN_ID` - Set to 8453 for Base Mainnet (optional)

---

## Database Setup (Neon)

If you haven't already created the database:

1. Go to [console.neon.tech](https://console.neon.tech)
2. Create a new project (or use existing)
3. Go to Connection string → Connection pooler
4. Copy the connection string
5. Paste into Vercel environment variables as `DATABASE_URL`

The database tables will be automatically created on first backend startup.

---

## Post-Deployment Verification

### Check Backend Health
```bash
curl https://rps-api-abc123.vercel.app/api/leaderboard?limit=1
```

Should return:
```json
{
  "success": true,
  "data": [...],
  "total": 0
}
```

### Check Frontend
1. Visit deployed frontend URL
2. Connect wallet (MetaMask, WalletConnect)
3. Verify contract addresses show correctly
4. Test creating a game (on Base Sepolia testnet or Mainnet)

---

## Starting the Event Listener

The event listener auto-syncs game results to the database:

```bash
# Local development
cd artifacts/rps-api
npx ts-node scripts/event-listener.ts

# For production, use Vercel crons
# The cron endpoint `/api/cron/sync-stats` runs automatically every 6 hours
```

---

## Quick Troubleshooting

### "DATABASE_URL not found"
- Check Vercel project settings → Environment Variables
- Ensure you're deploying from the correct directory
- Test locally: `echo $DATABASE_URL`

### "Frontend can't reach API"
- Check `VITE_API_URL` is set in frontend environment
- Verify backend is deployed and responding
- Check CORS headers in backend `vercel.json`

### "Gas estimation failed"
- Ensure you're on Base Mainnet (chainId 8453)
- Check wallet has enough ETH for gas fees (~0.01 ETH min)
- Verify contract address is correct

### "No open games showing"
- Event listener may need time to sync
- Check `/api/games` endpoint directly
- Manual sync: trigger `/api/cron/sync-stats` endpoint

---

## Post-Launch Monitoring

### Set up Monitoring
1. Go to Vercel project settings → Analytics
2. Enable Web Vitals monitoring
3. Set up error notifications

### Check Logs
```bash
# Frontend errors
vercel logs <frontend-project-id>

# Backend errors  
vercel logs <backend-project-id>
```

### Monitor Database
Visit [console.neon.tech](https://console.neon.tech) → Your Project → Monitoring

---

## Live Contract Addresses (Base Mainnet)

```
CommitRevealRPS v3: 0x2F2e814aFd9DEb94a23b990725E5C6EF67fC7AAD
BestOfThreeRPS v1:  0x053ac43369DE4B87987689d1cb352A15AB771c40
Treasury Wallet:    0xFfb6505912FCE95B42be4860477201bb4e204E9f (2.5% fee)
```

---

## Success! 🎉

Once deployed, your game is live. Next steps:

1. **Share with community** - Post on Twitter, Discord, Telegram
2. **Monitor metrics** - Track players, games, earnings
3. **Collect feedback** - Use in-game feedback button
4. **Iterate** - Deploy updates as needed

---

## Support & Resources

- **Neon Docs:** https://neon.tech/docs
- **Vercel Docs:** https://vercel.com/docs
- **Base Docs:** https://docs.base.org
- **Game Smart Contracts:** `lib/contracts/contracts/`
- **Backend API:** `artifacts/rps-api/`
- **Frontend:** `artifacts/rps-game/`

Good luck launching! 🚀
