'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useReducedMotion } from 'framer-motion';
import { SpinnerGap } from '@phosphor-icons/react';
import { getAccount } from '@/lib/appwrite/client';
import { loginWithGoogle } from '@/lib/appwrite/auth';
import { AppIcon } from '@/components/shared/app-icon';

export default function AuthPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auth guard: If already logged in, redirect to /tasks
  useEffect(() => {
    async function checkAuth() {
      try {
        const account = getAccount();
        await account.get();
        router.replace('/tasks');
      } catch {
        // Not logged in, render auth screen
        setCheckingAuth(false);
      }
    }
    checkAuth();
  }, [router]);

  const handleSignIn = async () => {
    setError(null);
    setIsSigningIn(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setIsSigningIn(false);
      setError(err?.message || 'Failed to start Google Sign In. Please try again.');
    }
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <AppIcon size={48} animated className="rounded-xl shadow-subtle" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-canvas text-text-primary font-sans">
      <div className="w-full max-w-sm p-6 sm:p-8 bg-surface border border-border-subtle rounded-2xl shadow-card flex flex-col items-center text-center">
        {/* App Logo */}
        <div className="w-12 h-12 flex items-center justify-center mb-4">
          <AppIcon size={44} className="rounded-xl shadow-subtle" />
        </div>

        {/* Title & Description */}
        <h1 className="text-xl font-bold tracking-tight text-text-primary mb-1.5">
          Tiny Steps
        </h1>
        <p className="text-xs text-text-secondary leading-relaxed mb-6">
          Low-friction task companion. Sign in with Google to sync your micro-steps and tasks to Appwrite TablesDB.
        </p>

        {error && (
          <div className="w-full p-3 mb-4 rounded-lg bg-danger-subtle border border-border-subtle text-danger-text text-xs text-left">
            {error}
          </div>
        )}

        {/* Primary CTA: Sign in with Google */}
        <button
          type="button"
          onClick={handleSignIn}
          disabled={isSigningIn}
          aria-busy={isSigningIn}
          className="w-full inline-flex items-center justify-center gap-2.5 h-11 px-4 rounded-xl text-sm font-semibold text-text-primary bg-surface-subtle hover:bg-surface-elevated border border-border-subtle hover:border-border-muted transition-colors duration-fast cursor-pointer shadow-subtle disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {isSigningIn ? (
            <SpinnerGap
              size={20}
              weight="bold"
              className={`shrink-0 text-accent ${reduceMotion ? '' : 'animate-spin'}`}
              aria-hidden="true"
            />
          ) : (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              className="shrink-0"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M15.7034 7.91133C14.7554 7.02509 13.4903 6.54228 12.1813 6.56212C9.78605 6.56212 7.75176 8.14611 7.02642 10.279V10.2791C6.64183 11.3968 6.64183 12.6071 7.02642 13.7249H7.02979C7.75849 15.8545 9.78941 17.4385 12.1847 17.4385C13.4211 17.4385 14.4826 17.1285 15.3053 16.5809V16.5787C16.2735 15.9504 16.9348 14.9616 17.1406 13.8439H12.1813V10.3783H20.8414C20.9494 10.9802 21 11.5952 21 12.207C21 14.9443 20.002 17.2586 18.2655 18.826L18.2673 18.8274C16.7458 20.203 14.6576 21 12.1813 21C8.70985 21 5.53527 19.082 3.97666 16.043V16.043C2.67445 13.5 2.67445 10.5039 3.97666 7.96096H3.97668L3.97666 7.96094C5.53527 4.9186 8.70985 3.00061 12.1813 3.00061C14.4619 2.97415 16.6649 3.8141 18.3247 5.34188L15.7034 7.91133Z"
                fill="#C4C6D7"
              />
            </svg>
          )}
          <span>{isSigningIn ? 'Connecting...' : 'Sign in with Google'}</span>
        </button>

        {/* Offline / Guest Fallback option */}
        <div className="mt-4 pt-4 border-t border-border-subtle w-full">
          <button
            type="button"
            onClick={() => router.push('/tasks')}
            className="text-xs text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
          >
            Continue as guest without cloud backup →
          </button>
        </div>
      </div>
    </div>
  );
}
