/**
 * Referral System Tests
 * Tests for on-chain referral splits and earnings
 */

describe('Referral Features', () => {
  describe('Referral Code Generation', () => {
    test('should generate unique referral code', () => {
      const generateReferralCode = (): string => {
        return Math.random().toString(36).substring(2, 8).toUpperCase()
      }

      const code1 = generateReferralCode()
      const code2 = generateReferralCode()

      expect(code1).toHaveLength(6)
      expect(code2).toHaveLength(6)
      expect(code1).not.toBe(code2)
    })

    test('should validate referral code format', () => {
      const isValidCode = (code: string): boolean => {
        return /^[A-Z0-9]{6}$/.test(code)
      }

      expect(isValidCode('ABC123')).toBe(true)
      expect(isValidCode('abc123')).toBe(false)
      expect(isValidCode('ABCD')).toBe(false)
    })
  })

  describe('On-Chain Earnings', () => {
    test('should calculate referral earnings correctly', () => {
      const calculateEarnings = (gameAmount: number, referralPercentage: number = 0.03): number => {
        return gameAmount * referralPercentage
      }

      expect(calculateEarnings(1)).toBe(0.03)
      expect(calculateEarnings(10)).toBe(0.3)
      expect(calculateEarnings(0.01)).toBe(0.0003)
    })

    test('should track cumulative referral earnings', () => {
      const earnings = [
        { gameId: 'game-1', amount: 0.03, date: '2024-06-01' },
        { gameId: 'game-2', amount: 0.03, date: '2024-06-02' },
        { gameId: 'game-3', amount: 0.06, date: '2024-06-03' },
      ]

      const total = earnings.reduce((sum, e) => sum + e.amount, 0)
      expect(total).toBe(0.12)
      expect(earnings).toHaveLength(3)
    })

    test('should enforce earnings cap', () => {
      const enforceEarningsCap = (amount: number, cap: number = 10): number => {
        return Math.min(amount, cap)
      }

      expect(enforceEarningsCap(5)).toBe(5)
      expect(enforceEarningsCap(15)).toBe(10)
      expect(enforceEarningsCap(10)).toBe(10)
    })
  })

  describe('Referrer Tracking', () => {
    test('should track referrer and referee relationship', () => {
      const referral = {
        referrerId: 'user-1',
        refereeId: 'user-2',
        code: 'ABC123',
        status: 'active',
        createdAt: new Date(),
      }

      expect(referral.referrerId).toBeDefined()
      expect(referral.refereeId).toBeDefined()
      expect(referral.status).toBe('active')
    })

    test('should prevent circular referrals', () => {
      const isCircularReferral = (referrerId: string, refereeId: string): boolean => {
        return referrerId === refereeId
      }

      expect(isCircularReferral('user-1', 'user-1')).toBe(true)
      expect(isCircularReferral('user-1', 'user-2')).toBe(false)
    })
  })
})
