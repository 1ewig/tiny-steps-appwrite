'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useReducedMotion } from 'framer-motion';
import { getAccount } from '@/lib/appwrite/client';
import { useTaskStore } from '@/store/task-store';
import { AppIcon } from '@/components/shared/app-icon';
import { CloudCheck, SignOut, ArrowRight, SpinnerGap } from '@phosphor-icons/react';

interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const setUser = useTaskStore((s) => s.setUser);
  const tasks = useTaskStore((s) => s.tasks);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);

  // Auth Guard: await account.get(), redirect to /auth if not authenticated
  useEffect(() => {
    async function loadDashboard() {
      try {
        const account = getAccount();
        const user = await account.get();
        const loadedProfile: UserProfile = {
          id: user.$id,
          name: user.name || user.email.split('@')[0],
          email: user.email,
        };
        setProfile(loadedProfile);
        setUser(loadedProfile);
        setLoading(false);
      } catch {
        setUser(null);
        router.replace('/auth');
      }
    }

    loadDashboard();
  }, [router, setUser]);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      const account = getAccount();
      await account.deleteSession({ sessionId: 'current' });
      setUser(null);
      router.replace('/auth');
    } catch (err) {
      console.error('[Dashboard] Error during sign out:', err);
      setUser(null);
      router.replace('/auth');
    }
  };

  if (loading || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-canvas">
        <AppIcon size={48} animated className="rounded-xl shadow-subtle" />
      </div>
    );
  }

  const initial = profile.name.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-canvas text-text-primary font-sans">
      <div className="w-full max-w-md p-6 sm:p-8 bg-surface border border-border-subtle rounded-2xl shadow-card flex flex-col">
        {/* Header with App Logo & Status */}
        <div className="flex items-center justify-between pb-5 border-b border-border-subtle">
          <div className="flex items-center gap-3">
            <AppIcon size={38} className="rounded-xl shadow-subtle" />
            <div>
              <h1 className="text-base font-bold text-text-primary">Tiny Steps</h1>
              <p className="text-2xs text-text-secondary flex items-center gap-1">
                <CloudCheck size={13} className="text-accent" weight="fill" />
                Appwrite TablesDB Active
              </p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-accent-subtle text-accent-text">
            Connected
          </span>
        </div>

        {/* User Profile Card */}
        <div className="py-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-accent text-text-inverse flex items-center justify-center text-xl font-bold shrink-0 shadow-subtle">
            {initial}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-text-primary truncate">
              {profile.name}
            </h2>
            <p className="text-xs text-text-secondary truncate mt-0.5">
              {profile.email}
            </p>
            <p className="text-2xs text-text-tertiary mt-1">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} in cloud sync
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="space-y-2.5 pt-2 border-t border-border-subtle">
          {/* Continue to Tasks Workspace */}
          <button
            type="button"
            onClick={() => router.push('/tasks')}
            className="w-full inline-flex items-center justify-center gap-2 h-11 px-4 rounded-xl text-xs font-semibold text-text-inverse bg-accent hover:bg-accent-hover transition-colors duration-fast cursor-pointer shadow-subtle focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span>Open Tasks Workspace</span>
            <ArrowRight size={15} weight="bold" />
          </button>

          {/* Sign Out Control */}
          <button
            type="button"
            onClick={handleSignOut}
            disabled={signingOut}
            aria-busy={signingOut}
            className="w-full inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl text-xs font-medium text-danger-text hover:bg-danger-subtle border border-border-subtle transition-colors duration-fast cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-danger"
          >
            {signingOut ? (
              <SpinnerGap
                size={15}
                weight="bold"
                className={`shrink-0 text-danger-text ${reduceMotion ? '' : 'animate-spin'}`}
                aria-hidden="true"
              />
            ) : (
              <SignOut size={15} weight="regular" />
            )}
            <span>{signingOut ? 'Signing out...' : 'Sign out'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
