import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Space_Grotesk, IBM_Plex_Mono } from 'next/font/google'
import { SiteNav, SiteFooter } from '@/components/site-shell'
import { WalletProviders } from '@/components/wallet-provider'
import './globals.css'

const space = Space_Grotesk({ subsets: ['latin'], variable: '--font-space' })
const plex = IBM_Plex_Mono({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-plex' })

export const metadata: Metadata = {
  title: { default: 'Classical — The Proof of Computing Launchpad', template: '%s | Classical' },
  description: 'Launch Solana tokens with their own computing laboratory. Explore SHA-256 fingerprints, bit-flip experiments, classical algorithms, and clearly labeled quantum-gate simulations.',
  applicationName: 'Classical',
  icons: { icon: '/icon', apple: '/icon' },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#090a0b',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`dark bg-background ${space.variable} ${plex.variable}`}>
      <body className="font-sans antialiased">
        <WalletProviders>
          <SiteNav />
          {children}
          <SiteFooter />
        </WalletProviders>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
