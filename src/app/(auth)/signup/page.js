'use client';

import { useEffect } from 'react';
import { signIn } from 'next-auth/react';

export default function SignupPage() {
  useEffect(() => {
    // Automatically trigger Google sign-in when the page loads
    const initiateGoogleSignIn = async () => {
      await signIn('google', { callbackUrl: '/dashboard' });
    };
    
    initiateGoogleSignIn();
  }, []);

  // Return minimal UI that will only show briefly during redirect
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#111111]">
      <div className="text-white text-center">
        <div className="animate-spin h-8 w-8 border-4 border-t-blue-500 border-blue-300 rounded-full mx-auto mb-4"></div>
        <p>Redirecting to Google login...</p>
      </div>
    </div>
  );
} 