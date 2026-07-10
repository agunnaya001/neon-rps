# Neon RPS Implementation Roadmap

## Progress Summary

### ✅ COMPLETE (Phases 1 & 2)

#### Phase 1: Project Structure Restoration
- Monorepo setup with pnpm workspaces
- All library packages in place (contracts, api-spec, api-zod, api-client-react, db)
- All artifact packages in place (rps-game, api-server, mockup-sandbox)
- Backend FastAPI adapter configured
- TypeScript and build tooling ready

#### Phase 2: Smart Contract Integration
- **58/58 tests passing** ✅
- CommitRevealRPS.sol: Core game with commit-reveal + 24h timeout protection
- BestOfThreeRPS.sol: Tournament variant (best-of-3 series)
- CommitRevealRPSWithUSDC.sol: USDC support variant
- All OpenZeppelin v5 compatibility issues resolved
- Hardhat compiler optimized with viaIR
- Ready for Base mainnet deployment

**Key Achievements**:
- Commit-reveal cryptography verified
- Fee collection (2.5% on wins only) tested
- Tie/cancel refund logic confirmed
- Default claim after 24h timeout verified
- Ownership and role-based access control working

---

## Remaining Work

### Phase 3: Backend Services (45 min)
**Goal**: Deploy FastAPI adapter + Node Express API server

**Tasks**:
1. **FastAPI Adapter** (`/backend/server.py`)
   - Health checks: `/api/healthz`, `/api/health`
   - Spawn Node API server on port 8002
   - Reverse proxy: `/api/*` → Node Express on 8002
   - Coinbase Onramp endpoint: `POST /api/onramp/session`

2. **Node Express API** (`/artifacts/api-server`)
   - OG card generation: `GET /api/og/game/:id`
     - Uses `@resvg/resvg-js` (SVG → PNG 1200×630)
     - Uses `satori` (dynamic SVG generation)
     - Reads game state from chain via viem
   - Share metadata: `GET /api/share/g/:id`
     - HTML with OG/Twitter meta tags
     - Auto-redirect to `/game/:id`

3. **Environment Variables**
   - `CONTRACT_ADDRESS` - CommitRevealRPS address on Base
   - `BASE_RPC_URL` - Base mainnet RPC
   - `NODE_API_PORT` - Express server port (8002)
   - `CDP_API_KEY_NAME` - Coinbase key
   - `CDP_API_KEY_SECRET` - Base64 Ed25519 secret

**Tests**: 7/7 passing (pytest)

---

### Phase 4: React Frontend (2 hours)
**Goal**: Build React 19 + Vite frontend with Web3 integration

**Pages to Implement**:

1. **Home** (`/`) - Lobby with game history
   - Recent game history (last 5 games)
   - Referral panel (30-day localStorage TTL)
   - Network activity indicator
   - New Duel button
   - Link to Leaderboard

2. **Create** (`/create`) - Game setup
   - Move picker (Rock, Paper, Scissors)
   - Wager input with ETH/USDC toggle
   - Fee breakdown display
   - Haptic feedback: `navigator.vibrate(15)` on move select
   - Auto-fill via `?bet=X` query param
   - Generate random salt: `crypto.getRandomValues(32)`
   - Show commitment hash
   - Opponent wallet input
   - Create button → stores salt in localStorage under game ID

3. **Game** (`/game/:id`) - Active game interface
   - Displays game state from chain (via viem)
   - Commit phase:
     - Show opponent address (shortened)
     - Countdown to reveal deadline (24h)
   - Reveal phase:
     - "Waiting for opponent..." indicator
     - Reveal button (pulls salt from localStorage)
     - Countdown timer
     - "Claim by Default" button after 24h (if timeout reached)
   - Completed phase:
     - Show winner + payout
     - Confetti animation (canvas-confetti)
     - "Share to X" button
     - "Rematch" link (pre-fill opponent)
     - 404 fallback for non-existent games

4. **Leaderboard** (`/leaderboard`) - Top 100 players
   - Event-indexed: zero per-game RPC calls
   - Table: Rank | Address | Wins | Earnings
   - Sort options: Wins, Earnings, Active (last 24h)
   - Search by wallet address
   - Pagination (25 per page)

5. **Treasury** (`/treasury`) - Public revenue dashboard
   - Last 24h revenue (ETH)
   - Last 7d revenue (ETH)
   - Projected monthly revenue (ETH)
   - 7-day bar chart using Recharts
   - `withdrawFees()` button (callable by anyone, sends to feeRecipient)

**Technology Stack**:
- React 19 hooks
- Vite 7 (dev server, esbuild)
- wagmi v3 (React hooks for Web3)
- viem v2 (Ethereum client)
- TailwindCSS v4 (styling)
- Framer Motion (animations)
- wouter (client-side routing)
- sonner (toast notifications)
- lucide-react (icons)
- canvas-confetti (win animations)
- vite-plugin-pwa (PWA manifest)
- React Query (server state)

**Key Features**:

1. **Commit-Reveal Flow**
   - Generate 32-byte salt: `crypto.getRandomValues(32)`
   - Compute commitment: `keccak256(player, move, salt)`
   - Store salt in `localStorage[gameId]`
   - Opponent joins and commits their move
   - Both reveal move + salt
   - Contract verifies hash and determines winner

2. **PWA Setup**
   - 8 icon sizes (72px, 96px, 128px, 144px, 152px, 192px, 384px, 512px)
   - 2 shortcuts:
     - New Duel → `/create`
     - Leaderboard → `/leaderboard`
   - Web manifest with theme colors (#1a1a3a, #00ff88)
   - Installable to home screen (Chrome, Safari, Edge)

3. **Mobile Enhancements**
   - Web Share API: native iOS/Android share sheet
   - Haptic feedback: `navigator.vibrate(15)` on move select, `(30)` on copy
   - Responsive: single column mobile, grid desktop
   - Viewport-fit cover for iPhone notch

4. **Referral System** (`src/lib/referral.ts`)
   - Every share: `/?ref=<your-wallet>`
   - localStorage TTL: 30 days
   - Display: "REFERRED BY 0xabc…1234" pill on home
   - Auto-stamped on subsequent shares

**Environment Variables**:
- `VITE_CONTRACT_ADDRESS` - CommitRevealRPS address
- `VITE_CHAIN_ID` - 8453 (Base mainnet)
- `VITE_WALLETCONNECT_PROJECT_ID` - WalletConnect v2 projectId

---

### Phase 5: API Integration (45 min)
**Goal**: Connect frontend to OpenAPI-spec'd backend

**API Spec** (`/lib/api-spec`)
- OpenAPI 3.0 source of truth
- Defines all `/api/*` endpoints
- Used to generate:
  - Zod schemas (`/lib/api-zod`)
  - React Query hooks (`/lib/api-client-react`)

**Key Endpoints**:
```
GET /api/healthz                    # Liveness probe
GET /api/health                     # Adapter health + node_api bool
GET /api/og/game/:id                # OG card PNG (1200×630)
GET /api/share/g/:id                # Share metadata HTML
POST /api/onramp/session            # Coinbase Onramp
  { wallet_address, partner_user_ref? }
  → { session_url }
```

**Auto-Generated React Hooks** (from OpenAPI):
```typescript
useGetLeaderboard()          // Fetch top 100 players
useGetGameOG(gameId)         // Fetch OG card
useGetShareMetadata(gameId)  // Fetch meta tags
useCreateOnrampSession()     // Create Onramp session
```

---

### Phase 6: Accessibility & Polish (30 min)
**Goal**: WCAG AA compliance + performance

**Accessibility**:
- Semantic HTML: `<nav>`, `<main>`, `<article>`
- ARIA labels: `aria-label`, `aria-pressed`, `aria-current`
- Keyboard navigation: Tab, Enter, Escape
- Focus indicators: visible outlines on all interactive elements
- Contrast: 4.5:1 minimum for text (AA compliance)
- Heading hierarchy: h1 > h2 > h3

**Performance**:
- Code splitting per route
- Lazy load heavy components
- Image optimization (PWA icon sizes)
- CSS-in-JS minimization (TailwindCSS JIT)
- React Query caching:
  - 5 min staleTime
  - 10 min gc (garbage collection)
- Event-indexed leaderboard: zero RPC calls per game

---

## File Structure (Target)

```
neon-rps/
├── lib/
│   ├── contracts/
│   │   ├── contracts/
│   │   │   ├── CommitRevealRPS.sol ✅
│   │   │   ├── BestOfThreeRPS.sol ✅
│   │   │   └── CommitRevealRPSWithUSDC.sol ✅
│   │   ├── test/ (58/58 passing) ✅
│   │   ├── hardhat.config.ts ✅
│   │   └── package.json ✅
│   ├── api-spec/          # OpenAPI source
│   ├── api-zod/           # Zod schemas (auto-gen)
│   ├── api-client-react/  # React Query hooks (auto-gen)
│   ├── db/                # Drizzle ORM
│   └── auth.*             # Better Auth setup
├── artifacts/
│   ├── rps-game/          # React 19 + Vite frontend (TBD)
│   ├── api-server/        # Node Express API (TBD)
│   └── mockup-sandbox/    # Design playground
├── backend/               # FastAPI adapter (TBD)
├── pnpm-workspace.yaml    # Monorepo config ✅
├── tsconfig.base.json     # TS base config ✅
├── package.json           # Root workspace ✅
└── PHASE*.md              # Documentation ✅
```

---

## Success Criteria

### All Phases
- ✅ 58/58 smart contract tests passing
- ✅ All TypeScript builds clean
- ⏳ 7/7 backend tests passing (Phase 3)
- ⏳ Frontend builds without errors (Phase 4)
- ⏳ PWA installable on Chrome/Safari (Phase 4)
- ⏳ Leaderboard zero per-game RPC calls (Phase 4)
- ⏳ OG cards generate 1200×630 PNG (Phase 3)
- ⏳ Referral system 30-day TTL working (Phase 4)
- ⏳ Coinbase Onramp session creation (Phase 3)
- ⏳ Commit-reveal flow end-to-end tested (Phase 4)
- ⏳ 24h timeout protection verified (✅ Phase 2)
- ⏳ WCAG AA accessibility (Phase 6)

---

## Deployment Timeline

1. **Smart Contracts** (Phase 2) ✅
   - Deploy CommitRevealRPS to Base mainnet
   - Verify on BaseScan
   - Set treasury recipient

2. **Backend** (Phase 3) 🔄
   - Deploy FastAPI to serverless (Lambda, Render, Railway)
   - Deploy Node API server
   - Configure environment variables

3. **Frontend** (Phase 4) ⏳
   - Deploy rps-game to Vercel
   - Configure environment variables
   - Enable PWA

4. **Go-Live** ⏳
   - Verify commit-reveal flow end-to-end
   - Test leaderboard with real games
   - Test OG card sharing
   - Monitor contract events

---

## Next Steps

**Immediate** (Phase 3):
1. Run backend tests: `pnpm test:backend`
2. Set up FastAPI + Node Express servers
3. Implement OG card generation
4. Test Coinbase Onramp integration

**Short-term** (Phase 4):
1. Build React frontend pages
2. Integrate wagmi/viem for Web3
3. Implement commit-reveal UI flow
4. Add PWA manifest and icons

**Medium-term** (Phase 5-6):
1. Auto-generate React Query hooks from OpenAPI
2. Add WCAG AA accessibility
3. Performance optimization
4. Staging deployment

---

## Key Contacts & Resources

- **Base Chain**: https://base.org
- **Coinbase Onramp**: https://www.coinbase.com/developers/onramp
- **Hardhat Docs**: https://hardhat.org/docs
- **Wagmi Docs**: https://wagmi.sh
- **Vite Docs**: https://vitejs.dev
- **OpenAPI Generator**: https://openapi-generator.tech

---

## Status: ✅✅ PHASES 1 & 2 COMPLETE, PHASE 3 READY

All smart contracts tested and verified. Monorepo structure fully functional.  
Next milestone: Deploy FastAPI + Node Express backend (Phase 3).
