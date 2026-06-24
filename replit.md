# neon-rps

The fairest on-chain Rock-Paper-Scissors — server + DB for running and developing the game backend and contracts (dev-focused).

## Replit quickstart

Notes: Replit does not provide a managed Postgres by default. Use a hosted Postgres (Neon, Supabase, ElephantSQL, etc.) and add its connection string to Replit Secrets as DATABASE_URL.

1. Create a Postgres database (Neon recommended for this project).
2. In your Replit project, add a secret:
   - Key: DATABASE_URL
   - Value: the full Postgres connection string (e.g. `postgres://user:pass@host:port/dbname`)
3. (Optional) Add a secret for any other env vars you need (see Environment variables below).
4. Add a `.replit` file (example below) so Replit runs the workspace dev server.

Example .replit (place at repo root):

```toml
# .replit
run = "pnpm --filter @workspace/api-server run dev"
# Optionally ensure deps are installed on boot:
onBoot = "pnpm install --frozen-lockfile"
```

Important: Replit expects your server to bind to the port in process.env.PORT. Ensure the API server falls back to process.env.PORT || 5000.

## Local development (recommended)

Requirements
- Node.js 24+
- pnpm
- PostgreSQL (or a remote DATABASE_URL)

Common commands:
- Install: pnpm install
- Run API server (dev): pnpm --filter @workspace/api-server run dev
- Typecheck: pnpm run typecheck
- Build: pnpm run build
- Regenerate API code & schemas: pnpm --filter @workspace/api-spec run codegen
- Push DB schema (development only): pnpm --filter @workspace/db run push

## Environment variables

Minimum required:
- DATABASE_URL — Postgres connection string (e.g. for Neon). Must be reachable from Replit.

Optional (example):
- NODE_ENV — development/production
- PORT — server port (Replit sets this automatically; the server should use process.env.PORT)
- LOG_LEVEL — debug/info/warn/error

Add these to Replit Secrets (not in repo).

## Where things live (short map)

- packages/api-server — Express API server, main dev entrypoint
- packages/db — Drizzle schema and migrations
- packages/api-spec — OpenAPI spec, Orval codegen (zod + hooks)
- pnpm-workspace.yaml — workspace packages
- package.json (root) — workspace scripts
- replit.md — this file

(Replace paths above if your monorepo package names differ — the repo uses @workspace/* package names.)

## Architecture decisions (summary)

- Monorepo with pnpm workspaces for sharing DB types and API spec between packages.
- Drizzle ORM + Zod for types-first DB and validation; Orval for generating API client/hooks from the OpenAPI spec.
- esbuild for fast CJS bundles in build step (keeps CI fast).

## Product (short)

- Backend API to coordinate on-chain Rock-Paper-Scissors matches and store off-chain metadata/state.
- DB contains match metadata and off-chain state required by the protocol.

## Gotchas / Troubleshooting

- Replit ephemeral filesystem: do not rely on local files for persistent data — use external DB.
- Database migrations: only run pnpm --filter @workspace/db run push for dev environments. For production, follow your DB provider's recommended migration procedures.
- Port binding: Replit provides a PORT env var. Ensure the API server uses process.env.PORT with a fallback.
- Slow cold-start on Replit: preinstall dependencies (onBoot) to reduce cold starts.
- If you see connection failures on Replit, verify your DB provider allows connections from Replit IPs or uses connection pooling / secure tunnels.

## Quick checklist to get running on Replit

- [ ] Create Neon (or other) Postgres and copy connection string
- [ ] Add DATABASE_URL as a Replit secret
- [ ] Add `.replit` file (or configure Replit to run the run command)
- [ ] Ensure API reads process.env.PORT
- [ ] Start repl and visit the provided web URL

## Pointers

- Dev server: packages/api-server — entrypoint for development and Replit run command
- DB schema: packages/db — Drizzle schema & migrations
- API contract: packages/api-spec — OpenAPI spec and Orval configuration
- Use `pnpm --filter <package> run <script>` to target workspace packages

## Troubleshooting tips

- "Cannot connect to DB": double-check DATABASE_URL and network access (IP whitelist).
- "Port in use" or no web link on Replit: ensure the server binds to process.env.PORT.
- "Type errors after codegen": run pnpm --filter @workspace/api-spec run codegen and then pnpm run typecheck.

## Contributing

- Follow existing workspace lint/typecheck/build scripts (root package.json).
- Add tests and an entry in packages that require new functionality; open a PR with a clear description and follow the repo's CI checks.

---
If you'd like, I can:
- open a branch & create a PR that replaces the current replit.md with this version and add a `.replit` file; or
- inspect the API server package to confirm it uses process.env.PORT and, if not, create a small patch to add that fallback.
