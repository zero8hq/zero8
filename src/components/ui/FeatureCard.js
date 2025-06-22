'use client';

export default function FeatureCard({ title, description, icon }) {
  return (
    <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg p-6 transition-all duration-300 hover:border-[#333333] hover:shadow-md">
      <div className="w-10 h-10 flex items-center justify-center bg-[#222222] rounded-md mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm">{description}</p>
    </div>
  );
} 