'use client';

import Link from 'next/link';
import { QrCode, Users, ChefHat, CreditCard } from 'lucide-react';

export default function DemoPage() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(to bottom right, #F8F9FA, #e8f5f6)' }}>
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <img
                src="/logo2.png"
                alt="Restaurant Logo"
                width={80}
                height={80}
                className="object-contain"
              />
              <h1 className="text-2xl font-bold" style={{ color: '#2E3A45' }}>QR Restaurant</h1>
            </div>
            <nav className="space-x-6">
              <Link href="/admin" style={{ color: '#6e7c8b' }} className="hover:opacity-80 transition-opacity">
                Admin
              </Link>
              <Link href="/qr-generator" style={{ color: '#6e7c8b' }} className="hover:opacity-80 transition-opacity">
                QR Generator
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4" style={{ color: '#2E3A45' }}>
            Scan, Order, Pay - It's That Simple
          </h2>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: '#6e7c8b' }}>
            Transform your restaurant experience with our contactless QR ordering system
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#00C2CB' }}>
              <QrCode className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#2E3A45' }}>Scan QR Code</h3>
            <p style={{ color: '#6e7c8b' }}>Customers scan the QR code on their table</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#FF6B6B' }}>
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#2E3A45' }}>Browse Menu</h3>
            <p style={{ color: '#6e7c8b' }}>View menu items and add to cart</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#00C2CB' }}>
              <ChefHat className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#2E3A45' }}>Place Order</h3>
            <p style={{ color: '#6e7c8b' }}>Order goes directly to kitchen</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#FF6B6B' }}>
              <CreditCard className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2" style={{ color: '#2E3A45' }}>Pay Securely</h3>
            <p style={{ color: '#6e7c8b' }}>Pay with card or Apple Pay</p>
          </div>
        </div>

        {/* Demo Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-4" style={{ color: '#2E3A45' }}>Try the Demo</h3>
          <p className="mb-8" style={{ color: '#6e7c8b' }}>
            Experience the complete restaurant ordering system
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/table/12" className="btn-primary">
              🍽️ Table Menu
            </Link>
            <Link href="/bill-split/12" className="btn-secondary">
              👥 Split Bill
            </Link>
            <Link href="/admin" className="btn-secondary">
              👨‍💼 Admin Dashboard
            </Link>
            <Link href="/qr-generator" className="btn-secondary">
              📱 QR Generator
            </Link>
          </div>
          <div className="mt-6 text-sm" style={{ color: '#6e7c8b' }}>
            <p>✨ <strong style={{ color: '#2E3A45' }}>New:</strong> Try the bill splitting feature - perfect for groups!</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8" style={{ backgroundColor: '#2E3A45', color: '#FFFFFF' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 QR Restaurant Ordering System. Built with Next.js and Vercel.</p>
        </div>
      </footer>
    </div>
  );
}
