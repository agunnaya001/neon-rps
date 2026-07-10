import { useState, useCallback, useMemo } from 'react'
import { GameStats, GameMode } from '@/types'
import { GAME_CONFIG } from '@/lib/constants'

interface UseGameOptions {
  initialMode?: GameMode
  initialWager?: string
  initialWagerType?: 'eth' | 'usdc'
}

export const useGame = (options: UseGameOptions = {}) => {
  const {
    initialMode = null,
    initialWager = '0.01',
    initialWagerType = 'eth',
  } = options

  const [gameMode, setGameMode] = useState<GameMode | null>(initialMode)
  const [wagerAmount, setWagerAmount] = useState(initialWager)
  const [wagerType, setWagerType] = useState<'eth' | 'usdc'>(initialWagerType)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Validate wager amount
  const validateWager = useCallback((amount: string): boolean => {
    const num = parseFloat(amount)
    if (isNaN(num)) return false
    if (num < GAME_CONFIG.MIN_WAGER || num > GAME_CONFIG.MAX_WAGER) return false
    return true
  }, [])

  // Calculate potential winnings
  const potentialWinnings = useMemo(() => {
    if (!wagerAmount || !validateWager(wagerAmount)) return '0'
    const wager = parseFloat(wagerAmount)
    const fee = wager * (GAME_CONFIG.PROTOCOL_FEE_PERCENT / 100)
    const winnings = wager * GAME_CONFIG.WIN_MULTIPLIER - fee
    return winnings.toFixed(3)
  }, [wagerAmount, validateWager])

  // Calculate fee
  const protocolFee = useMemo(() => {
    if (!wagerAmount || !validateWager(wagerAmount)) return '0'
    const wager = parseFloat(wagerAmount)
    const fee = wager * (GAME_CONFIG.PROTOCOL_FEE_PERCENT / 100)
    return fee.toFixed(4)
  }, [wagerAmount, validateWager])

  // Start game
  const startGame = useCallback(async (mode: GameMode) => {
    if (!validateWager(wagerAmount)) {
      setError('Invalid wager amount')
      return false
    }

    setGameMode(mode)
    setIsLoading(true)
    setError(null)

    try {
      // Simulated API call - replace with actual game initiation
      await new Promise(resolve => setTimeout(resolve, 500))
      setIsLoading(false)
      return true
    } catch (err) {
      setError('Failed to start game')
      setIsLoading(false)
      return false
    }
  }, [wagerAmount, validateWager])

  // Reset game state
  const resetGame = useCallback(() => {
    setGameMode(null)
    setWagerAmount(initialWager)
    setWagerType(initialWagerType)
    setIsLoading(false)
    setError(null)
  }, [initialWager, initialWagerType])

  // Clear error
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    // State
    gameMode,
    wagerAmount,
    wagerType,
    isLoading,
    error,

    // Computed values
    potentialWinnings,
    protocolFee,
    isValidWager: validateWager(wagerAmount),

    // Methods
    setGameMode,
    setWagerAmount,
    setWagerType,
    startGame,
    resetGame,
    clearError,
    validateWager,
  }
}
