import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0f0f23',
        foreground: '#ffffff',
        primary: '#00ff88',
        secondary: '#00ccff',
        accent: '#ff006e',
        muted: '#666666',
        border: '#333333',
      },
    },
  },
  plugins: [],
}

export default config
