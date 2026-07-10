import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'RPS Game API',
  description: 'Backend API for Rock-Paper-Scissors on-chain gaming',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
