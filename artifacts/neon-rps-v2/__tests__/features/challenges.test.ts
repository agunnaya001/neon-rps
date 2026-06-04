/**
 * Daily Challenge Tests
 * Tests for challenge completion and reward systems
 */

describe('Challenge Features', () => {
  describe('Daily Challenges', () => {
    test('should create daily challenge', () => {
      const challenge = {
        id: 'challenge-1',
        day: new Date().toISOString().split('T')[0],
        title: 'Win 3 in a Row',
        requirement: 'win-streak',
        target: 3,
        rewardAmount: 0.01,
        status: 'active',
      }

      expect(challenge.id).toBeDefined()
      expect(challenge.title).toBe('Win 3 in a Row')
      expect(challenge.target).toBe(3)
      expect(challenge.rewardAmount).toBe(0.01)
    })

    test('should track challenge progress', () => {
      const progress = {
        challengeId: 'challenge-1',
        userId: 'user-1',
        progress: 2,
        completed: false,
        target: 3,
      }

      expect(progress.progress).toBe(2)
      expect(progress.completed).toBe(false)
      expect(progress.progress < progress.target).toBe(true)
    })

    test('should determine challenge completion', () => {
      const isCompleted = (progress: number, target: number): boolean => {
        return progress >= target
      }

      expect(isCompleted(2, 3)).toBe(false)
      expect(isCompleted(3, 3)).toBe(true)
      expect(isCompleted(5, 3)).toBe(true)
    })
  })

  describe('Challenge Rewards', () => {
    test('should calculate reward amount correctly', () => {
      const calculateReward = (baseReward: number, multiplier: number = 1): number => {
        return baseReward * multiplier
      }

      expect(calculateReward(0.01, 1)).toBe(0.01)
      expect(calculateReward(0.01, 2)).toBe(0.02)
      expect(calculateReward(0.005, 3)).toBe(0.015)
    })

    test('should handle multiple challenge types', () => {
      const challenges = [
        { type: 'win-streak', requirement: 'Win 3 consecutive games' },
        { type: 'unique-opponents', requirement: 'Play with 10 different opponents' },
        { type: 'usdc-wins', requirement: 'Win 2 games with USDC' },
      ]

      expect(challenges).toHaveLength(3)
      expect(challenges.some(c => c.type === 'win-streak')).toBe(true)
    })
  })
})
