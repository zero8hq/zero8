'use client';

import Link from 'next/link';

export default function Cta() {
  return (
    <section className="py-20 bg-[#111111]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg overflow-hidden">
          <div className="px-8 py-16 md:p-16 text-center md:text-left md:flex md:items-center md:justify-between">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-white mb-4">
                Ready to schedule webhooks with precision?
              </h2>
              <p className="text-gray-400 mb-6 md:mb-0 max-w-2xl">
                Get started with ZER08 today. Open source, self-hostable, and API-first. 
                Free tier available with no credit card required.
              </p>
              <div className="flex flex-wrap gap-8 mt-8 text-sm text-gray-400">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Fine-grained scheduling
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Zero server management
                </div>
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                  </svg>
                  MIT licensed
                </div>
              </div>
            </div>
            <div className="mt-10 md:mt-0 md:ml-8 flex flex-col sm:flex-row justify-center md:justify-end gap-4">
              <Link
                href="/signup"
                className="px-8 py-3.5 rounded-md text-base font-medium bg-white text-gray-900 hover:bg-gray-200 transition-all duration-300 shadow-sm"
              >
                Get Started Free
              </Link>
              <Link
                href="https://github.com/zero8hq/zero8"
                className="px-8 py-3.5 rounded-md text-base font-medium bg-[#222222] text-gray-300 hover:bg-[#2a2a2a] hover:text-white transition-all duration-300 border border-[#333333]/50 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
                View on GitHub
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 