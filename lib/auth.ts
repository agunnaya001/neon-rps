import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { pool, db } from './db'
import * as schema from './db/schema'

if (!process.env.BETTER_AUTH_SECRET) {
  throw new Error('BETTER_AUTH_SECRET is not set')
}

const baseURL = process.env.BETTER_AUTH_URL
  ? process.env.BETTER_AUTH_URL
  : process.env.VERCEL_PROJECT_PRODUCTION_URL
  ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
  : process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : 'http://localhost:3000'

const trustedOrigins = [baseURL]

if (process.env.VERCEL_PROJECT_PRODUCTION_URL && baseURL !== `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`) {
  trustedOrigins.push(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
}

if (process.env.VERCEL_URL && baseURL !== `https://${process.env.VERCEL_URL}`) {
  trustedOrigins.push(`https://${process.env.VERCEL_URL}`)
}

// Add localhost for development
if (process.env.NODE_ENV === 'development') {
  trustedOrigins.push('http://localhost:3000')
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema,
  }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL,
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
  },
  advanced: {
    defaultCookieAttributes: {
      sameSite: process.env.NODE_ENV === 'development' ? 'none' : 'lax',
      secure: process.env.NODE_ENV === 'development' ? true : true,
    },
  },
})
