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
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
      </head>
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