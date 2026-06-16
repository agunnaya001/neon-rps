import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({ subsets: ['latin'] })
const geistMono = Geist_Mono({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Neon RPS - On-Chain Rock Paper Scissors',
  description: 'Play Rock Paper Scissors on-chain with ETH and USDC, earn rewards, join tournaments',
  metadataBase: new URL('https://neonrps.xyz'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://neonrps.xyz',
    title: 'Neon RPS - On-Chain Rock Paper Scissors',
    description: 'Play Rock Paper Scissors on-chain with tournaments, daily challenges, and referral rewards',
    siteName: 'Neon RPS',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    themeColor: '#0f0f23',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${geistSans.className} ${geistMono.className}`}>
      <body>{children}</body>
    </html>
  )
}
