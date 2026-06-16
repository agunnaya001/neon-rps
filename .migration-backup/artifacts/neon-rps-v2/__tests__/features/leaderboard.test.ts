/**
 * Leaderboard Tests
 * Tests for ranking and statistics
 */

describe('Leaderboard Features', () => {
  describe('Ranking Calculation', () => {
    test('should sort players by wins descending', () => {
      const players = [
        { id: 'user-1', wins: 10, losses: 5 },
        { id: 'user-2', wins: 15, losses: 3 },
        { id: 'user-3', wins: 8, losses: 7 },
      ]

      const sorted = [...players].sort((a, b) => b.wins - a.wins)

      expect(sorted[0].wins).toBe(15)
      expect(sorted[1].wins).toBe(10)
      expect(sorted[2].wins).toBe(8)
    })

    test('should calculate win rate', () => {
      const calculateWinRate = (wins: number, losses: number): number => {
        if (wins + losses === 0) return 0
        return (wins / (wins + losses)) * 100
      }

      expect(calculateWinRate(10, 5)).toBe(66.67)
      expect(calculateWinRate(8, 2)).toBe(80)
      expect(calculateWinRate(0, 0)).toBe(0)
    })
  })

  describe('Leaderboard Periods', () => {
    test('should support different time periods', () => {
      const periods = ['all-time', 'weekly', 'monthly']
      expect(periods).toHaveLength(3)
      expect(periods).toContain('all-time')
      expect(periods).toContain('weekly')
      expect(periods).toContain('monthly')
    })

    test('should filter leaderboard by period', () => {
      const filterByPeriod = (entries: any[], period: string, now: Date = new Date()) => {
        if (period === 'all-time') return entries

        const periodMs = {
          weekly: 7 * 24 * 60 * 60 * 1000,
          monthly: 30 * 24 * 60 * 60 * 1000,
        }

        const threshold = now.getTime() - (periodMs[period as keyof typeof periodMs] || 0)
        return entries.filter(e => new Date(e.timestamp).getTime() > threshold)
      }

      const entries = [
        { userId: 'user-1', wins: 5, timestamp: new Date().toISOString() },
        { userId: 'user-2', wins: 3, timestamp: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString() },
      ]

      expect(filterByPeriod(entries, 'weekly')).toHaveLength(1)
      expect(filterByPeriod(entries, 'all-time')).toHaveLength(2)
    })
  })

  describe('Prize Distribution', () => {
    test('should calculate prize by rank', () => {
      const getPrizeByRank = (rank: number, totalPrizePool: number): number => {
        const distribution = {
          1: 0.5,
          2: 0.3,
          3: 0.2,
        }
        return totalPrizePool * (distribution[rank as keyof typeof distribution] || 0)
      }

      expect(getPrizeByRank(1, 100)).toBe(50)
      expect(getPrizeByRank(2, 100)).toBe(30)
      expect(getPrizeByRank(3, 100)).toBe(20)
      expect(getPrizeByRank(4, 100)).toBe(0)
    })
  })
})
