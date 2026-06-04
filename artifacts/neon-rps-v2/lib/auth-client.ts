'use client'

import { useEffect, useState } from 'react'

// Minimal auth client for launch
export interface User {
  id: string
  email: string
  name?: string
  image?: string
}

export interface Session {
  user: User | null
}

// Mock auth client - replace with real implementation
export const signUp = {
  email: async ({ name, email, password }: any) => {
    // TODO: Implement real sign-up
    return { success: false, error: 'Not implemented' }
  },
}

export const signIn = {
  email: async ({ email, password }: any) => {
    // TODO: Implement real sign-in
    return { success: false, error: 'Not implemented' }
  },
}

export const signOut = async () => {
  // TODO: Implement real sign-out
}

export const useSession = () => {
  const [data, setData] = useState<Session | null>(null)
  const [isPending, setIsPending] = useState(true)

  useEffect(() => {
    // Simulate loading
    setData(null)
    setIsPending(false)
  }, [])

  return { data, isPending }
}
