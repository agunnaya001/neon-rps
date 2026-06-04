/**
 * Test setup and utilities for Neon RPS
 */

export const testConfig = {
  baseURL: 'http://localhost:3000',
  timeout: 10000,
  testUser: {
    email: 'test@neonrps.xyz',
    password: 'TestPassword123!',
    name: 'Test Player',
  },
  testWallet: '0x1234567890123456789012345678901234567890',
}

export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const expectElementToBeVisible = (element: HTMLElement | null) => {
  if (!element) throw new Error('Element not found')
  const style = window.getComputedStyle(element)
  return style.display !== 'none' && style.visibility !== 'hidden'
}

export const expectRoute = (pathname: string) => {
  const currentPath = window.location.pathname
  if (currentPath !== pathname) {
    throw new Error(`Expected route ${pathname}, got ${currentPath}`)
  }
}
