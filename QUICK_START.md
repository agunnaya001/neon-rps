# Neon RPS - Quick Start Guide

**Get neonrps.xyz live in 30 minutes**

---

## 🎯 5-Minute Setup

### 1. Create Neon Database (2 min)
```bash
# Go to neon.tech, sign up, create project
# Copy DATABASE_URL from connection string
# Format: postgres://user:password@host/database?sslmode=require
```

### 2. Generate Auth Secret (1 min)
```bash
openssl rand -base64 32
# Copy output to BETTER_AUTH_SECRET
```

### 3. Deploy to Vercel (2 min)
```bash
# Push to GitHub
git push origin main

# Vercel auto-deploys on push
# Set env vars in Vercel dashboard:
# - DATABASE_URL
# - BETTER_AUTH_SECRET
# - BETTER_AUTH_URL=https://neonrps.xyz
# - NEXT_PUBLIC_API_URL=https://neonrps.xyz
```

---

## ⚡ 10-Minute Smart Contracts

### Deploy to Base Mainnet
```bash
cd lib/contracts
npx hardhat run scripts/deploy.ts --network base

# Copy output addresses:
# RPS_CONTRACT_ADDRESS=0x...
# REFERRAL_REGISTRY_ADDRESS=0x...

# Set in Vercel env vars:
# NEXT_PUBLIC_RPS_CONTRACT_ADDRESS
# NEXT_PUBLIC_REFERRAL_REGISTRY_ADDRESS
```

---

## 🌐 15-Minute Domain Setup

### Register neonrps.xyz
- Go to Namecheap / GoDaddy / your registrar
- Register neonrps.xyz
- Point nameservers to Vercel's:
  - `ns1.vercel-dns.com`
  - `ns2.vercel-dns.com`

### Add to Vercel
1. Vercel Dashboard → Project Settings → Domains
2. Add `neonrps.xyz` and `www.neonrps.xyz`
3. Wait for DNS propagation (5-10 minutes)

---

## ✅ 20-Minute Testing

### Test Each Feature
```bash
# Signup
curl -X POST https://neonrps.xyz/api/auth/signup \
  -d '{"email":"test@example.com","password":"test123","name":"Test"}'

# Create tournament
curl -X POST https://neonrps.xyz/api/tournaments \
  -d '{"name":"Test","format":"single-elimination","maxPlayers":8}'

# Get leaderboard
curl https://neonrps.xyz/api/leaderboard

# Get challenges
curl https://neonrps.xyz/api/challenges
```

### Manual Tests
- [ ] Load https://neonrps.xyz
- [ ] Click "Play Now"
- [ ] Sign up with test account
- [ ] View tournaments page
- [ ] View challenges page
- [ ] View leaderboard
- [ ] View battle pass

---

## 🚀 30-Minute Launch

### Final Checklist
- [ ] All env vars set in Vercel
- [ ] Database connected and schema created
- [ ] Smart contracts deployed
- [ ] Domain points to Vercel
- [ ] SSL certificate generated (auto)
- [ ] All API endpoints tested
- [ ] Landing page loads correctly

### Go Live
```bash
# You're done! The site is live at https://neonrps.xyz
```

### Announce
- Tweet announcement with referral link
- Post in Discord community
- Share with beta testers
- Monitor Vercel logs for errors

---

## 🆘 Troubleshooting

### "Database Connection Failed"
```bash
# Verify DATABASE_URL in Vercel env vars
# Test with psql:
psql $DATABASE_URL -c "SELECT version();"
```

### "Build Failed"
- Check Vercel build logs
- Common issues: missing env var, TypeScript error
- Re-deploy after fixing

### "Schema Not Created"
- Database schema auto-creates on first query
- Check Neon dashboard for tables
- Tables should appear in DB after first API call

### "Wallet Connection Failed"
- Ensure MetaMask extension installed
- Check smart contract addresses in env vars
- Verify you're on Base Mainnet (chainId 8453)

---

## 📊 Day 1 Goals

- [ ] 50+ signups
- [ ] 10+ games played
- [ ] 5+ tournaments created
- [ ] $0 cost (Vercel + Neon free tier)
- [ ] 99.9% uptime

---

## 🎯 Next Steps After Launch

### Hour 1
- Monitor error logs
- Respond to user feedback
- Check database performance

### Day 1
- Celebrate first 100 users
- Share early player stats
- Highlight top performers

### Week 1
- Gather feature feedback
- Plan v1.1 features
- Build marketing materials

---

## 📚 Full Documentation

- **APP_README.md** - Complete project guide
- **DEPLOYMENT.md** - Detailed deployment steps
- **LAUNCH_CHECKLIST.md** - Full launch checklist
- **BUILD_SUMMARY.md** - Build achievements

---

## 💡 Pro Tips

### Optimize for Day 1
- Pin leaderboard to show early players
- Announce first tournament winner
- Celebrate referrals publicly
- Share gameplay clips

### Community Growth
- Offer tournament prizes (from platform fees)
- Create daily streaks for challenges
- Gamify referral leaderboard
- Host weekly tournaments

### Technical Excellence
- Monitor Neon dashboard regularly
- Check Vercel Analytics daily
- Set up Sentry for error tracking
- Configure rate limiting week 2

---

**Status**: READY TO LAUNCH ✅  
**Estimated Launch Time**: Today, 2026-06-04  
**Expected Uptime**: 99.9%  
**Cost**: $0 (free tier, scales as you grow)
