'use client'

import { useSession } from 'next-auth/react'
import Link from 'next/link'

const stats = [
  { name: 'Active Jobs', value: '0' },
  { name: 'Total Executions', value: '0' },
  { name: 'Success Rate', value: '0%' },
  { name: 'API Keys', value: '0' },
]

const quickActions = [
  {
    name: 'Create Job',
    description: 'Set up a new scheduled webhook',
    href: '/dashboard/jobs/new',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  {
    name: 'Generate API Key',
    description: 'Create a new API key for your applications',
    href: '/dashboard/api-keys/new',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1721 9z" />
      </svg>
    ),
  },
  {
    name: 'View Documentation',
    description: 'Learn how to integrate ZER08 into your applications',
    href: '/docs',
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
      </svg>
    ),
  },
]

export default function Dashboard() {
  const { data: session } = useSession()

  return (
    <div className="space-y-12">
      {/* Welcome Section */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-white">
          Welcome back, {session?.user?.name || session?.user?.email?.split('@')[0] || 'User'}
        </h1>
        <p className="text-lg text-gray-400">
          Here's what's happening with your scheduled jobs.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <div
            key={stat.name}
            className="card p-6 group"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <dt className="text-sm font-medium text-gray-400 mb-3">{stat.name}</dt>
            <dd className="text-3xl font-bold text-white group-hover:text-gradient transition-all duration-300">{stat.value}</dd>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-white">Quick Actions</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {quickActions.map((action, index) => (
            <Link
              key={action.name}
              href={action.href}
              className="card p-6 group"
              style={{ animationDelay: `${(index + 4) * 0.1}s` }}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0 p-3 bg-blue-500/20 rounded-xl text-blue-400 group-hover:bg-blue-500/30 group-hover:text-blue-300 transition-all duration-300">
                  {action.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-white group-hover:text-gradient transition-all duration-300 mb-2">
                    {action.name}
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="space-y-8">
        <h2 className="text-2xl font-bold text-white">Recent Activity</h2>
        <div className="card p-12 text-center" style={{ animationDelay: '0.7s' }}>
          <div className="w-20 h-20 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-white mb-3">No activity yet</h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Your scheduled jobs and API activity will appear here once you start using ZER08.
          </p>
          <Link href="/dashboard/jobs/new" className="btn-primary inline-flex items-center px-6 py-3">
            Create your first job
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
} 