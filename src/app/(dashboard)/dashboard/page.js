"use client";

import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="mt-20 h-full bg-[#111111] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400 text-sm">Manage your API keys and scheduled jobs from a central location.</p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Main Navigation Cards */}
          <div className="lg:col-span-2 space-y-6 flex flex-col gap-3">
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-[#2a2a2a]">
                <h2 className="text-lg font-medium text-white">Services</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* API Keys Card */}
                  <Link
                    href="/dashboard/api-keys"
                    className="bg-[#222222] border border-[#333333] rounded-lg p-5 hover:bg-[#2a2a2a] transition-all duration-200 flex items-start gap-4 group"
                  >
                    <div className="w-10 h-10 rounded-md bg-[#333333] flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-white mb-1 group-hover:text-blue-400 transition-colors">
                        API Keys
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Create and manage authentication keys for the ZER08 API
                      </p>
                    </div>
                  </Link>

                  {/* Jobs Card */}
                  <Link
                    href="/dashboard/jobs"
                    className="bg-[#222222] border border-[#333333] rounded-lg p-5 hover:bg-[#2a2a2a] transition-all duration-200 flex items-start gap-4 group"
                  >
                    <div className="w-10 h-10 rounded-md bg-[#333333] flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-base font-medium text-white mb-1 group-hover:text-green-400 transition-colors">
                        Scheduled Jobs
                      </h3>
                      <p className="text-gray-400 text-sm">
                        Create and monitor scheduled webhook jobs and callbacks
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            {/* Documentation Section */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-[#2a2a2a]">
                <h2 className="text-lg font-medium text-white">Documentation</h2>
              </div>
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-md bg-[#333333] flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-base font-medium text-white">API Reference</h3>
                    <p className="text-gray-400 text-sm mb-3">
                      Comprehensive documentation for the ZER08 API, including endpoints, parameters, and examples.
                    </p>
                    <a 
                      href="#" 
                      className="inline-flex items-center text-sm text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <span>View Documentation</span>
                      <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Quick Start and Stats */}
          <div className="space-y-6 flex flex-col gap-3">
            {/* Quick Start Guide */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-[#2a2a2a]">
                <h2 className="text-lg font-medium text-white">Quick Start</h2>
              </div>
              <div className="p-6">
                <div className="space-y-5 flex flex-col gap-4">
                  <div className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-[#333333] flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <span className="text-blue-400 font-medium text-xs">1</span>
                    </div>
                    <div> 
                      <h4 className="text-sm font-medium text-white mb-1">Create an API Key</h4>
                      <p className="text-xs text-gray-400">Generate an authentication key to access the ZER08 API.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-[#333333] flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <span className="text-green-400 font-medium text-xs">2</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white mb-1">Schedule a Job</h4>
                      <p className="text-xs text-gray-400">Create a scheduled job with your callback URL and timing preferences.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="w-6 h-6 rounded-full bg-[#333333] flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <span className="text-purple-400 font-medium text-xs">3</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-white mb-1">Monitor Performance</h4>
                      <p className="text-xs text-gray-400">Track your jobs and manage them through the dashboard.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Coming Soon */}
            <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden shadow-sm">
              <div className="px-6 py-5 border-b border-[#2a2a2a]">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-medium text-white">Analytics</h2>
                  <span className="px-2 py-1 bg-[#333333] text-xs text-gray-300 rounded">Coming Soon</span>
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-md bg-[#333333] flex items-center justify-center flex-shrink-0 opacity-60">
                    <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div className="opacity-60 ml-3">
                    <h3 className="text-base font-medium text-white mb-1">Performance Metrics</h3>
                    <p className="text-gray-400 text-sm">
                      View detailed analytics and performance metrics for your scheduled jobs and API usage.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
