import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { StoreProvider } from '@/contexts/StoreContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Store',
  description: 'Best products in India',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <StoreProvider>
          {children}
        </StoreProvider>
      </body>
    </html>
  )
}
