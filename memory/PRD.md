# Neon RPS — Product Requirements Document

## Original Problem Statement
> Build a production ready app with this repo, you can connect it to neonrps.xyz
>
> Repo: https://github.com/agunnaya001/neon-rps.git

## Product Overview
**Neon RPS** is a provably-fair on-chain Rock-Paper-Scissors betting game on **Base mainnet**, using a commit-reveal cryptographic scheme to make front-running mathematically impossible. The smart contracts are already deployed and verified on Base. This project ships the production frontend + OG-card backend + Coinbase Onramp on-ramp, runnable on Emergent, ready to be pointed at the `neonrps.xyz` domain.

## Architecture
- **Frontend**: Vite + React 19 + wagmi/viem (`/app/artifacts/rps-game`)
  - Routes: `/`, `/create`, `/leaderboard`, `/treasury`, `/game/:id`
  - PWA installable, arcade-neon UI (cyan + magenta on black), framer-motion animations
- **Backend**: FastAPI on port 8001 (`/app/backend/server.py`)
  - Spawns Node Express on port 8002 (`/app/artifacts/api-server`) via lifespan, proxies `/api/*`
  - Native `/api/onramp/session` POST — Coinbase Onramp session token + URL builder (Ed25519 JWT)
  - Express endpoints (via proxy): `/api/healthz`, `/api/og/game/:id` (PNG OG card via `@resvg/resvg-js`), `/api/share/g/:id` (HTML with OG/Twitter meta tags)
- **Smart Contracts** (already deployed on Base mainnet):
  - `CommitRevealRPS v3`: `0x2F2e814aFd9DEb94a23b990725E5C6EF67fC7AAD`
  - `BestOfThreeRPS v1`: `0x053ac43369DE4B87987689d1cb352A15AB771c40`
  - Treasury wallet: `0xFfb6505912FCE95B42be4860477201bb4e204E9f` (2.5% fee on wins)
- **Wallets**: MetaMask/injected + WalletConnect (project ID `f97e3922909a9260927a85654d4644dd`)
- **On-ramp**: Coinbase Developer Platform Onramp (Ed25519 JWT, key configured in `/app/backend/.env`)

## Tech Stack
- **Monorepo**: pnpm workspaces (Node 20 + pnpm 10) — auto-installed by frontend wrapper if missing
- **Frontend**: Vite 7, React 19, wagmi, viem, TailwindCSS 4, framer-motion, wouter, sonner, lucide-react
- **API Server**: Express 5 + viem + @resvg/resvg-js
- **Adapter**: FastAPI 0.118 + httpx 0.28 + PyJWT 2.9 + cryptography 43 (Ed25519 signing for CDP)
- **Chain**: Base mainnet via `https://mainnet.base.org`

## User Personas
1. **Crypto-native player** — connects MetaMask/Coinbase, creates duels with ETH bets
2. **Mobile player** — installs PWA, uses WalletConnect to pair their mobile wallet
3. **Fiat-funded newcomer** — clicks BUY BASE ETH, completes Coinbase Onramp in popup, returns with ETH ready
4. **Observer / Treasury auditor** — visits `/treasury`, sees on-chain revenue analytics

## Core Requirements (Static)
1. **Provably fair**: commit-reveal hashing eliminates mempool front-running
2. **No backend trust required**: all game state on Base mainnet
3. **2.5% protocol fee on wins only** (ties + cancels are free)
4. **24h reveal timeout** with `claimByDefault` for stuck opponents
5. **Live treasury dashboard** — 24h/7d/projected monthly revenue from on-chain events
6. **OG share cards** — every game has a unique `/api/og/game/:id` PNG card for X/Farcaster
7. **PWA installable** — works as a home-screen app on iOS/Android
8. **Friction-free funding** — Coinbase Onramp opens in a popup with Base + ETH preselected and destination wallet pre-filled

## Implementation Log
### 2026-01-22 — Initial deployment + on-ramp
**Iteration 1 — Initial deployment on Emergent**
- Cloned repo to `/app`, installed pnpm 10 + all workspace deps (~1200 packages)
- Patched `pnpm-workspace.yaml` to enable `linux-arm64` native binaries (esbuild, rollup, @tailwindcss/oxide, lightningcss) — Emergent runs on aarch64
- Built API server with esbuild (2 MB bundle)
- Created `/app/frontend/package.json` thin wrapper that runs Vite via pnpm with PORT=3000 + BASE_PATH=/ (auto-installs pnpm if missing on cold start)
- Created `/app/backend/server.py` FastAPI proxy:
  - Lifespan event spawns Node Express on port 8002
  - Proxies all `/api/*` to it with httpx
  - Exposes `/api/health` for liveness with `node_api` flag
- Configured `/app/artifacts/rps-game/.env` with mainnet contract + WalletConnect project ID
- Updated WalletConnect metadata `url` from `neonrps.replit.app` → `neonrps.xyz`
- Testing subagent: backend 100% (4/4 pytest), frontend 95% (5/5 routes load)

**Iteration 2 — 404 fallback + Coinbase Onramp**
- Replaced `/game/:id` perpetual loader with a proper **404 GAME NOT FOUND** UI (`GameDetail.tsx` lines 159-191) — magenta 404 + cyan caption + neon-bordered RETURN TO LOBBY / START NEW DUEL buttons
- Added Coinbase Developer Platform Onramp:
  - `/app/backend/onramp.py` — Ed25519 JWT signer + POST to `https://api.developer.coinbase.com/onramp/v1/token`, returns hosted `https://pay.coinbase.com/buy/select-asset?sessionToken=...&defaultNetwork=base&defaultAsset=ETH` URL
  - `/app/backend/server.py` — registered `/api/onramp/session` POST **before** the catch-all proxy
  - `/app/artifacts/rps-game/src/components/BuyBaseEthButton.tsx` — new component using `fetch('/api/onramp/session')` + `window.open()` popup, shows `toast.error` on failure
  - Mounted on Home (lobby), CreateGame (wallet-required panel), and Footer (ghost variant)
- Added `data-testid` attributes on the new interactive elements
- Testing subagent: **backend 100% (7/7 pytest)**, **frontend 100%** — real Coinbase API call succeeds

## What's Implemented
- [x] React frontend with all 5 routes loading
- [x] FastAPI → Node Express proxy for `/api/*` endpoints
- [x] OG share card rendering (~200 KB PNG)
- [x] OG/Twitter meta tags on share endpoint
- [x] WalletConnect v2 + MetaMask/injected
- [x] Live reads from Base mainnet contract via viem
- [x] Treasury dashboard (Revenue Analytics, Pending Payout, etc.)
- [x] Neon arcade UI fully working (cyan/magenta on dark)
- [x] **404 GAME NOT FOUND fallback** on `/game/:id` for non-existent IDs
- [x] **Coinbase Onramp BUY BASE ETH** button — fully working end-to-end

## Prioritized Backlog
- **P2**: Investigate `HTTP 413` console noise on home (likely WalletConnect verify-api payload — non-blocking)
- **P2**: Add `?redirectUrl=https://neonrps.xyz/onramp-complete` to Onramp URLs after DNS cutover (also requires adding the domain to CDP allowlist) + a small "deposit complete" landing page
- **P3**: Add `data-testid` attributes to remaining interactive elements across the app
- **P3**: Periodically poll Coinbase Transaction Status API to show "deposit pending" → "deposit confirmed" badges in-app

## Next Action Items
1. **Connect `neonrps.xyz` DNS**: Use **Save to GitHub** → **Deploy** in the chat input, then point DNS to the production URL via Entri.
2. Add `https://neonrps.xyz` to the CDP **Domain Allowlist** in the Coinbase Developer Portal so the redirect-back flow works once domain is live.
3. (Optional) Add a small `/onramp-complete` route to show "deposit on its way" after the popup closes.

## Operational Notes
- `/app/backend/.env` contains `CDP_API_KEY_NAME` + `CDP_API_KEY_SECRET` — required for `/api/onramp/session`. Rotate via the CDP Portal if leaked; the test suite makes a real outbound call to Coinbase so it will fail loudly on bad/revoked keys.
- The Vite dev server is intentionally used (not a static build) — hot reload makes iterative tweaks fast. For production, switch the supervisor frontend command to `pnpm --filter @workspace/rps-game run build` + a static file server (Nginx) for ~10× faster cold start and lower memory.
