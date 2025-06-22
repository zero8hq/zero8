'use client';

import { useEffect, useState } from 'react';

export default function BackgroundPattern() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
      {/* Base background */}
      <div className="absolute inset-0 bg-[#111111]"></div>
      
      {/* Noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.15]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      ></div>
      
      {/* Subtle dot grid pattern */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px)`,
          backgroundSize: '25px 25px',
        }}
      ></div>
      
      {/* Very subtle gradient overlays */}
      <div className="absolute top-0 left-0 right-0 h-[300px] bg-gradient-to-b from-[#1a1a1a]/30 to-transparent"></div>
      <div className="absolute bottom-0 left-0 right-0 h-[300px] bg-gradient-to-t from-[#1a1a1a]/30 to-transparent"></div>
      
      {/* Subtle accent blurs */}
      <div className="absolute top-[-400px] right-[-400px] w-[800px] h-[800px] bg-[#2a2a2a]/5 rounded-full blur-[200px]"></div>
      <div className="absolute bottom-[-300px] left-[-300px] w-[600px] h-[600px] bg-[#2a2a2a]/5 rounded-full blur-[200px]"></div>
      
      {/* Subtle grid lines */}
      <div className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), 
                            linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
          backgroundSize: '60px 60px',
        }}>
      </div>
    </div>
  );
} 