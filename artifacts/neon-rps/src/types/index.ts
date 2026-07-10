// Wallet types
export interface WalletState {
  address: string | null
  isConnected: boolean
  isConnecting: boolean
  error: string | null
}

// Game types
export type GameMode = 'quick' | 'tournament' | 'challenge'

export interface GameStats {
  wins: number
  losses: number
  winRate: number
  earnings: string
  wagerAmount: string
  wagerType: 'eth' | 'usdc'
}

export interface Player {
  address: string
  wins: number
  losses: number
  earnings: string
  rank: number
  winRate: number
  lastPlayed: string
  avatar?: string
}

export interface LeaderboardEntry extends Player {
  position: number
}

export interface Tournament {
  id: string
  name: string
  status: 'open' | 'active' | 'completed'
  prizePool: string
  participants: number
  maxParticipants: number
  createdAt: string
  startsAt: string
  endsAt: string
}

export interface Challenge {
  id: string
  type: 'daily' | 'weekly' | 'seasonal'
  title: string
  description: string
  reward: string
  completed: boolean
  progress?: number
  maxProgress?: number
  endsAt: string
}

export interface BattlePass {
  season: number
  level: number
  maxLevel: number
  experience: number
  rewards: BattlePassReward[]
}

export interface BattlePassReward {
  id: string
  level: number
  name: string
  type: 'cosmetic' | 'currency' | 'nft'
  claimed: boolean
}

// API Response types
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

// Component props
export interface LayoutProps {
  children: React.ReactNode
  activePath?: string
}

export interface StatCardProps {
  label: string
  value: string
  subtext: string
  color: string
}

export interface ModeCardProps {
  id: GameMode
  icon: React.ComponentType<{ size: number; style?: React.CSSProperties }>
  label: string
  sub: string
  color: string
  tags: string[]
  onClick: (mode: GameMode) => void
}

export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  color?: string
}

export interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}
