# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/contracts run compile` — compile Solidity contracts
- `pnpm --filter @workspace/contracts run test` — run Hardhat tests (58/58 passing)

## Smart Contracts

`lib/contracts/` is a Hardhat package (Solidity 0.8.24, ethers v6).

### CommitRevealRPS (v3) — 26 tests

Two-player commit-reveal RPS: players post `keccak256(abi.encode(player, move, salt))`
commitments with matching bets, then reveal. Winner takes pot minus protocol fee;
ties and cancels are fee-free. v2 adds `cancelGame`, `claimByDefault` (24h timeout),
`joinedAt`, `Cancelled` phase. v3 adds `feeBps` (max 5%), `feeRecipient`, `Ownable`,
`winnerPayout`, `pendingFees`, `totalFeesCollected/Withdrawn`.

**Base mainnet (v3, verified):** `0x2F2e814aFd9DEb94a23b990725E5C6EF67fC7AAD`
feeRecipient = `0xFfb6505912FCE95B42be4860477201bb4e204E9f`, feeBps = 250 (2.5%)
https://basescan.org/address/0x2F2e814aFd9DEb94a23b990725E5C6EF67fC7AAD#code

**Sepolia (v3, verified, superseded):** `0xEd992aD017878DdB67E7d431f53EaF862f034BA6`
Old v2 contract `0x51f082B3ff0CAdFB7e06984c89523AE03B02162d` is superseded.

### BestOfThreeRPS (v1) — 32 tests

Two-player best-of-3 series using commit-reveal per round. Players stake once;
first to 2 round-wins claims the pot minus 2.5% fee. Includes `cancelSeries`,
`claimByDefault` (24h reveal timeout per round), `commitRound` (for rounds 2/3),
`withdrawFees`, full fee/ownership controls matching CommitRevealRPS v3.

**Base mainnet (v1, verified):** `0x053ac43369DE4B87987689d1cb352A15AB771c40`
feeRecipient = `0xFfb6505912FCE95B42be4860477201bb4e204E9f`, feeBps = 250 (2.5%)
https://basescan.org/address/0x053ac43369DE4B87987689d1cb352A15AB771c40#code

**Deploy commands:**
```bash
# CommitRevealRPS — already live, no redeploy needed
# BestOfThreeRPS
cd lib/contracts && FEE_RECIPIENT=0xFfb6505912FCE95B42be4860477201bb4e204E9f FEE_BPS=250 DO_NOT_TRACK=1 npx hardhat run scripts/deploy-bot3.ts --network base
```

## Frontend (artifacts/rps-game)

React + Vite + wagmi + viem with arcade-neon UI. All pages are lazy-loaded (React.lazy +
Suspense). Vendor chunks split: react, web3, framer-motion, icons.

Pages:
- **Home** — lobby + your games (event-indexed) + open duels + activity feed + stats + streaks + achievements
- **CreateGame** — move picker + live fee/payout breakdown + `?bet=X` rematch prefill
- **GameDetail** — commit-reveal flow, cancel, reveal countdown, claim-by-default, confetti on win, share-to-X, rematch
- **Leaderboard** — event-based (zero `getGame` calls), pure `GameCreated`/`GameResolved`/`GameTied` log scan
- **Treasury** — public revenue dashboard: last 24h/7d/projected monthly, 7-day bar chart, withdrawFees trigger

Performance: `useMyGames` and `useLeaderboardData` use on-chain events (O(events) not O(totalGames));
`useRecentActivityIds` scans last ~3 days of `GameCreated` events.

Wagmi: Base mainnet default chain (reads work without wallet). WalletConnect enabled only
when `VITE_WALLETCONNECT_PROJECT_ID` is set to a valid 32-char projectId
(get free at https://cloud.walletconnect.com). MetaMask/injected always works.

PWA: 8 icon sizes (72–512px), 2 shortcuts (New Duel, Leaderboard), manifest, InstallPrompt.

## API Server (artifacts/api-server)

Express server:
- `GET /api/og/game/:id` — 1200×630 PNG OpenGraph card (SVG → `@resvg/resvg-js`, reads chain via viem)
- `GET /api/share/g/:id` — HTML with OG/Twitter meta tags, JS-redirects to `/game/:id`

`@resvg/*` is marked external in `build.mjs` (native `.node` binaries).

## Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `VITE_CONTRACT_ADDRESS` | shared env | CommitRevealRPS mainnet address |
| `VITE_CHAIN_ID` | shared env | Chain ID (8453 = Base) |
| `VITE_WALLETCONNECT_PROJECT_ID` | shared env | WalletConnect v2 projectId — get free at cloud.walletconnect.com |
| `DEPLOYER_PRIVATE_KEY` | secret | Hardhat deploy wallet private key |
| `BASESCAN_API_KEY` | secret | BaseScan contract verification |
| `SESSION_SECRET` | secret | Express session secret |

## User Preferences

- Never use `console.log` in server code — use `req.log` / `logger`
- Always use `DO_NOT_TRACK=1` prefix when running `hardhat` commands (bypasses telemetry TTY prompt)
- Hardhat test script already includes `DO_NOT_TRACK=1`
