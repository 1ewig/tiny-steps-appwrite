'use client';

import { useSyncExternalStore } from 'react';
import { useTaskStore } from '@/store/task-store';

const subscribe = (callback: () => void) =>
  useTaskStore.persist.onFinishHydration(callback);

const getSnapshot = () => useTaskStore.persist.hasHydrated();

const getServerSnapshot = () => false;

export function useHydrated() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
