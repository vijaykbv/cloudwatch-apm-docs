'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SessionManager } from '@/lib/auth';

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Check if user is already authenticated
    if (SessionManager.isAuthenticated()) {
      const returnUrl = searchParams.get('returnUrl') || '/';
      router.push(returnUrl);
      return;
    }

    // Store return URL for after authentication
    const returnUrl = searchParams.get('returnUrl');
    if (returnUrl) {
      sessionStorage.setItem('auth_return_url', returnUrl);
    }

    // Auto-redirect to AWS SSO login
    const redirectUri = `${window.location.origin}/auth/callback`;
    const state = Math.random().toString(36).substring(2, 15);
    
    sessionStorage.setItem('auth_state', state);

    // Construct AWS SSO login URL
    const cognitoDomain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN;
    const clientId = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_CLIENT_ID;
    
    if (!cognitoDomain || !clientId) {
      console.error('Missing authentication configuration');
      return;
    }

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: 'email openid profile',
      identity_provider: 'AWSSSO',
      state: state,
    });

    const authUrl = `${cognitoDomain}/oauth2/authorize?${params.toString()}`;
    
    // Small delay to show the loading state
    setTimeout(() => {
      window.location.href = authUrl;
    }, 1000);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
            <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            CloudWatch APM Documentation
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign in with your AWS SSO credentials
          </p>
        </div>

        <div className="bg-white py-8 px-6 shadow rounded-lg">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Redirecting to AWS SSO
            </h3>
            <p className="text-sm text-gray-600 mb-6">
              You will be redirected to AWS Single Sign-On to authenticate with your AWS credentials.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    AWS Employee Access Only
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      This documentation system is restricted to AWS employees. 
                      You must have valid AWS SSO credentials to access the content.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Having trouble signing in?{' '}
            <a href="mailto:cloudwatch-apm-docs@amazon.com" className="text-blue-600 hover:text-blue-500">
              Contact support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Loading...
          </h2>
        </div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}