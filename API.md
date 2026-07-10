# API Documentation

## Overview

Neon RPS exposes a comprehensive REST API for game management, user profiles, and social features. All endpoints are authenticated via JWT bearer tokens and rate-limited to 100 requests per minute per user.

**Base URL**: `https://api.neon-rps.vercel.app/api`  
**API Version**: v1  
**Authentication**: Bearer token (JWT)

---

## Authentication

### Get Auth Token
```http
POST /auth/login
Content-Type: application/json

{
  "email": "player@example.com",
  "password": "secure_password"
}
```

**Response (200 OK)**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expiresIn": 86400,
  "user": {
    "id": "user_123",
    "email": "player@example.com",
    "walletAddress": "0x..."
  }
}
```

**Error (401 Unauthorized)**:
```json
{
  "error": "Invalid credentials",
  "code": "AUTH_INVALID"
}
```

### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Games API

### Create Game
```http
POST /games/create
Authorization: Bearer {token}
Content-Type: application/json

{
  "opponentAddress": "0x1234567890123456789012345678901234567890",
  "wagerAmount": "1.0",
  "tokenType": "ETH",
  "gameMode": "quick"
}
```

**Parameters**:
- `opponentAddress` (string): Valid Ethereum address
- `wagerAmount` (number): Wager amount (0.001 - 1000)
- `tokenType` (enum): "ETH" or "USDC"
- `gameMode` (enum): "quick" | "tournament" | "challenge"

**Response (200 OK)**:
```json
{
  "gameId": "game_abc123",
  "contractGameId": "1",
  "player1": "0x...",
  "player2": "0x...",
  "wager": "1.0",
  "tokenType": "ETH",
  "status": "waiting_for_opponent",
  "createdAt": "2024-01-15T10:30:00Z",
  "expiresAt": "2024-01-16T10:30:00Z"
}
```

### Get Game
```http
GET /games/:gameId
Authorization: Bearer {token}
```

**Response (200 OK)**:
```json
{
  "gameId": "game_abc123",
  "player1": {
    "address": "0x...",
    "username": "PlayerOne",
    "moveCommitted": true,
    "moveRevealed": false
  },
  "player2": {
    "address": "0x...",
    "username": "PlayerTwo",
    "moveCommitted": true,
    "moveRevealed": false
  },
  "wager": "1.0",
  "status": "reveal_phase",
  "phase": {
    "current": "reveal",
    "startedAt": "2024-01-15T10:30:00Z",
    "endsAt": "2024-01-16T10:30:00Z"
  },
  "result": null
}
```

### Commit Move
```http
POST /games/:gameId/commit
Authorization: Bearer {token}
Content-Type: application/json

{
  "hashedMove": "0xabcdef1234567890..."
}
```

**Parameters**:
- `hashedMove` (string): Keccak256(move + salt) as hex string

**Response (200 OK)**:
```json
{
  "gameId": "game_abc123",
  "status": "waiting_for_reveal",
  "transactionHash": "0x...",
  "committedAt": "2024-01-15T10:30:30Z"
}
```

### Reveal Move
```http
POST /games/:gameId/reveal
Authorization: Bearer {token}
Content-Type: application/json

{
  "move": 0,
  "salt": "0x1234567890abcdef..."
}
```

**Parameters**:
- `move` (number): 0 (Rock) | 1 (Paper) | 2 (Scissors)
- `salt` (string): Original salt used in commit

**Response (200 OK)**:
```json
{
  "gameId": "game_abc123",
  "status": "finished",
  "result": {
    "winner": "0x...",
    "outcome": "PLAYER_1_WINS",
    "player1Move": "Rock",
    "player2Move": "Scissors",
    "earnedAmount": "0.975",
    "feeTaken": "0.025"
  },
  "finalizedAt": "2024-01-15T10:31:00Z",
  "transactionHash": "0x..."
}
```

### List User Games
```http
GET /games?status=finished&limit=20&offset=0
Authorization: Bearer {token}
```

**Query Parameters**:
- `status` (enum): "active" | "finished" | "cancelled" (optional)
- `limit` (number): Max 100, default 20
- `offset` (number): Pagination offset
- `sortBy` (enum): "recent" | "earnings" (default: "recent")

**Response (200 OK)**:
```json
{
  "games": [
    {
      "gameId": "game_abc123",
      "opponent": "0x...",
      "result": "PLAYER_1_WINS",
      "earnings": "0.975",
      "wager": "1.0",
      "completedAt": "2024-01-15T10:31:00Z"
    }
  ],
  "total": 245,
  "hasMore": true
}
```

---

## User API

### Get Profile
```http
GET /users/:address/profile
Authorization: Bearer {token}
```

**Response (200 OK)**:
```json
{
  "address": "0x...",
  "username": "PlayerOne",
  "avatar": "https://api.neon-rps.io/avatars/...",
  "bio": "Competitive RPS player",
  "socialLinks": {
    "twitter": "https://twitter.com/user",
    "discord": "discord#1234"
  },
  "joinedAt": "2023-12-01T00:00:00Z",
  "isVerified": true
}
```

### Update Profile
```http
PUT /users/:address/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "username": "NewUsername",
  "bio": "Updated bio",
  "avatar": "https://...",
  "socialLinks": {
    "twitter": "https://twitter.com/newuser"
  }
}
```

**Response (200 OK)**:
```json
{
  "success": true,
  "profile": { ... }
}
```

### Get User Stats
```http
GET /users/:address/stats
```

**Response (200 OK)**:
```json
{
  "address": "0x...",
  "stats": {
    "totalGames": 1250,
    "wins": 756,
    "losses": 494,
    "winRate": 0.6048,
    "totalEarnings": "125.43",
    "totalWagered": "1250.00",
    "profit": "125.43",
    "currentStreak": 7,
    "bestStreak": 23,
    "averageWager": "1.0"
  },
  "badges": ["100_wins", "1_eth_earned", "50_game_streak"],
  "rankings": {
    "globalRank": 156,
    "weeklyRank": 12,
    "monthlyRank": 34
  }
}
```

---

## Leaderboard API

### Get Leaderboard
```http
GET /leaderboard?period=weekly&limit=100&offset=0
```

**Query Parameters**:
- `period` (enum): "hourly" | "daily" | "weekly" | "monthly" | "all-time"
- `sortBy` (enum): "earnings" | "wins" | "winRate" (default: "earnings")
- `limit` (number): Max 100, default 50
- `offset` (number): Pagination

**Response (200 OK)**:
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "address": "0x...",
      "username": "TopPlayer",
      "earnings": "523.45",
      "wins": 3124,
      "winRate": 0.7856,
      "badge": "Global Champion"
    }
  ],
  "period": "weekly",
  "generatedAt": "2024-01-15T00:00:00Z",
  "nextUpdate": "2024-01-22T00:00:00Z"
}
```

### Get Tournament Leaderboard
```http
GET /leaderboard/tournaments/:tournamentId
```

**Response (200 OK)**:
```json
{
  "tournament": {
    "id": "tournament_123",
    "name": "Weekly Championship",
    "status": "active",
    "prizePool": "50.0",
    "startedAt": "2024-01-08T00:00:00Z",
    "endsAt": "2024-01-15T00:00:00Z"
  },
  "standings": [
    {
      "rank": 1,
      "address": "0x...",
      "username": "TopPlayer",
      "wins": 8,
      "prize": "25.0"
    }
  ]
}
```

---

## Social API

### Generate Share Card
```http
GET /share/:gameId/og
```

**Response (200 OK)**: Returns Open Graph image (PNG)

**Usage in HTML**:
```html
<meta property="og:image" content="https://api.neon-rps.io/share/game_123/og">
<meta property="og:title" content="I won 0.975 ETH!">
<meta property="og:description" content="Beat my opponent in Neon RPS">
```

### Get Share Metadata
```http
GET /share/:gameId/meta
```

**Response (200 OK)**:
```json
{
  "title": "I won 0.975 ETH in Neon RPS!",
  "description": "I beat my opponent in a game of on-chain Rock Paper Scissors",
  "image": "https://api.neon-rps.io/share/game_123/og",
  "url": "https://neon-rps.vercel.app/game/game_123",
  "twitter": {
    "card": "summary_large_image",
    "creator": "@AgunayaLabs"
  }
}
```

---

## Error Handling

All errors follow a consistent format:

```json
{
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional context"
  }
}
```

### Common Error Codes

| Code | Status | Meaning |
|------|--------|---------|
| `AUTH_REQUIRED` | 401 | No valid token provided |
| `AUTH_EXPIRED` | 401 | Token has expired |
| `INVALID_INPUT` | 400 | Validation error |
| `GAME_NOT_FOUND` | 404 | Game doesn't exist |
| `GAME_INVALID_STATE` | 400 | Invalid state transition |
| `INSUFFICIENT_BALANCE` | 400 | Not enough balance for wager |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |

---

## Rate Limiting

All endpoints are rate-limited to **100 requests per minute per user**.

Response headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1705332600
```

When limit exceeded: **429 Too Many Requests**

---

## Webhooks

Subscribe to game events via webhooks.

### Register Webhook
```http
POST /webhooks
Authorization: Bearer {token}
Content-Type: application/json

{
  "url": "https://yourapp.com/webhook",
  "events": ["game.created", "game.finished", "game.timeout"],
  "secret": "webhook_secret_key"
}
```

### Webhook Payloads

**game.created**:
```json
{
  "event": "game.created",
  "data": {
    "gameId": "game_123",
    "player1": "0x...",
    "player2": "0x...",
    "wager": "1.0",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "signature": "sha256=..."
}
```

**game.finished**:
```json
{
  "event": "game.finished",
  "data": {
    "gameId": "game_123",
    "winner": "0x...",
    "result": "PLAYER_1_WINS",
    "earnings": "0.975",
    "finishedAt": "2024-01-15T10:31:00Z"
  },
  "signature": "sha256=..."
}
```

---

## SDK Examples

### JavaScript/TypeScript
```typescript
import { NeonRPSClient } from '@neon-rps/sdk';

const client = new NeonRPSClient({
  apiKey: 'your_api_key',
  baseUrl: 'https://api.neon-rps.vercel.app/api',
});

// Create game
const game = await client.games.create({
  opponentAddress: '0x...',
  wagerAmount: 1.0,
  tokenType: 'ETH',
});

// Commit move
await client.games.commitMove(game.gameId, {
  hashedMove: '0x...',
});

// Get leaderboard
const leaderboard = await client.leaderboard.get({
  period: 'weekly',
  limit: 50,
});
```

### Python
```python
from neon_rps import NeonRPSClient

client = NeonRPSClient(api_key='your_api_key')

# Create game
game = client.games.create(
    opponent_address='0x...',
    wager_amount=1.0,
    token_type='ETH'
)

# Get user stats
stats = client.users.get_stats(address='0x...')
print(f"Win rate: {stats['win_rate']:.2%}")
```

---

## Changelog

### v1.1.0 (2024-01-15)
- Added webhook support
- Improved leaderboard caching
- Rate limiting per user instead of per IP

### v1.0.0 (2024-01-01)
- Initial API release
