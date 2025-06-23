'use client';

import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useState } from 'react';
import BackgroundPattern from '@/components/ui/BackgroundPattern';

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [activeTab, setActiveTab] = useState('profile');

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-t-blue-500 border-blue-300 rounded-full"></div>
      </div>
    );
  }

  if (!session) {
    return null; // Middleware will handle redirect
  }

  const tabs = [
    {
      id: 'profile',
      name: 'Profile',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
    },
    {
      id: 'activity',
      name: 'Activity',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
    },
    {
      id: 'settings',
      name: 'Settings',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#111111] pt-24 pb-16">
      <BackgroundPattern className="fixed inset-0 z-0" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-4">
        {/* Profile Header */}
        <div className="bg-[#18181B] rounded-xl p-6 border border-[#232329] shadow-xl mb-8">
          <div className="flex items-center">
            {session.user?.image ? (
              <Image
                src={session.user.image}
                alt={session.user.name || 'Profile'}
                width={80}
                height={80}
                className="rounded-full"
              />
            ) : (
              <div className="w-20 h-20 rounded-full bg-blue-500 flex items-center justify-center text-2xl text-white font-medium">
                {session.user?.name?.[0] || session.user?.email?.[0] || '?'}
              </div>
            )}
            <div className="ml-6">
              <h1 className="text-2xl font-bold text-white">
                {session.user?.name || 'User'}
              </h1>
              <p className="text-gray-400 mt-1">{session.user?.email}</p>
              <div className="flex items-center mt-3 space-x-3">
                <span className="px-3 py-1 bg-[#232329] rounded-full text-sm text-gray-300">
                  Member since {new Date().getFullYear()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-[#18181B] rounded-xl border border-[#232329] shadow-xl overflow-hidden">
          <div className="border-b border-[#232329]">
            <div className="flex">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center px-6 py-4 text-sm font-medium transition-colors duration-200 ${
                    activeTab === tab.id
                      ? 'text-white bg-[#232329]'
                      : 'text-gray-400 hover:text-white hover:bg-[#1d1d20]'
                  }`}
                >
                  {tab.icon}
                  <span className="ml-2">{tab.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Profile Information</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-[#1d1d20] rounded-lg p-4 border border-[#2a2a2a]">
                      <div className="text-sm text-gray-400">Name</div>
                      <div className="mt-1 text-white">{session.user?.name || 'Not set'}</div>
                    </div>
                    <div className="bg-[#1d1d20] rounded-lg p-4 border border-[#2a2a2a]">
                      <div className="text-sm text-gray-400">Email</div>
                      <div className="mt-1 text-white">{session.user?.email}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="text-center py-8">
                <svg className="w-16 h-16 mx-auto text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-white">No Recent Activity</h3>
                <p className="mt-2 text-gray-400">Your activity history will appear here</p>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Account Settings</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-[#1d1d20] rounded-lg p-4 border border-[#2a2a2a]">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-white font-medium">Email Notifications</div>
                          <div className="text-sm text-gray-400 mt-1">Receive email updates about your account</div>
                        </div>
                        <button className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-[#2a2a2a]">
                          <span className="translate-x-0 inline-block h-5 w-5 transform rounded-full bg-gray-400 transition duration-200 ease-in-out"></span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 