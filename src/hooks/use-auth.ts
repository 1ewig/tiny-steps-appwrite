'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTaskStore } from '@/store/task-store';
import { getCurrentUser, loginWithGoogle, logoutUser } from '@/lib/appwrite/auth';

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

  const checkSession = useCallback(async () => {
    try {
      setAuthLoading(true);
      const currentUser = await getCurrentUser();
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
    try {
      await loginWithGoogle();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to initialize Google Sign In';
      setError(message);
      console.error('[Auth] loginWithGoogle error:', err);
    }
  };

  const logout = async (): Promise<void> => {
    setError(null);
    setAuthLoading(true);
    try {
      await logoutUser();
    } catch (err: unknown) {
      console.warn('[Auth] Remote logout error:', err);
    } finally {
      // Always guarantee full client-side cache and session purge,
      // even if offline or if remote session deletion fails
      setUser(null);
      setTasks([]);
      setLastSyncedAt(null);
      closeFocusTunnel();
      setAuthLoading(false);
    }
  };

  return {
    user,
    isAuthenticated: Boolean(user),
    isLoading: isAuthLoading,
    error,
    clearError: () => setError(null),
    signInWithGoogle,
    logout,
    checkSession,
  };
}
