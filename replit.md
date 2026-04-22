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
- `pnpm --filter @workspace/contracts run test` — run Hardhat tests

## Smart Contracts

`lib/contracts/` is a Hardhat package (Solidity 0.8.24, ethers v6). It contains
`CommitRevealRPS.sol` (v2), a two-player commit-reveal Rock-Paper-Scissors game:
players post a `keccak256(abi.encode(player, move, salt))` commitment with a
matching bet, then reveal their move + salt. Winner takes the pot; ties refund
both players. Open games are tracked on-chain for listing.

v2 adds: `cancelGame` (creator can cancel before opponent joins), `claimByDefault`
(after a 24h reveal timeout, the player who revealed claims the entire pot),
`joinedAt` timestamp, `Cancelled` phase, `revealDeadline` view.

Sepolia deployment (verified): `0x51f082B3ff0CAdFB7e06984c89523AE03B02162d`.

## Frontend (artifacts/rps-game)

React + Vite + wagmi + viem with arcade-neon UI. Pages: Home (lobby + your games
+ scoreboard + activity feed), CreateGame, GameDetail (commit-reveal flow,
share-to-X, cancel button, reveal countdown, claim-by-default), Leaderboard
(all-time wins aggregated client-side from on-chain events). NetworkBanner
prompts users to switch to Sepolia when on the wrong chain.

## API Server (artifacts/api-server)

Express server with two key endpoints used by the frontend's share button:
- `GET /api/og/game/:id` — renders a 1200x630 PNG OpenGraph card for a match
  (SVG composed server-side, rasterized via `@resvg/resvg-js`, reads game state
  via `viem`)
- `GET /api/share/g/:id` — HTML wrapper page with proper OG / Twitter meta tags
  pointing at the OG image, JS-redirects browsers to the SPA `/game/:id`

The `@resvg/*` package family is marked external in `build.mjs` because it
ships native `.node` binaries that esbuild cannot bundle.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
