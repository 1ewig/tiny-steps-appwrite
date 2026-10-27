'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAccount } from '@/lib/appwrite/client';
import { reassignGuestTasksInDb } from '@/lib/appwrite/tasks';
import { useTaskStore } from '@/store/task-store';
import { AppIcon } from '@/components/shared/app-icon';

function OAuthSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useTaskStore((s) => s.setUser);
  const [error, setError] = useState<string | null>(null);
  const hasExecutedRef = useRef(false);

  useEffect(() => {
    if (hasExecutedRef.current) return;

    async function exchangeOAuthToken() {
      const userId = searchParams.get('userId');
      const secret = searchParams.get('secret');

      if (!userId || !secret) {
        router.replace('/auth/failure');
        return;
      }

      hasExecutedRef.current = true;

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
          isAnonymous: false,
        });

        // Reassign any guest tasks created during the pre-OAuth anonymous session
        if (typeof window !== 'undefined') {
          try {
            const anonId = sessionStorage.getItem('tinysteps_anon_migration_id');
            if (anonId && anonId !== user.$id) {
              await reassignGuestTasksInDb(anonId, user.$id);
              sessionStorage.removeItem('tinysteps_anon_migration_id');
            }
          } catch (migErr) {
            console.warn('[OAuth Success] Guest task reassignment error:', migErr);
          }
        }

        // Always await account calls before navigating
        router.replace('/tasks');
      } catch (err: any) {
        // Fallback: If token was already consumed, verify if an active session exists
        try {
          const account = getAccount();
          const user = await account.get();
          if (user) {
            setUser({
              id: user.$id,
              email: user.email,
              name: user.name || user.email.split('@')[0],
              isAnonymous: false,
            });

            if (typeof window !== 'undefined') {
              try {
                const anonId = sessionStorage.getItem('tinysteps_anon_migration_id');
                if (anonId && anonId !== user.$id) {
                  await reassignGuestTasksInDb(anonId, user.$id);
                  sessionStorage.removeItem('tinysteps_anon_migration_id');
                }
              } catch (migErr) {
                console.warn('[OAuth Success] Guest task reassignment error:', migErr);
              }
            }

            router.replace('/tasks');
            return;
          }
        } catch {
          // No active session
        }

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
