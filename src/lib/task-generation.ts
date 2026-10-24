import type { GranularityLevel } from '@/types/task';
import { decomposeTask, type BreakdownResult } from '@/lib/assistant-engine';

// Hardcoded 4-second minimum duration for the focus loader.
// NOTE: In the future when an LLM is integrated, the actual duration will be driven
// by the real LLM response time rather than this hardcoded delay.
export const MIN_BREAKDOWN_LOADER_MS = 4000;
export const MAX_BREAKDOWN_WAIT_MS = 10000;

// Hardcoded 1-second simulated delay for shrink/break-down actions.
// NOTE: Once the LLM is integrated, this should be replaced by the actual
// LLM response time (with a minimum display duration to avoid flashing).
export const SHRINK_STEP_LOADER_MS = 1000;

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
