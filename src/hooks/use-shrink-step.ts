'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SHRINK_STEP_LOADER_MS } from '@/lib/task-generation';

export function useShrinkStep(onShrink: () => Promise<void> | void) {
  const [isShrinking, setIsShrinking] = useState(false);
  const inFlightRef = useRef(false);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const cancel = useCallback(() => {
    inFlightRef.current = false;
    setIsShrinking(false);
  }, []);

  const trigger = useCallback(async () => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;
    setIsShrinking(true);

    const startedAt = Date.now();
    try {
      await Promise.resolve(onShrink());
    } finally {
      const elapsed = Date.now() - startedAt;
      if (elapsed < SHRINK_STEP_LOADER_MS) {
        await new Promise((res) => setTimeout(res, SHRINK_STEP_LOADER_MS - elapsed));
      }
      if (mountedRef.current) {
        setIsShrinking(false);
      }
      inFlightRef.current = false;
    }
  }, [onShrink]);

  return { isShrinking, trigger, cancel };
}
