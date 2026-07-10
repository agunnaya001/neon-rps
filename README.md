# Neon RPS - On-Chain Gaming on Base

<div align="center">

![Neon RPS Logo](public/neon-rps-logo.png)

**On-chain Rock Paper Scissors with real ETH & USDC rewards**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-%5E0.8.24-blue)](https://soliditylang.org/)
[![Chain: Base](https://img.shields.io/badge/Chain-Base%20Mainnet-blue)](https://base.org/)
[![Tests](https://img.shields.io/badge/Tests-58%2F58%20Passing-success)](./lib/contracts/test)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-%5E5.9-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Node](https://img.shields.io/badge/Node-%5E20.0-339933?logo=node.js)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-%5E9.0-F69220?logo=pnpm)](https://pnpm.io/)

**[Live Demo](#) • [Documentation](#documentation) • [Smart Contracts](#smart-contracts) • [Contributing](#contributing)**

</div>

---

## Overview

Neon RPS is a production-grade, on-chain gaming platform built on Base that brings the classic game of Rock Paper Scissors into Web3. Players compete for real ETH and USDC rewards with transparent, cryptographically-secure commit-reveal mechanics.

### Key Features

- **Commit-Reveal Cryptography**: Secure game state with 24-hour reveal timeout protection
- **Multiple Game Modes**: Quick matches, tournaments, and daily challenges
- **Dual Currency Support**: Play with ETH or USDC with dynamic fee handling
- **Tournament System**: Best-of-3 series with leaderboard ranking
- **Referral Rewards**: Earn commission on referred players' wins
- **Treasury Dashboard**: Real-time analytics and fund management
- **Mobile-First PWA**: Install as app on any device
- **WCAG AA Accessibility**: Full keyboard navigation and screen reader support

---

## Tech Stack

### Smart Contracts
- **Language**: Solidity ^0.8.24
- **Framework**: Hardhat with viaIR optimization
- **Testing**: 58/58 tests passing with Chai & ethers.js
- **Security**: OpenZeppelin v5, ReentrancyGuard, access control
- **Deployment**: Base Mainnet (chainId: 8453)

### Backend
- **API**: FastAPI (Python) + Express.js (Node)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth with email+password
- **OG Cards**: Satori + Resvg for dynamic social previews

### Frontend
- **Framework**: React 19 with Vite
- **Web3**: Wagmi v2 + Viem for contract interaction
- **Styling**: Tailwind CSS v4
- **State Management**: React Query + Zustand
- **Testing**: Vitest + React Testing Library

### DevOps & Tooling
- **Package Manager**: pnpm v9 with workspaces
- **Version Control**: Git + GitHub
- **CI/CD**: GitHub Actions (ready to configure)
- **Code Quality**: ESLint, Prettier, TypeScript strict mode
- **Monitoring**: Sentry integration ready

---

## Quick Start

### Prerequisites
- Node.js 20+ and pnpm 9+
- Git
- Wallet (MetaMask/Coinbase/Ledger)

### Installation

```bash
# Clone repository
git clone https://github.com/Agunnaya-Labs/neon-rps.git
cd neon-rps

# Install dependencies
pnpm install

# Setup environment variables
cp .env.example .env.development.local
# Edit with your API keys and contract addresses
```

### Development

```bash
# Start frontend dev server
pnpm dev

# Run contract tests
pnpm test:contracts

# Run backend tests
pnpm test:backend

# Build all packages
pnpm build

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

### Deployment

```bash
# Compile smart contracts
pnpm -C lib/contracts compile

# Deploy to Base Sepolia testnet
pnpm -C lib/contracts deploy:sepolia

# Deploy to Base mainnet (production)
pnpm -C lib/contracts deploy:mainnet

# Verify on BaseScan
pnpm -C lib/contracts verify:mainnet
```

---

## Smart Contracts

### CommitRevealRPS

**Core game contract with commit-reveal mechanics**

```solidity
// Player commits with hashed move
commitMove(bytes32 hashedMove, uint256 wagerAmount)

// After opponent commits, reveal your move
revealMove(uint8 move, bytes32 salt)

// Claim winnings after timeout
claimDefault(uint256 gameId)
```

**Features:**
- Keccak256 hashing for move privacy
- 24-hour reveal timeout with default claims
- 2.5% protocol fee (configurable, max 5%)
- Tie/cancellation refund protection

### BestOfThreeRPS

**Tournament variant with series management**

```solidity
// Create tournament bracket
createTournament(address opponent, uint256 wagerPerGame)

// Play individual games within tournament
playGame(uint256 tournamentId, bytes32 hashedMove)

// Determine tournament winner
settleTournament(uint256 tournamentId)
```

**Features:**
- Multi-round tournament logic
- Best-of-3 series tracking
- Forfeit protection with timeouts
- Automatic winner determination

### CommitRevealRPSWithUSDC

**ERC20 wager support for USDC and stablecoins**

```solidity
// Same interface as CommitRevealRPS but with USDC
// Uses IERC20 transfer/transferFrom for fund handling
```

**Security:**
- `transferFrom()` with approval checks
- Reentrancy protection via ReentrancyGuard
- Pausable in case of emergency

---

## Project Structure

```
neon-rps/
├── lib/
│   ├── contracts/           # Smart contracts & tests
│   │   ├── contracts/       # Solidity contracts
│   │   ├── test/            # 58 contract tests
│   │   └── hardhat.config.ts
│   ├── api-spec/            # OpenAPI specification
│   ├── api-zod/             # Type validation schemas
│   ├── api-client-react/    # Auto-generated React hooks
│   ├── db/                  # Database schemas & migrations
│   └── auth/                # Authentication utilities
├── artifacts/
│   ├── rps-game/            # React frontend (Vite)
│   ├── api-server/          # Express backend
│   ├── neon-rps-mobile/     # Mobile PWA variant
│   └── mockup-sandbox/      # Sandbox environment
├── backend/                 # FastAPI services
│   ├── og_generator/        # OG card generation
│   ├── onramp/              # Coinbase Onramp adapter
│   └── indexer/             # Event indexing service
├── pnpm-workspace.yaml      # Workspace configuration
├── tsconfig.base.json       # Shared TypeScript config
└── package.json             # Root workspace config
```

---

## API Documentation

### REST Endpoints

#### Games
- `POST /api/games/create` - Initiate new game
- `POST /api/games/:id/commit` - Commit move
- `POST /api/games/:id/reveal` - Reveal move
- `GET /api/games/:id` - Get game state
- `GET /api/games/:id/result` - Get game result

#### User Profile
- `GET /api/users/:address` - Get player stats
- `PUT /api/users/:address/profile` - Update profile
- `GET /api/users/:address/stats` - Detailed statistics

#### Leaderboard
- `GET /api/leaderboard?period=weekly` - Weekly rankings
- `GET /api/leaderboard/tournaments` - Tournament rankings
- `GET /api/leaderboard/trending` - Top climbers

#### Social
- `GET /api/share/:gameId/og` - Generate OG card
- `GET /api/share/:gameId/meta` - Share metadata

See [API Documentation](./lib/api-spec/README.md) for complete OpenAPI spec.

---

## Testing

### Unit Tests
```bash
pnpm test:contracts  # 58 contract tests
pnpm test:backend    # API route tests
pnpm test:frontend   # React component tests
```

### Integration Tests
```bash
# Full game flow simulation
pnpm test:integration

# Load testing with k6
pnpm test:load
```

### Coverage
```bash
# Generate coverage report
pnpm test:coverage

# View coverage report
open coverage/index.html
```

**Current Coverage:**
- Smart Contracts: 98% line coverage
- Backend API: 85% line coverage
- Frontend Components: 72% (component-dependent)

---

## Security

### Audit Status
- OpenZeppelin Contracts v5 (industry standard)
- ReentrancyGuard on all state-changing functions
- Checks-Effects-Interactions pattern enforced
- No delegatecall or assembly usage

### Access Control
- Owner-controlled fee management
- Role-based authorization for admin functions
- Pausable emergency stop mechanism

### Best Practices
- Input validation on all contract functions
- Safe math (Solidity ^0.8.24 has overflow protection)
- Event logging for all state changes
- Explicit visibility on all functions

### Recommendations for Production
1. **Smart Contract Audit**: Hire third-party auditor (e.g., OpenZeppelin, Trail of Bits)
2. **Rate Limiting**: Implement IP-based rate limiting on API
3. **WAF Configuration**: Enable Web Application Firewall on production
4. **Secret Management**: Use HashiCorp Vault or AWS Secrets Manager
5. **Monitoring**: Set up Sentry for error tracking and alerting

---

## Performance Optimization

### Frontend
- Code splitting with React lazy loading
- Image optimization with WebP + AVIF formats
- Service worker for offline functionality
- Critical CSS inlining

### Backend
- Database query optimization with connection pooling
- Redis caching for leaderboard rankings
- CDN integration for static assets
- Request compression with gzip/brotli

### Smart Contracts
- viaIR compiler optimization enabled
- Efficient storage packing (uint8 for moves)
- Minimal state mutations per transaction
- Gas-optimized loop structures

---

## Environment Variables

### Frontend (.env.development.local)
```env
VITE_CONTRACT_ADDRESS_COMMIT_REVEAL=0x...
VITE_CONTRACT_ADDRESS_BEST_OF_THREE=0x...
VITE_USDC_ADDRESS=0x833589fCD6eDb6E08f4c7C32D4f71b1566469c3d
VITE_RPC_URL=https://mainnet.base.org
VITE_CHAIN_ID=8453
VITE_API_BASE_URL=http://localhost:3001/api
```

### Backend (.env)
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/neon_rps
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_secret_key_here
SENTRY_DSN=https://...
CORS_ORIGIN=http://localhost:5173,https://neon-rps.vercel.app
```

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork & Branch**: `git checkout -b feature/your-feature`
2. **Commit**: Follow conventional commits: `feat:`, `fix:`, `docs:`
3. **Test**: Add tests for new functionality
4. **PR**: Link to issues and provide clear description

### Code Standards
- TypeScript strict mode required
- ESLint + Prettier enforced via pre-commit hooks
- 80+ character line limit (except URLs)
- Descriptive variable names and comments

### Bug Reports
Use GitHub Issues with this template:
```
### Description
Clear description of the bug

### Steps to Reproduce
1. ...
2. ...

### Expected Behavior
What should happen

### Actual Behavior
What actually happens

### Screenshots/Logs
Any relevant context
```

---

## Roadmap

### Q4 2024
- [ ] Cross-chain deployment (Arbitrum, Polygon, Optimism)
- [ ] NFT cosmetics and cosmetic marketplace
- [ ] Leaderboard seasons with rewards
- [ ] Mobile app (React Native)

### Q1 2025
- [ ] DAO governance token ($NEON)
- [ ] Staking with revenue sharing
- [ ] AI-powered opponent matching
- [ ] Voice chat integration

### Q2 2025
- [ ] Chain abstraction (play on any chain, pay in any token)
- [ ] Tournaments with prize pools
- [ ] Community mini-games
- [ ] Integration with Base Mainnet ecosystem

---

## Community

- **Discord**: [Join Community](https://discord.gg/)
- **Twitter**: [@AgunayaLabs](https://twitter.com/AgunayaLabs)
- **Website**: [neon-rps.vercel.app](https://neon-rps.vercel.app)
- **Blog**: [Medium](https://medium.com/@AgunayaLabs)

---

## License

MIT License © 2024 Agunnaya Labs. See [LICENSE](./LICENSE) for details.

---

## Acknowledgments

- **OpenZeppelin**: Security standards and contracts
- **Base**: Blockchain infrastructure
- **Hardhat**: Smart contract development
- **React Community**: Frontend tooling and libraries
- **Contributors**: All who've helped improve this project

---

**Built with by [Agunnaya Labs](https://agunnaya.io) on Base**
