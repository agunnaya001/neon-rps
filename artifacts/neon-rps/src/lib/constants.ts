// Color Palette
export const COLORS = {
  primary: '#00ff88',      // Neon Green
  secondary: '#00ccff',    // Cyan
  accent: '#ff006e',       // Pink/Magenta
  purple: '#a855f7',       // Purple
  background: '#0f0f23',   // Dark background
  foreground: '#ffffff',   // White text
  muted: '#666666',        // Gray text
  border: '#2a2a4a',       // Border color
  card: '#1a1a3a',         // Card background
} as const

// Color opacity variants
export const COLOR_VARIANTS = {
  primary: {
    base: COLORS.primary,
    bg: 'rgba(0,255,136,0.06)',
    bgDark: 'rgba(0,255,136,0.08)',
    bgHover: 'rgba(0,255,136,0.15)',
    shadow: 'rgba(0,255,136,0.3)',
  },
  secondary: {
    base: COLORS.secondary,
    bg: 'rgba(0,204,255,0.06)',
    bgDark: 'rgba(0,204,255,0.08)',
    bgHover: 'rgba(0,204,255,0.15)',
    shadow: 'rgba(0,204,255,0.3)',
  },
  accent: {
    base: COLORS.accent,
    bg: 'rgba(255,0,110,0.06)',
    bgDark: 'rgba(255,0,110,0.08)',
    bgHover: 'rgba(255,0,110,0.15)',
    shadow: 'rgba(255,0,110,0.3)',
  },
  purple: {
    base: COLORS.purple,
    bg: 'rgba(168,85,247,0.06)',
    bgDark: 'rgba(168,85,247,0.08)',
    bgHover: 'rgba(168,85,247,0.15)',
    shadow: 'rgba(168,85,247,0.3)',
  },
} as const

// Game Modes
export const GAME_MODES = {
  QUICK: 'quick',
  TOURNAMENT: 'tournament',
  CHALLENGE: 'challenge',
} as const

// Wager amounts and fees
export const GAME_CONFIG = {
  PROTOCOL_FEE_PERCENT: 2.5,
  MIN_WAGER: 0.001,
  MAX_WAGER: 1000,
  WIN_MULTIPLIER: 1.9,
} as const

// API Endpoints
export const API_ENDPOINTS = {
  BASE_URL: 'https://api.neon-rps.xyz',
  LEADERBOARD: '/leaderboard',
  TOURNAMENTS: '/tournaments',
  CHALLENGES: '/challenges',
  USER_STATS: '/user/stats',
  USER_HISTORY: '/user/history',
} as const

// Routes
export const ROUTES = {
  HOME: '/',
  PLAY: '/play',
  LEADERBOARD: '/leaderboard',
  TOURNAMENTS: '/tournaments',
  CHALLENGES: '/challenges',
  BATTLE_PASS: '/battle-pass',
} as const

// UI Constants
export const UI = {
  ANIMATION_DURATION: 300,
  TOAST_DURATION: 3000,
  POLL_INTERVAL: 5000,
} as const

// Sorting options for leaderboard
export const LEADERBOARD_SORTS = {
  WINS: 'wins',
  EARNINGS: 'earnings',
  WIN_RATE: 'winRate',
} as const

// Error messages
export const ERROR_MESSAGES = {
  WALLET_NOT_INSTALLED: 'Please install MetaMask or another Web3 wallet to play.',
  WALLET_CONNECTION_FAILED: 'Failed to connect wallet. Please try again.',
  NETWORK_ERROR: 'Network error. Please try again.',
  INVALID_WAGER: 'Invalid wager amount.',
  INSUFFICIENT_BALANCE: 'Insufficient balance to place this wager.',
} as const
