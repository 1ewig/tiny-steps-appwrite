'use client';

import { useRouter } from 'next/navigation';
import { AppIcon } from '@/components/shared/app-icon';

export default function OAuthFailurePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-canvas text-text-primary font-sans">
      <div className="w-full max-w-sm p-6 sm:p-8 bg-surface border border-border-subtle rounded-2xl shadow-card flex flex-col items-center text-center">
        <div className="w-12 h-12 flex items-center justify-center mb-4">
          <AppIcon size={44} className="rounded-xl shadow-subtle" />
        </div>

        <h1 className="text-lg font-bold tracking-tight text-text-primary mb-2">
          Sign In Was Unsuccessful
        </h1>
        <p className="text-xs text-text-secondary leading-relaxed mb-6">
          The Google sign-in request was cancelled or encountered an authentication issue. Your local tasks are still safe.
        </p>

        <button
          type="button"
          onClick={() => router.replace('/auth')}
          className="w-full inline-flex items-center justify-center h-10 px-4 rounded-xl text-xs font-semibold text-text-inverse bg-accent hover:bg-accent-hover transition-colors duration-fast cursor-pointer shadow-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          Try signing in again
        </button>

        <button
          type="button"
          onClick={() => router.replace('/tasks')}
          className="mt-3 text-xs text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
        >
          Return to Tasks
        </button>
      </div>
    </div>
  );
}
