'use client'

import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navigation = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Jobs', href: '/dashboard/jobs' },
  { name: 'API Keys', href: '/dashboard/api-keys' },
  { name: 'Logs', href: '/dashboard/logs' },
]

const userNavigation = [
  { name: 'Settings', href: '/settings' },
  { name: 'Documentation', href: '/docs' },
]

export default function DashboardLayout({ children }) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl"></div>
      </div>

      {/* Top Navigation Bar */}
      <nav className="nav-modern sticky top-0 z-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between items-center">
            <div className="flex items-center">
              {/* Logo */}
              <div className="flex flex-shrink-0 items-center">
                <Link 
                  href="/" 
                  className="text-xl font-bold text-gradient hover:opacity-80 transition-opacity"
                >
                  ZER08
                </Link>
              </div>
              {/* Main Navigation */}
              <div className="hidden sm:ml-8 sm:flex sm:space-x-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      pathname === item.href
                        ? 'bg-blue-500/20 text-white border border-blue-500/30'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>

            {/* User Menu */}
            <div className="flex items-center">
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center rounded-full bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 p-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 hover:bg-gray-700/50 transition-all duration-300"
                >
                  <span className="sr-only">Open user menu</span>
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-medium">
                    {session?.user?.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 z-10 mt-2 w-56 origin-top-right card-glass py-2">
                    <div className="px-4 py-3 border-b border-gray-700/50">
                      <p className="text-sm text-white font-medium">{session?.user?.name || 'User'}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {session?.user?.email}
                      </p>
                    </div>
                    <div className="py-1">
                      {userNavigation.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="block px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors"
                        >
                          {item.name}
                        </Link>
                      ))}
                      <button
                        onClick={() => signOut({ callbackUrl: '/' })}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700/50 hover:text-white transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  )
} 