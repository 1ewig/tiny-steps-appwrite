'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SHRINK_STEP_LOADER_MS } from '@/lib/task-generation';

export function useShrinkStep(onShrink: () => void) {
  const [isShrinking, setIsShrinking] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingCallbackRef = useRef<(() => void) | null>(null);

  const cancel = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    pendingCallbackRef.current = null;
    setIsShrinking(false);
  }, []);

  useEffect(() => cancel, [cancel]);

  const trigger = useCallback(() => {
    if (timerRef.current) return;

    pendingCallbackRef.current = onShrink;
    setIsShrinking(true);

    timerRef.current = setTimeout(() => {
      timerRef.current = null;
      const callback = pendingCallbackRef.current;
      pendingCallbackRef.current = null;

      try {
        callback?.();
      } finally {
        setIsShrinking(false);
      }
    }, SHRINK_STEP_LOADER_MS);
  }, [onShrink]);

  return { isShrinking, trigger, cancel };
}
