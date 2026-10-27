'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { useTaskStore } from '@/store/task-store';

const subscribe = (callback: () => void) =>
  useTaskStore.persist.onFinishHydration(callback);

const getSnapshot = () => useTaskStore.persist.hasHydrated();

const getServerSnapshot = () => false;

export function useHydrated() {
  const storeHydrated = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [fallbackReady, setFallbackReady] = useState(false);

  useEffect(() => {
    if (storeHydrated) return;

    // Safety fallback: if hydration hangs (e.g. corrupt state or catch block), unblock UI
    const timer = setTimeout(() => {
      setFallbackReady(true);
    }, 1200);

    return () => clearTimeout(timer);
  }, [storeHydrated]);

  return storeHydrated || fallbackReady;
}
