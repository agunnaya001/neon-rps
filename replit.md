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
`CommitRevealRPS.sol`, a two-player commit-reveal Rock-Paper-Scissors game:
players post a `keccak256(abi.encode(player, move, salt))` commitment with a
matching bet, then reveal their move + salt. Winner takes the pot; ties refund
both players. Open games are tracked on-chain for listing.

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.
