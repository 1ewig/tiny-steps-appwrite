import type { Step } from '@/types/task';

/**
 * Shrinks an overwhelming step into 2 to 4 tailored micro-actions using the LLM,
 * with surrounding step context to dissolve the specific stall point.
 */
export async function shrinkStepWithAI(
  stepText: string,
  taskTitle: string = 'Task',
  previousStepText?: string,
  nextStepText?: string,
  signal?: AbortSignal
): Promise<{ acknowledgment: string; dialogue?: string; microSteps: Step[] }> {
  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  const startTime = Date.now();
  console.log(`[Shrink] START - Step: "${stepText}" | Task Title: "${taskTitle}"`);

  try {
    const res = await fetch('/api/shrink', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stepText, taskTitle, previousStepText, nextStepText }),
      signal,
    });

    if (!res.ok) {
      throw new Error(`Shrink API returned ${res.status}`);
    }

    const data = await res.json();
    if (!data.microSteps || !Array.isArray(data.microSteps) || data.microSteps.length === 0) {
      throw new Error('Invalid shrink response structure');
    }

    const baseTime = Date.now();
    const microSteps: Step[] = data.microSteps.map(
      (s: { title?: string; text?: string; instruction?: string }, i: number) => {
        const title = s.title?.trim() || s.text?.trim() || 'Micro action';
        return {
          id: baseTime + i + 1,
          title,
          instruction: s.instruction?.trim() || 'Focus gently on just this physical motion.',
          text: title,
          completed: false,
          canSplit: false,
        };
      }
    );

    const ack =
      data.acknowledgment ||
      data.dialogue ||
      'No problem at all! If a step makes you hesitate, that is just your brain saying it is still too large. I shrank it into tiny bite-sized pieces for you:';

    const result = {
      acknowledgment: ack,
      dialogue: ack,
      microSteps,
    };

    console.log(
      `[Shrink] END (${Date.now() - startTime}ms) - Micro-steps: ${result.microSteps.length}`
    );

    return result;
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }
    console.error(`[Shrink] Failed (${Date.now() - startTime}ms):`, error);
    throw error;
  }
}
