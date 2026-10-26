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
    } catch (err: any) {
      setError(err?.message || 'Failed to initialize Google Sign In');
      console.error('[Auth] loginWithGoogle error:', err);
    }
  };

  const logout = async (): Promise<void> => {
    setError(null);
    setAuthLoading(true);
    try {
      await logoutUser();
      setUser(null);
      setTasks([]);
      setLastSyncedAt(null);
      closeFocusTunnel();
    } catch (err: any) {
      console.error('[Auth] Logout error:', err);
    } finally {
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
