'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTaskStore } from '@/store/task-store';
import { decomposeTask, type BreakdownResult } from '@/lib/assistant-engine';
import {
  generateTaskBreakdown,
  MAX_BREAKDOWN_WAIT_MS,
  MIN_BREAKDOWN_LOADER_MS,
} from '@/lib/task-generation';

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
      } catch {
        breakdown = decomposeTask(trimmed, granularity);
      } finally {
        clearTimeout(timeoutId!);
      }

      const elapsed = Date.now() - startedAt;
      if (elapsed < MIN_BREAKDOWN_LOADER_MS) {
        await sleep(MIN_BREAKDOWN_LOADER_MS - elapsed);
      }

      if (breakdown.isRefused) {
        setGenerationNotice(breakdown.dialogue);
        setRestoreText(trimmed);
        return;
      }

      const newTaskId = createTask({
        title: breakdown.title,
        prompt: trimmed,
        guidance: breakdown.dialogue,
        steps: breakdown.steps,
        energyLevel: granularity,
      });

      openFocusTunnel(newTaskId);
      router.push(`/tasks/${newTaskId}`);
    } catch (err) {
      console.error(err);
      setGeneratingTask(false);
      setGenerationNotice(null);
      setError(ERROR_MESSAGE);
      setRestoreText(trimmed);
    } finally {
      inFlightRef.current = false;
    }
  };

  return {
    startTask,
    isGeneratingTask,
    error,
    restoreText,
  };
}
