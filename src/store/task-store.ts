import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { TaskState } from '@/types/task';
import { createTaskSlice } from './slices/task-slice';
import { createUISlice } from './slices/ui-slice';
import { createAuthSlice } from './slices/auth-slice';
import { mergePersistedTaskState } from './task-migrations';

const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};

export const useTaskStore = create<TaskState>()(
  persist(
    (...a) => ({
      ...createTaskSlice(...a),
      ...createUISlice(...a),
      ...createAuthSlice(...a),
    }),
    {
      name: 'tinysteps_zustand_store',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? localStorage : dummyStorage
      ),
      partialize: (state) => ({
        tasks: state.tasks,
        granularity: state.granularity,
        peekFuture: state.peekFuture,
        theme: state.theme,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {
        if (typeof document !== 'undefined' && state?.theme === 'dark') {
          document.documentElement.classList.add('dark');
        }
      },
      merge: mergePersistedTaskState,
    }
  )
);

export * from './slices/task-slice';
export * from './slices/ui-slice';
export * from './slices/auth-slice';
