'use client';

import Link from 'next/link';
import { QrCode, Users, ChefHat, CreditCard } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <ChefHat className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">QR Restaurant</h1>
            </div>
            <nav className="space-x-6">
              <Link href="/admin" className="text-gray-600 hover:text-blue-600">
                Admin
              </Link>
              <Link href="/qr-generator" className="text-gray-600 hover:text-blue-600">
                QR Generator
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Scan, Order, Pay - It's That Simple
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Transform your restaurant experience with our contactless QR ordering system
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <div className="text-center">
            <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <QrCode className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Scan QR Code</h3>
            <p className="text-gray-600">Customers scan the QR code on their table</p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Browse Menu</h3>
            <p className="text-gray-600">View menu items and add to cart</p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <ChefHat className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Place Order</h3>
            <p className="text-gray-600">Order goes directly to kitchen</p>
          </div>
          
          <div className="text-center">
            <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Pay Securely</h3>
            <p className="text-gray-600">Pay with card or Apple Pay</p>
          </div>
        </div>

        {/* Demo Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
          <h3 className="text-2xl font-bold mb-4">Try the Demo</h3>
          <p className="text-gray-600 mb-8">
            Experience the customer journey by scanning a demo QR code
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/table/12" className="btn-primary">
              View Demo Table 12
            </Link>
            <Link href="/qr-generator" className="btn-secondary">
              Generate QR Codes
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; 2025 QR Restaurant Ordering System. Built with Next.js and Vercel.</p>
        </div>
      </footer>
    </div>
  );
}