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
    console.warn(`[Breakdown] Offline Fallback (${Date.now() - startTime}ms):`, error);
    return decomposeTask(text, granularity);
  }
}

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
    console.warn(`[Shrink] Offline Fallback (${Date.now() - startTime}ms):`, error);
    const fallbackAck =
      'No problem at all! If a step makes you hesitate, that is just your brain saying it is still too large. I shrank it into tiny bite-sized pieces for you:';
    return {
      acknowledgment: fallbackAck,
      dialogue: fallbackAck,
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

  const startTime = Date.now();
  console.log(`[Tweak] START - Message: "${input}" | Task Title: "${taskTitle}"`);

  try {
    const res = await fetch('/api/assistant', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: input,
        taskTitle,
        activeSteps: activeSteps.map((s) => ({
          id: s.id,
          text: s.text,
          title: s.title,
          instruction: s.instruction,
          completed: s.completed,
          subSteps: s.subSteps?.map((sub) => ({
            id: sub.id,
            text: sub.text,
            title: sub.title,
            instruction: sub.instruction,
            completed: sub.completed,
          })),
        })),
      }),
      signal,
    });

    if (!res.ok) {
      throw new Error(`Assistant API returned ${res.status}`);
    }

    const data = await res.json();
    const ack = data.acknowledgment || data.dialogue || '';
    const baseTime = Date.now();

    // Surgical Constraint Rerouting (Real-world blocker substitution)
    if (data.type === 'reroute_constraint') {
      const targetStep = activeSteps.find((s) => s.id === data.targetStepId) || activeSteps.find((s) => !s.completed);
      const targetStepId = targetStep?.id ?? activeSteps[0]?.id;
      if (targetStepId !== undefined) {
        console.log(`[Tweak] END (${Date.now() - startTime}ms) - Intent: reroute_constraint (Step #${targetStepId})`);
        return {
          type: 'reroute_constraint',
          targetStepId,
          targetSubStepId: data.targetSubStepId,
          title: data.title || targetStep?.title || 'Alternative action',
          instruction: data.instruction || 'Take this alternative step without friction.',
          acknowledgment: ack,
          dialogue: ack,
        };
      }
    }

    // Surgical Step Modification
    if (data.type === 'modify_step') {
      const targetStep = activeSteps.find((s) => s.id === data.targetStepId) || activeSteps.find((s) => !s.completed);
      const targetStepId = targetStep?.id ?? activeSteps[0]?.id;
      if (targetStepId !== undefined) {
        console.log(`[Tweak] END (${Date.now() - startTime}ms) - Intent: modify_step (Step #${targetStepId})`);
        return {
          type: 'modify_step',
          targetStepId,
          targetSubStepId: data.targetSubStepId,
          title: data.title || targetStep?.title || 'Adjusted action',
          instruction: data.instruction || targetStep?.instruction,
          acknowledgment: ack,
          dialogue: ack,
        };
      }
    }

    // Surgical Sub-Step Modification
    if (data.type === 'modify_substep') {
      let targetStepId = data.targetStepId;
      let targetSubStepId = data.targetSubStepId;

      if (!targetStepId || !targetSubStepId) {
        // Fallback: locate first step with pending sub-steps
        const stepWithSub = activeSteps.find((s) => s.subSteps && s.subSteps.some((sub) => !sub.completed));
        if (stepWithSub && stepWithSub.subSteps) {
          targetStepId = stepWithSub.id;
          targetSubStepId = stepWithSub.subSteps.find((sub) => !sub.completed)?.id ?? stepWithSub.subSteps[0]?.id;
        }
      }

      if (targetStepId !== undefined && targetSubStepId !== undefined) {
        console.log(
          `[Tweak] END (${Date.now() - startTime}ms) - Intent: modify_substep (Step #${targetStepId}, Sub #${targetSubStepId})`
        );
        return {
          type: 'modify_substep',
          targetStepId,
          targetSubStepId,
          title: data.title || 'Adjusted micro action',
          instruction: data.instruction,
          acknowledgment: ack,
          dialogue: ack,
        };
      }
    }

    // Surgical Step or Sub-Step Removal
    if (data.type === 'remove_step') {
      const targetStep = activeSteps.find((s) => s.id === data.targetStepId) || activeSteps.find((s) => !s.completed);
      const targetStepId = targetStep?.id ?? activeSteps[0]?.id;
      if (targetStepId !== undefined) {
        console.log(`[Tweak] END (${Date.now() - startTime}ms) - Intent: remove_step (Step #${targetStepId})`);
        return {
          type: 'remove_step',
          targetStepId,
          targetSubStepId: data.targetSubStepId,
          acknowledgment: ack,
          dialogue: ack,
        };
      }
    }

    // Surgical Step Insertion
    if (data.type === 'insert_step') {
      console.log(`[Tweak] END (${Date.now() - startTime}ms) - Intent: insert_step`);
      return {
        type: 'insert_step',
        afterStepId: data.targetStepId,
        title: data.title || 'Added action',
        instruction: data.instruction,
        acknowledgment: ack,
        dialogue: ack,
      };
    }

    if (data.type === 'complete_step') {
      const nextIncomplete = activeSteps.find((s) => !s.completed);
      const targetStepId = typeof data.targetStepId === 'number' ? data.targetStepId : nextIncomplete?.id;
      if (targetStepId !== undefined) {
        console.log(`[Tweak] END (${Date.now() - startTime}ms) - Intent: complete_step (Step #${targetStepId})`);
        return {
          type: 'complete_step',
          targetStepId,
          acknowledgment: ack,
          dialogue: ack,
        };
      }
    }

    if (data.type === 'shrink_step') {
      const nextIncompleteIdx = activeSteps.findIndex((s) => !s.completed);
      const targetStepIndex = typeof data.targetStepIndex === 'number' ? data.targetStepIndex : nextIncompleteIdx;
      if (targetStepIndex !== -1) {
        const microSteps: Step[] = Array.isArray(data.microSteps) && data.microSteps.length > 0
          ? data.microSteps.map(
              (s: { title?: string; text?: string; instruction?: string }, i: number) => {
                const title = s.title?.trim() || s.text?.trim() || 'Micro action';
                return {
                  id: baseTime + i + 1,
                  title,
                  instruction: s.instruction?.trim(),
                  text: title,
                  completed: false,
                  canSplit: false,
                };
              }
            )
          : generateMicroSteps(activeSteps[targetStepIndex]?.text || 'this step');

        console.log(
          `[Tweak] END (${Date.now() - startTime}ms) - Intent: shrink_step (Micro-steps: ${microSteps.length})`
        );
        return {
          type: 'shrink_step',
          targetStepIndex,
          microSteps,
          acknowledgment: ack,
          dialogue: ack,
        };
      }
    }

    if (data.type === 'all_complete') {
      console.log(`[Tweak] END (${Date.now() - startTime}ms) - Intent: all_complete`);
      return {
        type: 'all_complete',
        acknowledgment: ack,
        dialogue: ack,
      };
    }

    if (data.type === 'tweak_steps' || data.type === 'new_task') {
      const formattedSteps: Step[] = Array.isArray(data.steps)
        ? data.steps.map(
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
          )
        : [];

      console.log(
        `[Tweak] END (${Date.now() - startTime}ms) - Intent: ${data.type} (Adjusted steps: ${formattedSteps.length})`
      );
      return {
        type: 'new_task',
        title: taskTitle,
        acknowledgment: ack,
        dialogue: ack,
        steps: formattedSteps,
      };
    }

    if (data.type === 'crisis') {
      console.log(`[Tweak] END (${Date.now() - startTime}ms) - Intent: crisis`);
      return {
        type: 'crisis',
        acknowledgment: ack,
        dialogue: ack,
      };
    }

    if (data.type === 'off_topic') {
      console.log(`[Tweak] END (${Date.now() - startTime}ms) - Intent: off_topic`);
      return {
        type: 'off_topic',
        acknowledgment: ack,
        dialogue: ack,
      };
    }

    // Default or encouragement: return dialogue as advice
    console.log(`[Tweak] END (${Date.now() - startTime}ms) - Intent: encouragement`);
    return {
      type: 'all_complete',
      acknowledgment: ack,
      dialogue: ack,
    };
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }
    console.warn(`[Tweak] Offline Fallback (${Date.now() - startTime}ms):`, error);
    return interpretUserIntent(input, activeSteps, level);
  }
}
