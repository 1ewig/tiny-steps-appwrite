import type { Step, GranularityLevel } from '@/types/task';
import {
  decomposeTask,
  generateMicroSteps,
  interpretUserIntent,
  type BreakdownResult,
  type AssistantIntent,
} from '@/lib/assistant-engine';

// Brief minimum duration (600ms) prevents UI flash and ensures smooth motion.
export const MIN_BREAKDOWN_LOADER_MS = 600;
// Maximum wait time before automatically falling back to offline templates.
export const MAX_BREAKDOWN_WAIT_MS = 15000;
// Minimum loader duration for step shrinking to keep tactile smoothness.
export const SHRINK_STEP_LOADER_MS = 400;

/**
 * Decomposes a task using the LLM API via Vercel AI Gateway,
 * with automatic fallback to the offline template engine.
 */
export async function generateTaskBreakdown(
  text: string,
  granularity: GranularityLevel,
  signal?: AbortSignal
): Promise<BreakdownResult> {
  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

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
    if (!data.steps || !Array.isArray(data.steps) || data.steps.length === 0) {
      throw new Error('Invalid breakdown response structure');
    }

    const baseTime = Date.now();
    const formattedSteps: Step[] = data.steps.map(
      (s: { title?: string; text?: string; instruction?: string; effort?: string; hint?: string }, i: number) => {
        const title = s.title?.trim() || s.text?.trim() || 'Next tiny action';
        return {
          id: baseTime + i,
          title,
          instruction: s.instruction?.trim(),
          text: title,
          effort: s.effort || '~1 min',
          hint: s.hint?.trim(),
          completed: false,
          canSplit: true,
        };
      }
    );

    return {
      title: data.title || text.substring(0, 30),
      dialogue: data.dialogue,
      steps: formattedSteps,
    };
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }
    console.warn('LLM breakdown failed or unavailable; falling back to offline engine:', error);
    return decomposeTask(text, granularity);
  }
}

/**
 * Shrinks an overwhelming step into 3 tailored micro-actions using the LLM,
 * falling back to the Prep -> Touch -> Finish offline formula.
 */
export async function shrinkStepWithAI(
  stepText: string,
  taskTitle: string = 'Task',
  signal?: AbortSignal
): Promise<{ dialogue: string; microSteps: Step[] }> {
  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  try {
    const res = await fetch('/api/shrink', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stepText, taskTitle }),
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
      (s: { title?: string; text?: string; instruction?: string; effort?: string; hint?: string }, i: number) => {
        const title = s.title?.trim() || s.text?.trim() || 'Micro action';
        return {
          id: baseTime + i + 1,
          title,
          instruction: s.instruction?.trim(),
          text: title,
          effort: s.effort || '15 sec',
          hint: s.hint?.trim(),
          completed: false,
          canSplit: false,
        };
      }
    );

    return {
      dialogue:
        data.dialogue ||
        'No problem at all! If a step makes you hesitate, that is just your brain saying it is still too large. I shrank it into tiny bite-sized pieces for you:',
      microSteps,
    };
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }
    console.warn('LLM shrink failed or unavailable; falling back to offline micro-steps:', error);
    return {
      dialogue:
        'No problem at all! If a step makes you hesitate, that is just your brain saying it is still too large. I shrank it into tiny bite-sized pieces for you:',
      microSteps: generateMicroSteps(stepText),
    };
  }
}

/**
 * Interprets user intent when tweaking or venting in an active session,
 * using the LLM to update guidance or mutate steps in-place.
 */
export async function interpretUserIntentWithAI(
  input: string,
  taskTitle: string,
  activeSteps: Step[],
  level: GranularityLevel,
  signal?: AbortSignal
): Promise<AssistantIntent> {
  if (signal?.aborted) {
    throw new DOMException('Aborted', 'AbortError');
  }

  try {
    const res = await fetch('/api/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: input,
        taskTitle,
        activeSteps: activeSteps.map((s) => ({ id: s.id, text: s.text, completed: s.completed })),
      }),
      signal,
    });

    if (!res.ok) {
      throw new Error(`Assistant API returned ${res.status}`);
    }

    const data = await res.json();
    const baseTime = Date.now();

    if (data.type === 'complete_step') {
      const nextIncomplete = activeSteps.find((s) => !s.completed);
      const targetStepId = typeof data.targetStepId === 'number' ? data.targetStepId : nextIncomplete?.id;
      if (targetStepId !== undefined) {
        return {
          type: 'complete_step',
          targetStepId,
          dialogue: data.dialogue,
        };
      }
    }

    if (data.type === 'shrink_step') {
      const nextIncompleteIdx = activeSteps.findIndex((s) => !s.completed);
      const targetStepIndex = typeof data.targetStepIndex === 'number' ? data.targetStepIndex : nextIncompleteIdx;
      if (targetStepIndex !== -1) {
        const microSteps: Step[] = Array.isArray(data.microSteps) && data.microSteps.length > 0
          ? data.microSteps.map(
              (s: { title?: string; text?: string; instruction?: string; effort?: string; hint?: string }, i: number) => {
                const title = s.title?.trim() || s.text?.trim() || 'Micro action';
                return {
                  id: baseTime + i + 1,
                  title,
                  instruction: s.instruction?.trim(),
                  text: title,
                  effort: s.effort || '15 sec',
                  hint: s.hint?.trim(),
                  completed: false,
                  canSplit: false,
                };
              }
            )
          : generateMicroSteps(activeSteps[targetStepIndex]?.text || 'this step');

        return {
          type: 'shrink_step',
          targetStepIndex,
          microSteps,
          dialogue: data.dialogue,
        };
      }
    }

    if (data.type === 'all_complete') {
      return {
        type: 'all_complete',
        dialogue: data.dialogue,
      };
    }

    if (data.type === 'tweak_steps' || data.type === 'new_task') {
      const formattedSteps: Step[] = Array.isArray(data.steps)
        ? data.steps.map(
            (s: { title?: string; text?: string; instruction?: string; effort?: string; hint?: string }, i: number) => {
              const title = s.title?.trim() || s.text?.trim() || 'Next tiny action';
              return {
                id: baseTime + i,
                title,
                instruction: s.instruction?.trim(),
                text: title,
                effort: s.effort || '~1 min',
                hint: s.hint?.trim(),
                completed: false,
                canSplit: true,
              };
            }
          )
        : [];

      return {
        type: 'new_task',
        title: data.title || taskTitle,
        dialogue: data.dialogue,
        steps: formattedSteps,
      };
    }

    // Default or encouragement: return dialogue as advice
    return {
      type: 'all_complete',
      dialogue: data.dialogue,
    };
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }
    console.warn('LLM assistant failed or unavailable; falling back to offline intent engine:', error);
    return interpretUserIntent(input, activeSteps, level);
  }
}
