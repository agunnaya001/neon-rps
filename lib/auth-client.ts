import { createAuthClient } from 'better-auth/react'

export const { signUp, signIn, signOut, useSession, getSession } = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
})
