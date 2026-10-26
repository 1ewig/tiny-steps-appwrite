import type { Step, GranularityLevel, AssistantIntent } from '@/types/task';

// Helper to normalize and enforce concise brevity on step titles and instructions
function cleanStepTitle(raw?: string, fallback: string = 'Next tiny action'): string {
  if (!raw) return fallback;
  const cleaned = raw.trim().replace(/\.+$/, '');
  return cleaned || fallback;
}

function cleanStepInstruction(raw?: string, fallback?: string): string {
  const text = (raw || fallback || 'Focus gently on just this physical motion.').trim();
  return text.endsWith('.') ? text : `${text}.`;
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
          title: cleanStepTitle(data.title, targetStep?.title || 'Alternative action'),
          instruction: cleanStepInstruction(data.instruction, targetStep?.instruction),
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
          title: cleanStepTitle(data.title, targetStep?.title || 'Adjusted action'),
          instruction: cleanStepInstruction(data.instruction, targetStep?.instruction),
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
          title: cleanStepTitle(data.title, 'Micro action'),
          instruction: cleanStepInstruction(data.instruction),
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
        title: cleanStepTitle(data.title, 'Added action'),
        instruction: cleanStepInstruction(data.instruction),
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
        if (!Array.isArray(data.microSteps) || data.microSteps.length === 0) {
          throw new Error('Invalid shrink_step microSteps received from assistant');
        }

        const microSteps: Step[] = data.microSteps.map(
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
        );

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
    console.error(`[Tweak] Failed (${Date.now() - startTime}ms):`, error);
    throw error;
  }
}
