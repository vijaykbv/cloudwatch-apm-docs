'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { SessionManager } from '@/lib/auth';

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    // Clear any remaining session data
    SessionManager.clearTokens();
    
    // Clear any other session storage
    sessionStorage.clear();
    
    // Redirect to home page after a short delay
    setTimeout(() => {
      router.push('/');
    }, 3000);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Signed Out Successfully
          </h2>
          
          <p className="text-gray-600 mb-6">
            You have been successfully signed out of the CloudWatch APM Documentation system.
          </p>
          
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Session Cleared
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Your session has been cleared from this browser. 
                      You may also want to sign out of AWS SSO if you're on a shared computer.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="animate-pulse bg-gray-100 text-gray-600 px-4 py-2 rounded-full">
              Redirecting to home page...
            </div>
          </div>
        </div>
        
        <div className="mt-6 space-y-2">
          <button
            onClick={() => router.push('/')}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Return to Home
          </button>
          
          <button
            onClick={() => router.push('/auth/login')}
            className="w-full text-gray-600 hover:text-gray-900 px-4 py-2 rounded border border-gray-300 hover:border-gray-400 transition-colors"
          >
            Sign In Again
          </button>
        </div>
        
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Need help?{' '}
            <a href="mailto:cloudwatch-apm-docs@amazon.com" className="text-blue-600 hover:text-blue-500">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}