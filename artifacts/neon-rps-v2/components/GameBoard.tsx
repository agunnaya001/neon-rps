'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Hand, Share2, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'

type Move = 'rock' | 'paper' | 'scissors' | null
type Result = 'win' | 'lose' | 'draw' | null

interface GameBoardProps {
  onGameEnd: () => void
  wagerAmount: string
  currency: 'ETH' | 'USDC'
}

export default function GameBoard({ onGameEnd, wagerAmount, currency }: GameBoardProps) {
  const [playerMove, setPlayerMove] = useState<Move>(null)
  const [opponentMove, setOpponentMove] = useState<Move>(null)
  const [result, setResult] = useState<Result>(null)
  const [loading, setLoading] = useState(false)
  const [gameNumber, setGameNumber] = useState(1)

  const moves: { name: 'rock' | 'paper' | 'scissors'; emoji: string }[] = [
    { name: 'rock', emoji: '✊' },
    { name: 'paper', emoji: '✋' },
    { name: 'scissors', emoji: '✌️' },
  ]

  const determineWinner = (player: Move, opponent: Move) => {
    if (player === opponent) return 'draw'
    if (
      (player === 'rock' && opponent === 'scissors') ||
      (player === 'paper' && opponent === 'rock') ||
      (player === 'scissors' && opponent === 'paper')
    ) {
      return 'win'
    }
    return 'lose'
  }

  const handlePlay = async (move: Move) => {
    setLoading(true)
    setPlayerMove(move)

    // Simulate opponent move
    await new Promise((resolve) => setTimeout(resolve, 1000))
    const randomOpponent = moves[Math.floor(Math.random() * moves.length)].name
    setOpponentMove(randomOpponent)

    // Determine result
    const gameResult = determineWinner(move, randomOpponent)
    setResult(gameResult)

    // Show toast notification
    if (gameResult === 'win') {
      toast.success(`You won +${wagerAmount} ${currency}!`)
    } else if (gameResult === 'draw') {
      toast.info('Draw! No change to balance.')
    } else {
      toast.error(`You lost -${wagerAmount} ${currency}`)
    }

    setLoading(false)
  }

  const handlePlayAgain = () => {
    setPlayerMove(null)
    setOpponentMove(null)
    setResult(null)
    setGameNumber(gameNumber + 1)
  }

  const moveEmoji: Record<string, string> = {
    rock: '✊',
    paper: '✋',
    scissors: '✌️',
    null: '❓',
  }

  return (
    <div className="space-y-6">
      {/* Game Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Game #{gameNumber}</h2>
        <p className="text-gray-400">
          Wagering {wagerAmount} {currency}
        </p>
      </div>

      {/* Players */}
      <div className="grid grid-cols-2 gap-8">
        {/* Player Side */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-center"
        >
          <h3 className="text-lg font-bold mb-4 text-cyan-400">You</h3>
          <motion.div
            animate={{ scale: playerMove ? 1.2 : 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="text-6xl mb-4 h-20 flex items-center justify-center"
          >
            {playerMove ? moveEmoji[playerMove] : moveEmoji['null']}
          </motion.div>
          <p className="text-sm text-gray-400 h-6">
            {playerMove && playerMove.charAt(0).toUpperCase() + playerMove.slice(1)}
          </p>
        </motion.div>

        {/* Opponent Side */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-center"
        >
          <h3 className="text-lg font-bold mb-4 text-purple-400">Opponent</h3>
          <motion.div
            animate={{ scale: opponentMove ? 1.2 : 1, rotateY: opponentMove ? 0 : 180 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className="text-6xl mb-4 h-20 flex items-center justify-center"
          >
            {opponentMove ? moveEmoji[opponentMove] : moveEmoji['null']}
          </motion.div>
          <p className="text-sm text-gray-400 h-6">
            {opponentMove && opponentMove.charAt(0).toUpperCase() + opponentMove.slice(1)}
          </p>
        </motion.div>
      </div>

      {/* Result */}
      {result && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`text-center py-6 rounded-lg border-2 ${
            result === 'win'
              ? 'bg-green-900/20 border-green-500/50 text-green-400'
              : result === 'draw'
              ? 'bg-yellow-900/20 border-yellow-500/50 text-yellow-400'
              : 'bg-red-900/20 border-red-500/50 text-red-400'
          }`}
        >
          <p className="text-3xl font-bold mb-2">
            {result === 'win' ? '🎉 You Won!' : result === 'draw' ? '🤝 Draw!' : '😔 You Lost'}
          </p>
          <p className="text-lg">
            {result === 'win'
              ? `+${wagerAmount} ${currency}`
              : result === 'draw'
              ? 'No change'
              : `-${wagerAmount} ${currency}`}
          </p>
        </motion.div>
      )}

      {/* Move Selection */}
      {!result && (
        <div className="grid grid-cols-3 gap-4">
          {moves.map((move) => (
            <motion.button
              key={move.name}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handlePlay(move.name)}
              disabled={loading}
              className={`py-4 rounded-lg font-bold text-lg transition ${
                playerMove === move.name
                  ? 'bg-cyan-600 border-2 border-cyan-400'
                  : 'bg-slate-700 border-2 border-slate-600 hover:border-cyan-500'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <div className="text-3xl mb-2">{move.emoji}</div>
              {move.name.charAt(0).toUpperCase() + move.name.slice(1)}
            </motion.button>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-4">
        {result && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePlayAgain}
            className="flex-1 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-lg flex items-center justify-center gap-2"
          >
            <RotateCcw size={18} />
            Play Again
          </motion.button>
        )}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onGameEnd()}
          className="flex-1 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg flex items-center justify-center gap-2"
        >
          <Share2 size={18} />
          Exit
        </motion.button>
      </div>
    </div>
  )
}
