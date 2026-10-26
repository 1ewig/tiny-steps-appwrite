'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAccount } from '@/lib/appwrite/client';
import { useTaskStore } from '@/store/task-store';
import { AppIcon } from '@/components/shared/app-icon';

function OAuthSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useTaskStore((s) => s.setUser);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function exchangeOAuthToken() {
      const userId = searchParams.get('userId');
      const secret = searchParams.get('secret');

      if (!userId || !secret) {
        router.replace('/auth/failure');
        return;
      }

      try {
        const account = getAccount();
        // Await session creation with the first-party token
        await account.createSession({ userId, secret });

        // Fetch authenticated user profile
        const user = await account.get();
        setUser({
          id: user.$id,
          email: user.email,
          name: user.name || user.email.split('@')[0],
        });

        // Always await account calls before navigating
        router.replace('/dashboard');
      } catch (err: any) {
        console.error('[OAuth Success] Failed to create session:', err);
        setError(err?.message || 'Failed to authenticate session.');
        setTimeout(() => router.replace('/auth/failure'), 1500);
      }
    }

    exchangeOAuthToken();
  }, [searchParams, router, setUser]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center">
        <p className="text-sm font-medium text-danger-text mb-2">{error}</p>
        <p className="text-xs text-text-tertiary">Redirecting to failure screen...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 text-center">
      <AppIcon size={44} animated className="rounded-xl shadow-subtle mb-4" />
      <h2 className="text-base font-semibold text-text-primary mb-1">
        Authenticating with Google...
      </h2>
      <p className="text-xs text-text-secondary">
        Securing session and preparing your workspace.
      </p>
    </div>
  );
}

export default function OAuthSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas">
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center bg-canvas">
            <AppIcon size={44} animated className="rounded-xl shadow-subtle" />
          </div>
        }
      >
        <OAuthSuccessContent />
      </Suspense>
    </div>
  );
}
