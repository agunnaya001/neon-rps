# Neon RPS — Product Requirements Document

## Original Problem Statement
> Build a production ready app with this repo, you can connect it to neonrps.xyz
>
> Repo: https://github.com/agunnaya001/neon-rps.git

## Product Overview
**Neon RPS** is a provably-fair on-chain Rock-Paper-Scissors betting game on **Base mainnet**, using a commit-reveal cryptographic scheme to make front-running mathematically impossible. The smart contracts are already deployed and verified on Base. This project ships the production frontend + OG-card backend, runnable on Emergent, ready to be pointed at the `neonrps.xyz` domain.

## Architecture
- **Frontend**: Vite + React 19 + wagmi/viem (`/app/artifacts/rps-game`)
  - Routes: `/`, `/create`, `/leaderboard`, `/treasury`, `/game/:id`
  - PWA installable, arcade-neon UI (cyan + magenta on black), framer-motion animations
- **Backend**: FastAPI proxy on port 8001 (`/app/backend/server.py`) → spawns Node Express on port 8002 (`/app/artifacts/api-server`) via lifespan event, proxies `/api/*`
  - Endpoints: `/api/healthz`, `/api/og/game/:id` (PNG OG card via `@resvg/resvg-js`), `/api/share/g/:id` (HTML with OG/Twitter meta tags)
- **Smart Contracts** (already deployed on Base mainnet):
  - `CommitRevealRPS v3`: `0x2F2e814aFd9DEb94a23b990725E5C6EF67fC7AAD`
  - `BestOfThreeRPS v1`: `0x053ac43369DE4B87987689d1cb352A15AB771c40`
  - Treasury wallet: `0xFfb6505912FCE95B42be4860477201bb4e204E9f` (2.5% fee on wins)
- **Wallets**: MetaMask/injected + WalletConnect (project ID `f97e3922909a9260927a85654d4644dd`)

## Tech Stack
- **Monorepo**: pnpm workspaces (Node 20 + pnpm 10)
- **Frontend**: Vite 7, React 19, wagmi, viem, TailwindCSS 4, framer-motion, wouter, sonner, lucide-react
- **API Server**: Express 5 + viem + @resvg/resvg-js
- **Adapter**: FastAPI 0.118 + httpx 0.28 (proxies to internal Node server)
- **Chain**: Base mainnet via `https://mainnet.base.org`

## User Personas
1. **Crypto-native player** — connects MetaMask/Coinbase, creates duels with ETH bets
2. **Mobile player** — installs PWA, uses WalletConnect to pair their mobile wallet
3. **Observer / Treasury auditor** — visits `/treasury`, sees on-chain revenue analytics

## Core Requirements (Static)
1. **Provably fair**: commit-reveal hashing eliminates mempool front-running
2. **No backend trust required**: all game state on Base mainnet
3. **2.5% protocol fee on wins only** (ties + cancels are free)
4. **24h reveal timeout** with `claimByDefault` for stuck opponents
5. **Live treasury dashboard** — 24h/7d/projected monthly revenue from on-chain events
6. **OG share cards** — every game has a unique `/api/og/game/:id` PNG card for X/Farcaster
7. **PWA installable** — works as a home-screen app on iOS/Android

## Implementation Log
### 2026-01-22 — Initial deployment on Emergent
- Cloned repo to `/app`, installed pnpm 10 + all workspace deps (~1200 packages)
- Patched `pnpm-workspace.yaml` to enable `linux-arm64` native binaries (esbuild, rollup, @tailwindcss/oxide, lightningcss) — Emergent runs on aarch64
- Built API server with esbuild (2 MB bundle)
- Created `/app/frontend/package.json` thin wrapper that runs Vite via pnpm with PORT=3000 + BASE_PATH=/
- Created `/app/backend/server.py` FastAPI proxy:
  - Lifespan event spawns Node Express on port 8002
  - Proxies all `/api/*` to it with httpx
  - Exposes `/api/health` for liveness with `node_api` flag
- Configured `/app/artifacts/rps-game/.env` with mainnet contract + WalletConnect project ID
- Updated WalletConnect metadata `url` from `neonrps.replit.app` → `neonrps.xyz`
- Testing subagent confirmed: backend 100% (4/4 pytest), frontend 95% (5/5 routes load)

## What's Implemented
- [x] React frontend with all 5 routes loading
- [x] FastAPI → Node Express proxy for `/api/*` endpoints
- [x] OG share card rendering (~200 KB PNG)
- [x] OG/Twitter meta tags on share endpoint
- [x] WalletConnect v2 + MetaMask/injected
- [x] Live reads from Base mainnet contract via viem
- [x] Treasury dashboard (Revenue Analytics, Pending Payout, etc.)
- [x] Neon arcade UI fully working (cyan/magenta on dark)

## Prioritized Backlog
- **P2**: Add not-found fallback on `/game/:id` when contract returns empty struct (currently shows perpetual loader for non-existent IDs)
- **P2**: Investigate `HTTP 413` console noise on home (likely WalletConnect verify-api payload — non-blocking)
- **P2**: Add SSR/prerender for `/api/share/g/:id` HTML if Twitter cards need crawler-friendly markup beyond meta tags
- **P3**: Add `data-testid` attributes to interactive elements for E2E test coverage

## Next Action Items
1. Point `neonrps.xyz` DNS to the Emergent deployment after `Save to GitHub` → `Deploy` flow
2. (Optional) Add a "game not found" UI state on `/game/:id` (P2)
3. (Optional) Add Stripe with Crypto / on-ramp integration for buying Base ETH directly in-app
