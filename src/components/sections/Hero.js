'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Hero() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="relative pt-32 pb-20 md:pt-40 md:pb-24">
      {/* Animated badge */}
      <div 
        className={`flex justify-center mb-8 transform transition-all duration-1000 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm">
          <span className="flex h-2 w-2 mr-2">
            <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          <span className="text-sm font-medium text-gray-200">API-First Scheduling Platform</span>
        </div>
      </div>

      {/* Main heading */}
      <div 
        className={`text-center max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 transform transition-all duration-1000 delay-150 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
          <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 pb-3">
            Schedule Webhooks
          </span>
          <span className="block text-white">
            Like a Pro
          </span>
        </h1>
        <p className="mt-6 text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
          ZER08 is the modern scheduling platform that makes webhook scheduling simple, 
          reliable, and scalable.
        </p>
      </div>

      {/* CTA buttons */}
      <div 
        className={`mt-10 flex flex-col sm:flex-row justify-center gap-4 transform transition-all duration-1000 delay-300 ease-out ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
        }`}
      >
        <Link 
          href="/signup" 
          className="px-8 py-4 rounded-full text-base md:text-lg font-medium bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-all duration-300 text-center"
        >
          Start Building Free
          <svg className="ml-2 w-5 h-5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </Link>
        <Link 
          href="/docs" 
          className="px-8 py-4 rounded-full text-base md:text-lg font-medium bg-white/5 backdrop-blur-sm border border-white/10 text-gray-200 hover:bg-white/10 hover:text-white transition-all duration-300 text-center"
        >
          <svg className="mr-2 w-5 h-5 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Documentation
        </Link>
      </div>

      {/* Gradient line */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="h-px bg-gradient-to-r from-transparent via-gray-800 to-transparent"></div>
      </div>
    </div>
  );
} 