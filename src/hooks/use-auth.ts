'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTaskStore } from '@/store/task-store';
import { ensureSession, loginWithGoogle, logoutUser } from '@/lib/appwrite/auth';
import { saveTaskToDb } from '@/lib/appwrite/tasks';

export function useAuth() {
  const {
    user,
    setUser,
    isAuthLoading,
    setAuthLoading,
    setTasks,
    setLastSyncedAt,
    closeFocusTunnel,
  } = useTaskStore();
  const [error, setError] = useState<string | null>(null);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);

  const checkSession = useCallback(async () => {
    try {
      setAuthLoading(true);
      const currentUser = await ensureSession();
      setUser(currentUser);
    } catch {
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  }, [setUser, setAuthLoading]);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const signInWithGoogle = async () => {
    setError(null);
    setIsSigningIn(true);
    try {
      if (user?.isAnonymous && user.id && typeof window !== 'undefined') {
        sessionStorage.setItem('tinysteps_anon_migration_id', user.id);
      }
      await loginWithGoogle();
    } catch (err: unknown) {
      setIsSigningIn(false);
      const message = err instanceof Error ? err.message : 'Failed to initialize Google Sign In';
      setError(message);
      console.error('[Auth] loginWithGoogle error:', err);
    }
  };

  const logout = async (): Promise<void> => {
    setError(null);
    setIsSigningOut(true);
    try {
      if (user?.id) {
        const localTasks = useTaskStore.getState().tasks;
        const userTasks = localTasks.filter((t) => t.userId === user.id);
        if (userTasks.length > 0) {
          await Promise.allSettled(userTasks.map((t) => saveTaskToDb(t, user.id)));
        }
      }
      await logoutUser();
    } catch (err: unknown) {
      console.warn('[Auth] Remote logout error:', err);
    } finally {
      // Always guarantee full client-side cache and session purge
      setUser(null);
      setTasks([]);
      setLastSyncedAt(null);
      closeFocusTunnel();
      setIsSigningOut(false);

      // Immediately establish a fresh guest session for new interactions
      try {
        const freshAnon = await ensureSession();
        setUser(freshAnon);
      } catch {
        // Fallback
      }
    }
  };

  return {
    user,
    isAuthenticated: Boolean(user && !user.isAnonymous),
    isAnonymous: Boolean(user?.isAnonymous),
    isLoading: isAuthLoading,
    isSigningIn,
    isSigningOut,
    error,
    clearError: () => setError(null),
    signInWithGoogle,
    logout,
    checkSession,
  };
}
