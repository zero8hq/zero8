'use client';

import { useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function SigninContent() {
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // If already authenticated, redirect to dashboard
    if (status === 'authenticated') {
      router.replace('/dashboard');
      return;
    }

    // Only proceed with Google sign-in if not authenticated
    if (status === 'unauthenticated') {
      const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
      
      // Ensure we're not in a redirect loop
      if (!callbackUrl.includes('/signin')) {
        signIn('google', { 
          callbackUrl,
          redirect: true,
        });
      } else {
        // If we detect a redirect loop, force to dashboard
        signIn('google', { 
          callbackUrl: '/dashboard',
          redirect: true,
        });
      }
    }
  }, [searchParams, status, router]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#111111]">
      <div className="text-white text-center">
        <div className="animate-spin h-8 w-8 border-4 border-t-blue-500 border-blue-300 rounded-full mx-auto mb-4"></div>
        <p>Redirecting{status === 'authenticated' ? ' to dashboard' : ' to Google login'}...</p>
      </div>
    </div>
  );
}

// Loading fallback that matches the signin UI
function LoadingFallback() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#111111]">
      <div className="text-white text-center">
        <div className="animate-spin h-8 w-8 border-4 border-t-blue-500 border-blue-300 rounded-full mx-auto mb-4"></div>
        <p>Loading...</p>
      </div>
    </div>
  );
}

export default function SigninPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <SigninContent />
    </Suspense>
  );
} 