import { Inter } from 'next/font/google'
import './globals.css'
import { OrderProviderWrapper } from './OrderProviderWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'QR Restaurant Ordering',
  description: 'Scan, Order, Pay - Simple restaurant ordering system',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <OrderProviderWrapper>
          <div className="min-h-screen bg-gray-50">
            {children}
          </div>
        </OrderProviderWrapper>
      </body>
    </html>
  )
}