// Minimal auth setup for launch
// Will be replaced with full Better Auth later

export const auth = {
  api: {
    getSession: async ({ headers }: { headers: any }) => {
      // Placeholder for now - in production, get session from Better Auth
      return null
    },
    signOut: async ({ headers }: { headers: any }) => {
      // Placeholder
    },
  },
  handler: async (req: any) => {
    // Placeholder for auth handler
    return new Response('Auth handler', { status: 200 })
  },
}
