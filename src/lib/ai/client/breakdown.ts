import type { Step, GranularityLevel, BreakdownResult } from '@/types/task';

/**
 * Decomposes a high-level task prompt into actionable micro-steps
 * using the LLM API via Vercel AI Gateway.
 */
export async function generateTaskBreakdown(
  text: string,
  granularity: GranularityLevel,
  signal?: AbortSignal
): Promise<BreakdownResult> {
  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  const startTime = Date.now();
  console.log(`[Breakdown] START - Prompt: "${text}" | Energy Level: ${granularity}`);

  try {
    const res = await fetch('/api/breakdown', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: text, energyLevel: granularity }),
      signal,
    });

    if (!res.ok) {
      throw new Error(`Breakdown API returned ${res.status}`);
    }

    const data = await res.json();
    const ackText = data.acknowledgment || data.dialogue;
    if (data.status === 'refused') {
      const result: BreakdownResult = {
        title: data.title || 'Gentle Redirection',
        acknowledgment: ackText,
        dialogue: ackText,
        steps: [],
        isRefused: true,
        refusalCategory: data.refusalCategory,
        refusalReason: data.refusalReason,
      };
      console.log(
        `[Breakdown] REFUSED (${Date.now() - startTime}ms) - Category: ${data.refusalCategory} | Reason: "${data.refusalReason}"`
      );
      return result;
    }

    if (!data.steps || !Array.isArray(data.steps) || data.steps.length === 0) {
      throw new Error('Invalid breakdown response structure');
    }

    const baseTime = Date.now();
    const formattedSteps: Step[] = data.steps.map(
      (s: { title?: string; text?: string; instruction?: string }, i: number) => {
        const title = s.title?.trim() || s.text?.trim() || 'Next tiny action';
        return {
          id: baseTime + i,
          title,
          instruction: s.instruction?.trim() || 'Take a calm breath and take just this one physical step.',
          text: title,
          completed: false,
          canSplit: true,
        };
      }
    );

    const result: BreakdownResult = {
      title: data.title || text.substring(0, 30),
      acknowledgment: ackText,
      dialogue: ackText,
      steps: formattedSteps,
    };

    console.log(
      `[Breakdown] END (${Date.now() - startTime}ms) - Title: "${result.title}" | Steps: ${result.steps.length}`
    );

    return result;
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }
    console.error(`[Breakdown] Failed (${Date.now() - startTime}ms):`, error);
    throw error;
  }
}
