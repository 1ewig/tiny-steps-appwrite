import type { GranularityLevel } from '@/types/task';
import { decomposeTask, type BreakdownResult } from '@/lib/assistant-engine';

export const MIN_BREAKDOWN_LOADER_MS = 1200;
export const MAX_BREAKDOWN_WAIT_MS = 6000;

export async function generateTaskBreakdown(
  text: string,
  granularity: GranularityLevel,
  signal?: AbortSignal
): Promise<BreakdownResult> {
  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  return decomposeTask(text, granularity);
}
