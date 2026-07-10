# RPS API Quick Reference

## Base URL
```
Production: https://rps-api.vercel.app
Development: http://localhost:3001
```

---

## Leaderboard

### GET /api/leaderboard
Fetch global rankings with player stats.

**Query Parameters:**
- `page` (default: 1) - Page number
- `limit` (default: 50) - Results per page
- `metric` (default: win_rate) - Sort by: `win_rate`, `earnings`, `volume`
- `timeframe` (default: all) - Filter: `all`, `week`, `month`

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "rank": 1,
      "walletAddress": "0x...",
      "displayName": "Champion",
      "totalGames": 150,
      "totalWins": 135,
      "winRate": "90.00",
      "totalEarnings": "5000000000000000000",
      "currentStreak": 12,
      "bestStreak": 25
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 1000,
    "pages": 20
  }
}
```

---

## Achievements

### GET /api/achievements
Fetch all achievements or specific player's unlock status.

**Query Parameters:**
- `wallet` (optional) - Player wallet address to filter

**Response (Without Wallet):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "First Victory",
      "description": "Win your first RPS game",
      "rarity": "common"
    }
  ]
}
```

**Response (With Wallet):**
```json
{
  "success": true,
  "data": {
    "total": 14,
    "unlocked": 3,
    "achievements": [
      {
        "id": 1,
        "name": "First Victory",
        "description": "Win your first RPS game",
        "rarity": "common",
        "unlocked": true,
        "unlockedAt": "2024-07-10T12:00:00Z"
      }
    ]
  }
}
```

### POST /api/achievements
Create new player or apply referral code.

**Request:**
```json
{
  "walletAddress": "0x...",
  "referralCode": "ABC12345" // optional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 123,
    "walletAddress": "0x...",
    "referralCode": "XYZ98765"
  }
}
```

---

## Referrals

### GET /api/referrals
Get referral code, earned rewards, and referred players.

**Query Parameters:**
- `wallet` (required) - Player wallet address

**Response:**
```json
{
  "success": true,
  "data": {
    "referralCode": "ABC12345",
    "totalReferred": 5,
    "totalEarned": "500000000000000000",
    "pendingRewards": "50000000000000000",
    "referredPlayers": [
      {
        "id": 456,
        "walletAddress": "0x...",
        "displayName": "Player Name",
        "totalGames": 20,
        "referredAt": "2024-06-15T10:00:00Z"
      }
    ],
    "recentRewards": [
      {
        "id": 789,
        "rewardAmount": "10000000000000000",
        "status": "completed",
        "createdAt": "2024-07-10T14:30:00Z"
      }
    ]
  }
}
```

---

## Games

### GET /api/games
Get game history for a player.

**Query Parameters:**
- `wallet` (required) - Player wallet address
- `page` (default: 1) - Page number
- `limit` (default: 20) - Results per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "onChainGameId": "123456",
      "gameType": "single",
      "betAmount": "1000000000000000000",
      "payoutAmount": "1950000000000000000",
      "feeAmount": "50000000000000000",
      "status": "completed",
      "completedAt": "2024-07-10T12:00:00Z",
      "player1": "0x..."
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

### POST /api/games
Record a completed game from on-chain.

**Request:**
```json
{
  "onChainGameId": "123456",
  "contractAddress": "0x2F2e814aFd9DEb94a23b990725E5C6EF67fC7AAD",
  "gameType": "single",
  "player1Wallet": "0x...",
  "player2Wallet": "0x...",
  "betAmount": "1000000000000000000",
  "winnerWallet": "0x...",
  "feeAmount": "50000000000000000",
  "payoutAmount": "1950000000000000000"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "onChainGameId": "123456",
    "status": "completed",
    "completedAt": "2024-07-10T12:00:00Z"
  }
}
```

---

## Tournaments

### GET /api/tournaments
Fetch tournaments by status.

**Query Parameters:**
- `status` (default: registration) - `registration`, `in_progress`, `completed`, `cancelled`
- `page` (default: 1) - Page number
- `limit` (default: 20) - Results per page

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Summer Championship",
      "description": "Compete for the grand prize",
      "status": "registration",
      "maxPlayers": 32,
      "participantCount": 24,
      "entryFee": "1000000000000000000",
      "prizePool": "50000000000000000000",
      "tournamentType": "single_elimination",
      "createdAt": "2024-07-01T00:00:00Z"
    }
  ]
}
```

### POST /api/tournaments
Create a new tournament.

**Request:**
```json
{
  "name": "Summer Championship",
  "description": "Compete for the grand prize",
  "tournamentType": "single_elimination",
  "maxPlayers": 32,
  "entryFee": "1000000000000000000",
  "prizePool": "50000000000000000000",
  "creatorWallet": "0x..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Summer Championship",
    "status": "registration",
    "createdAt": "2024-07-10T12:00:00Z"
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": "Validation error",
  "details": [{"message": "wallet is required"}]
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Player not found"
}
```

### 500 Server Error
```json
{
  "success": false,
  "error": "Failed to fetch leaderboard"
}
```

---

## Common Conversions

**ETH to Wei:** Multiply by `1e18`
- Example: `1 ETH = 1000000000000000000 wei`

**Wei to ETH:** Divide by `1e18`
- Example: `1000000000000000000 wei = 1 ETH`

---

## Headers

All requests should include:
```
Content-Type: application/json
```

CORS is enabled for all origins:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

---

## Rate Limiting

No rate limits currently configured. Implement based on deployment needs.

---

## WebSocket Support

Currently only REST API available. WebSocket support can be added for:
- Real-time leaderboard updates
- Live tournament bracket progression
- Instant referral reward notifications

---

## Example Usage

### TypeScript/React
```typescript
const response = await fetch(
  'https://rps-api.vercel.app/api/leaderboard?page=1&limit=50&metric=win_rate'
);
const { data, pagination } = await response.json();
console.log(data);
```

### Python
```python
import requests

response = requests.get(
    'https://rps-api.vercel.app/api/leaderboard',
    params={'page': 1, 'limit': 50, 'metric': 'win_rate'}
)
data = response.json()
print(data['data'])
```

### cURL
```bash
curl -X GET "https://rps-api.vercel.app/api/leaderboard?page=1&limit=50&metric=win_rate" \
  -H "Content-Type: application/json"
```

---

## Last Updated
July 10, 2026

## API Version
v1.0.0 (Production Ready)
