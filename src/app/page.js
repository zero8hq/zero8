import BackgroundPattern from '@/components/ui/BackgroundPattern';
import Navigation from '@/components/ui/Navigation';
import Features from '@/components/sections/Features';
import Cta from '@/components/sections/Cta';
import Footer from '@/components/ui/Footer';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#111111] text-white">
      <BackgroundPattern />
      <Navigation />
      
      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-24 md:py-32">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Logo badge */}
            <div className="inline-flex items-center mb-8 bg-[#222222] px-3 py-1.5 rounded-md border border-[#333333]/50">
              <span className="text-sm font-medium text-gray-300">Open Source Webhook Scheduler</span>
            </div>
            
            {/* Main heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-semibold tracking-tight mb-8">
              <span className="block text-white mb-2">Schedule Webhooks</span>
              <span className="block text-gray-400">With Zero Server Management</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto mb-12 leading-relaxed">
              ZER08 is an API-first scheduling platform that enables developers to define and trigger 
              webhooks based on custom time logic — with zero server management.
            </p>
            
            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-5">
              <Link 
                href="/signup" 
                className="px-8 py-3.5 rounded-md text-base font-medium bg-white text-gray-900 hover:bg-gray-200 transition-all duration-300 shadow-sm"
              >
                Get Started
              </Link>
              <Link 
                href="/docs" 
                className="px-8 py-3.5 rounded-md text-base font-medium bg-[#222222] text-gray-300 hover:bg-[#2a2a2a] hover:text-white transition-all duration-300 border border-[#333333]/50"
              >
                View Documentation
              </Link>
            </div>
            
            {/* Feature pills */}
            <div className="mt-16 flex flex-wrap justify-center gap-3">
              <span className="px-4 py-1.5 bg-[#1a1a1a] border border-[#333333]/50 rounded-full text-sm text-gray-300">Fine-Grained Scheduling</span>
              <span className="px-4 py-1.5 bg-[#1a1a1a] border border-[#333333]/50 rounded-full text-sm text-gray-300">Custom Time Logic</span>
              <span className="px-4 py-1.5 bg-[#1a1a1a] border border-[#333333]/50 rounded-full text-sm text-gray-300">Metadata Handling</span>
              <span className="px-4 py-1.5 bg-[#1a1a1a] border border-[#333333]/50 rounded-full text-sm text-gray-300">Self-Hostable</span>
            </div>
            
            {/* Tech stack badges */}
            <div className="mt-16 pt-6 border-t border-[#222222]">
              <p className="text-sm text-gray-500 mb-4">Powered by</p>
              <div className="flex flex-wrap justify-center gap-6">
                <div className="text-gray-400 text-sm flex items-center">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M11.572 0c-.176 0-.31.001-.358.007a19.76 19.76 0 0 0-.364.033C7.443.346 4.25 2.185 2.228 5.012a11.875 11.875 0 0 0-2.119 5.243c-.096.659-.108.854-.108 1.747s.012 1.089.108 1.748c.652 4.506 3.86 8.292 8.209 9.695.779.25 1.6.422 2.534.525.363.04 1.935.04 2.299 0 1.611-.178 2.977-.577 4.323-1.264.207-.106.247-.134.219-.158-.02-.013-.9-1.193-1.955-2.62l-1.919-2.592-2.404-3.558a338.739 338.739 0 0 0-2.422-3.556c-.009-.002-.018 1.579-.023 3.51-.007 3.38-.01 3.515-.052 3.595a.426.426 0 0 1-.206.214c-.075.037-.14.044-.495.044H7.81l-.108-.068a.438.438 0 0 1-.157-.171l-.05-.106.006-4.703.007-4.705.072-.092a.645.645 0 0 1 .174-.143c.096-.047.134-.051.54-.051.478 0 .558.018.682.154.035.038 1.337 1.999 2.895 4.361a10760.433 10760.433 0 0 0 4.735 7.17l1.9 2.879.096-.063a12.317 12.317 0 0 0 2.466-2.163 11.944 11.944 0 0 0 2.824-6.134c.096-.66.108-.854.108-1.748 0-.893-.012-1.088-.108-1.747-.652-4.506-3.859-8.292-8.208-9.695a12.597 12.597 0 0 0-2.499-.523A33.119 33.119 0 0 0 11.573 0zm4.069 7.217c.347 0 .408.005.486.047a.473.473 0 0 1 .237.277c.018.06.023 1.365.018 4.304l-.006 4.218-.744-1.14-.746-1.14v-3.066c0-1.982.01-3.097.023-3.15a.478.478 0 0 1 .233-.296c.096-.05.13-.054.5-.054z" />
                  </svg>
                  Next.js
                </div>
                <div className="text-gray-400 text-sm flex items-center">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M0 12C0 5.373 5.373 0 12 0c4.873 0 9.067 2.904 10.947 7.077l-15.87 15.87a11.981 11.981 0 0 1-1.935-1.099L14.99 12H12l-8.485 8.485A11.962 11.962 0 0 1 0 12Zm12.004 12L24 12.004C23.998 18.628 18.628 23.998 12.004 24Z" />
                  </svg>
                  Supabase
                </div>
                <div className="text-gray-400 text-sm flex items-center">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                  </svg>
                  GitHub Actions
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <Features />
        
        {/* CTA Section */}
        <Cta />
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
