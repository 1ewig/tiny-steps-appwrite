import type { StateCreator } from 'zustand';
import type { TaskState, AuthUser } from '@/types/task';

export interface AuthSlice {
  user: AuthUser | null;
  isAuthLoading: boolean;
  isSyncing: boolean;
  lastSyncedAt: number | null;
  setUser: (user: AuthUser | null) => void;
  setAuthLoading: (isAuthLoading: boolean) => void;
  setIsSyncing: (isSyncing: boolean) => void;
  setLastSyncedAt: (lastSyncedAt: number | null) => void;
}

export const createAuthSlice: StateCreator<TaskState, [], [], AuthSlice> = (set) => ({
  user: null,
  isAuthLoading: true,
  isSyncing: false,
  lastSyncedAt: null,
  setUser: (user) => set({ user }),
  setAuthLoading: (isAuthLoading) => set({ isAuthLoading }),
  setIsSyncing: (isSyncing) => set({ isSyncing }),
  setLastSyncedAt: (lastSyncedAt) => set({ lastSyncedAt }),
});
