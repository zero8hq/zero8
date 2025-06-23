'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'

const getErrorMessage = (error) => {
  switch (error) {
    case 'Configuration':
      return 'There is a problem with the server configuration. Please try again later.'
    case 'AccessDenied':
      return 'Access denied. You do not have permission to access this resource.'
    case 'Verification':
      return 'The verification link may have expired or has already been used.'
    default:
      return 'An unexpected error occurred. Please try again.'
  }
}

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const errorMessage = getErrorMessage(error)

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-gray-900 rounded-xl border border-gray-800">
      <div className="text-center">
        <Link 
          href="/" 
          className="text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
        >
          ZER08
        </Link>
        <h2 className="mt-6 text-3xl font-semibold text-white">Authentication Error</h2>
      </div>

      <div className="p-4 bg-red-900/50 border border-red-800 rounded-lg">
        <p className="text-red-400">{errorMessage}</p>
      </div>

      <div className="flex flex-col space-y-4">
        <Link
          href="/signin"
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
        >
          Try signing in again
        </Link>
        <Link
          href="/"
          className="w-full flex justify-center py-3 px-4 border border-gray-700 rounded-lg text-gray-300 hover:bg-gray-800 transition-colors"
        >
          Return home
        </Link>
      </div>
    </div>
  )
}

// Loading fallback that matches the error UI structure
function LoadingFallback() {
  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-gray-900 rounded-xl border border-gray-800">
      <div className="text-center">
        <div className="text-2xl font-bold tracking-tight text-transparent">ZER08</div>
        <h2 className="mt-6 text-3xl font-semibold text-white">Loading...</h2>
      </div>
      <div className="animate-pulse">
        <div className="h-20 bg-gray-800 rounded-lg"></div>
      </div>
      <div className="space-y-4">
        <div className="h-12 bg-gray-800 rounded-lg"></div>
        <div className="h-12 bg-gray-800 rounded-lg"></div>
      </div>
    </div>
  )
}

export default function AuthError() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ErrorContent />
    </Suspense>
  )
} 