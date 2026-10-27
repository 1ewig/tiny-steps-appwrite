'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTaskStore } from '@/store/task-store';
import type { BreakdownResult } from '@/types/task';
import { generateTaskBreakdown } from '@/lib/ai/client';
import {
  MAX_BREAKDOWN_WAIT_MS,
  MIN_BREAKDOWN_LOADER_MS,
} from '@/constants/timing';

const ERROR_MESSAGE =
  'The tiny-step maker needs a moment. Your words are safe—try again when you are ready.';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useStartTask() {
  const router = useRouter();
  const inFlightRef = useRef(false);
  const [error, setError] = useState<string | null>(null);
  const [restoreText, setRestoreText] = useState<string | null>(null);
  const [attemptId, setAttemptId] = useState(0);

  const {
    granularity,
    isGeneratingTask,
    createTask,
    openFocusTunnel,
    setGeneratingTask,
    setGenerationNotice,
  } = useTaskStore();

  const startTask = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || inFlightRef.current) return;

    inFlightRef.current = true;
    setError(null);
    setRestoreText(null);
    setGenerationNotice(null);
    setGeneratingTask(true);

    try {
      const startedAt = Date.now();
      const controller = new AbortController();
      let timeoutId: ReturnType<typeof setTimeout>;

      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          controller.abort();
          reject(new DOMException('Aborted', 'AbortError'));
        }, MAX_BREAKDOWN_WAIT_MS);
      });

      let breakdown: BreakdownResult;

      try {
        breakdown = await Promise.race([
          generateTaskBreakdown(trimmed, granularity, controller.signal),
          timeoutPromise,
        ]);
      } finally {
        clearTimeout(timeoutId!);
      }

      const elapsed = Date.now() - startedAt;
      if (elapsed < MIN_BREAKDOWN_LOADER_MS) {
        await sleep(MIN_BREAKDOWN_LOADER_MS - elapsed);
      }

      const ack = breakdown.acknowledgment || breakdown.dialogue || '';

      if (breakdown.isRefused) {
        setGeneratingTask(false);
        setGenerationNotice(ack);
        setRestoreText(trimmed);
        setAttemptId((prev) => prev + 1);
        throw new Error(ack || 'Generation refused');
      }

      const newTaskId = createTask({
        title: breakdown.title,
        prompt: trimmed,
        guidance: ack,
        steps: breakdown.steps,
        energyLevel: granularity,
      });

      openFocusTunnel(newTaskId);
      router.push(`/tasks/${newTaskId}`);
    } catch (err) {
      console.error(err);
      setGeneratingTask(false);
      setGenerationNotice(ERROR_MESSAGE);
      setError(ERROR_MESSAGE);
      setRestoreText(trimmed);
      setAttemptId((prev) => prev + 1);
      throw err;
    } finally {
      inFlightRef.current = false;
    }
  };

  return {
    startTask,
    isGeneratingTask,
    error,
    restoreText,
    attemptId,
  };
}
