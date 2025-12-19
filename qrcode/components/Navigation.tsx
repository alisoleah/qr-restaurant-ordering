'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Home, ShieldCheck, LogOut } from 'lucide-react'

interface NavigationProps {
  currentPage?: 'home' | 'admin' | 'table' | 'checkout' | 'other'
}

export default function Navigation({ currentPage = 'other' }: NavigationProps) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const response = await fetch('/api/admin/auth/logout', {
        method: 'POST',
      })

      if (response.ok) {
        router.push('/admin/login')
        router.refresh()
      }
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-sm z-50" style={{ borderBottom: '1px solid #e5e7eb' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Brand */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition">
              <img
                src="/logo2.png"
                alt="Restaurant Logo"
                width={80}
                height={80}
                className="object-contain"
              />
              <span className="font-semibold text-lg hidden sm:block" style={{ color: '#2E3A45' }}>Restaurant</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="flex items-center space-x-2 px-4 py-2 rounded-lg transition"
              style={currentPage === 'home'
                ? { backgroundColor: 'rgba(0, 194, 203, 0.1)', color: '#00C2CB' }
                : { color: '#2E3A45' }}
              onMouseEnter={(e) => {
                if (currentPage !== 'home') {
                  e.currentTarget.style.backgroundColor = '#F8F9FA';
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== 'home') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:inline">Home</span>
            </Link>

            <Link
              href="/admin"
              className="flex items-center space-x-2 px-4 py-2 rounded-lg transition"
              style={currentPage === 'admin'
                ? { backgroundColor: 'rgba(0, 194, 203, 0.1)', color: '#00C2CB' }
                : { color: '#2E3A45' }}
              onMouseEnter={(e) => {
                if (currentPage !== 'admin') {
                  e.currentTarget.style.backgroundColor = '#F8F9FA';
                }
              }}
              onMouseLeave={(e) => {
                if (currentPage !== 'admin') {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <ShieldCheck className="w-5 h-5" />
              <span className="hidden sm:inline">Admin</span>
            </Link>

            {/* Logout button - only show on admin pages */}
            {currentPage === 'admin' && (
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ color: '#2E3A45' }}
                onMouseEnter={(e) => {
                  if (!isLoggingOut) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 107, 107, 0.1)';
                    e.currentTarget.style.color = '#FF6B6B';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isLoggingOut) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#2E3A45';
                  }
                }}
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
