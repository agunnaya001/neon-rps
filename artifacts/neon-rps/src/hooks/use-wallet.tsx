import { useState, useEffect, useCallback } from 'react'
import { WalletState } from '@/types'
import { ERROR_MESSAGES } from '@/lib/constants'

export const useWallet = () => {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    isConnected: false,
    isConnecting: false,
    error: null,
  })

  // Check for existing wallet connection on mount
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (typeof window === 'undefined' || !(window as any).ethereum) {
        return
      }

      try {
        const accounts = await (window as any).ethereum.request({
          method: 'eth_accounts',
        })

        if (accounts.length > 0) {
          setWalletState(prev => ({
            ...prev,
            address: accounts[0],
            isConnected: true,
            error: null,
          }))
        }
      } catch (error) {
        console.error('[neon-rps] Wallet check error:', error)
      }
    }

    checkWalletConnection()
  }, [])

  // Handle wallet connection
  const connectWallet = useCallback(async () => {
    if (typeof window === 'undefined') return

    // Check if wallet is installed
    if (!(window as any).ethereum) {
      setWalletState(prev => ({
        ...prev,
        error: ERROR_MESSAGES.WALLET_NOT_INSTALLED,
      }))
      return
    }

    setWalletState(prev => ({
      ...prev,
      isConnecting: true,
      error: null,
    }))

    try {
      const accounts = await (window as any).ethereum.request({
        method: 'eth_requestAccounts',
      })

      if (accounts.length > 0) {
        setWalletState({
          address: accounts[0],
          isConnected: true,
          isConnecting: false,
          error: null,
        })
      }
    } catch (error: any) {
      console.error('[neon-rps] Wallet connection error:', error)

      // Handle user rejection gracefully
      if (error.code === 4001) {
        setWalletState(prev => ({
          ...prev,
          isConnecting: false,
          error: 'Connection request was rejected',
        }))
      } else {
        setWalletState(prev => ({
          ...prev,
          isConnecting: false,
          error: ERROR_MESSAGES.WALLET_CONNECTION_FAILED,
        }))
      }
    }
  }, [])

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setWalletState({
      address: null,
      isConnected: false,
      isConnecting: false,
      error: null,
    })
  }, [])

  // Get formatted address
  const formattedAddress = walletState.address
    ? `${walletState.address.slice(0, 6)}...${walletState.address.slice(-4)}`
    : null

  return {
    ...walletState,
    formattedAddress,
    connectWallet,
    disconnectWallet,
  }
}
