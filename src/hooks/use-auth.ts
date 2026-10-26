'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTaskStore } from '@/store/task-store';
import {
  getCurrentUser,
  loginWithGoogle,
  loginWithEmail,
  registerWithEmail,
  logoutUser,
} from '@/lib/appwrite/auth';
import type { AuthUser } from '@/types/task';

export function useAuth() {
  const { user, setUser, isAuthLoading, setAuthLoading } = useTaskStore();
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

  const signInWithGoogle = (redirectPath?: string) => {
    setError(null);
    loginWithGoogle(redirectPath);
  };

  const login = async (email: string, password: string): Promise<AuthUser> => {
    setError(null);
    setAuthLoading(true);
    try {
      const loggedIn = await loginWithEmail(email, password);
      setUser(loggedIn);
      return loggedIn;
    } catch (err: any) {
      const msg = err?.message || 'Failed to sign in. Please check your credentials.';
      setError(msg);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const register = async (
    email: string,
    password: string,
    name?: string
  ): Promise<AuthUser> => {
    setError(null);
    setAuthLoading(true);
    try {
      const registered = await registerWithEmail(email, password, name);
      setUser(registered);
      return registered;
    } catch (err: any) {
      const msg = err?.message || 'Failed to create account.';
      setError(msg);
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setError(null);
    setAuthLoading(true);
    try {
      await logoutUser();
      setUser(null);
    } catch (err: any) {
      console.error('Logout error:', err);
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
    login,
    register,
    logout,
    checkSession,
  };
}
