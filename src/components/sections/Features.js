'use client';

import { useEffect, useState } from 'react';
import FeatureCard from '@/components/ui/FeatureCard';

export default function Features() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('features-section');
    if (element) observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, []);

  const features = [
    {
      title: 'Custom Time Logic',
      description: 'Define complex scheduling patterns with fine-grained control over dates, times, and recurrence rules.',
      icon: (
        <svg className="w-5 h-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Metadata Handling',
      description: 'Store and forward custom JSON payloads with each webhook, making your callbacks context-aware and data-rich.',
      icon: (
        <svg className="w-5 h-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      ),
    },
    {
      title: 'API-First Design',
      description: 'Simple REST API for scheduling, updating, and managing webhook jobs programmatically in your applications.',
      icon: (
        <svg className="w-5 h-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
    },
    {
      title: 'Zero Server Management',
      description: 'Built on GitHub Actions and Supabase, ZER08 requires no infrastructure management while maintaining reliability.',
      icon: (
        <svg className="w-5 h-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      title: 'Self-Hostable',
      description: 'Deploy your own instance with full control over your data and infrastructure, or use our hosted service.',
      icon: (
        <svg className="w-5 h-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
        </svg>
      ),
    },
    {
      title: 'Flexible Scheduling',
      description: 'Support for daily, weekly, monthly, interval-based, and specific date triggers with multiple time points.',
      icon: (
        <svg className="w-5 h-5 text-gray-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <section id="features-section" className="py-20 md:py-24 bg-[#0f0f0f] border-t border-[#222222]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-semibold text-white mb-4">
            API-First Scheduling
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            ZER08 provides the tools and infrastructure you need to build reliable, 
            scalable webhook scheduling into your applications.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              title={feature.title}
              description={feature.description}
              icon={feature.icon}
            />
          ))}
        </div>
        
        {/* Code example */}
        <div className="mt-20 max-w-4xl mx-auto bg-[#161616] border border-[#2a2a2a] rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2 bg-[#1a1a1a] border-b border-[#2a2a2a]">
            <div className="text-sm text-gray-400">Schedule a webhook</div>
            <div className="flex space-x-1">
              <div className="w-3 h-3 rounded-full bg-[#333333]"></div>
              <div className="w-3 h-3 rounded-full bg-[#333333]"></div>
              <div className="w-3 h-3 rounded-full bg-[#333333]"></div>
            </div>
          </div>
          <pre className="p-4 text-sm text-gray-300 overflow-x-auto">
            <code>{`// Schedule a webhook with custom time logic
fetch('https://api.zero8.pro/schedule', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    start_date: "2023-06-20",
    end_date: "2023-07-20",
    trigger_timings: ["14:22", "18:00"],
    freq: "custom",
    custom_days: [
      { weekly: ["mon", "fri"] },
      "2023-06-25"
    ],
    callback_url: "https://example.com/myhook",
    metadata: {
      type: "post_publish",
      post_id: 912
    }
  })
})`}</code>
          </pre>
        </div>
      </div>
    </section>
  );
} 