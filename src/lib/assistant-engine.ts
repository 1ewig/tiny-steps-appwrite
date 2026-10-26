import type { Step, GranularityLevel } from '@/types/task';
import { ENERGY_LEVEL_TEMPLATES } from '@/constants/presets';

export interface BreakdownResult {
  acknowledgment: string;
  dialogue?: string;
  title: string;
  steps: Step[];
  isRefused?: boolean;
  refusalCategory?: string;
  refusalReason?: string;
}

export type AssistantIntent =
  | {
      type: 'complete_step';
      targetStepId: number;
      acknowledgment: string;
      dialogue?: string;
    }
  | {
      type: 'modify_step';
      targetStepId: number;
      targetSubStepId?: number;
      title: string;
      instruction?: string;
      acknowledgment: string;
      dialogue?: string;
    }
  | {
      type: 'modify_substep';
      targetStepId: number;
      targetSubStepId: number;
      title: string;
      instruction?: string;
      acknowledgment: string;
      dialogue?: string;
    }
  | {
      type: 'reroute_constraint';
      targetStepId: number;
      targetSubStepId?: number;
      title: string;
      instruction?: string;
      acknowledgment: string;
      dialogue?: string;
    }
  | {
      type: 'remove_step';
      targetStepId: number;
      targetSubStepId?: number;
      acknowledgment: string;
      dialogue?: string;
    }
  | {
      type: 'insert_step';
      afterStepId?: number;
      title: string;
      instruction?: string;
      acknowledgment: string;
      dialogue?: string;
    }
  | {
      type: 'shrink_step';
      targetStepIndex: number;
      microSteps: Step[];
      acknowledgment: string;
      dialogue?: string;
    }
  | {
      type: 'all_complete';
      acknowledgment: string;
      dialogue?: string;
    }
  | {
      type: 'new_task';
      title: string;
      acknowledgment: string;
      dialogue?: string;
      steps: Step[];
    }
  | {
      type: 'tweak_steps';
      title?: string;
      acknowledgment: string;
      dialogue?: string;
      steps: Step[];
    }
  | {
      type: 'encouragement';
      acknowledgment: string;
      dialogue?: string;
    }
  | {
      type: 'off_topic';
      acknowledgment: string;
      dialogue?: string;
    }
  | {
      type: 'crisis';
      acknowledgment: string;
      dialogue?: string;
    };

/**
 * Splits any parent step into 3 microscopic, zero-guilt actions.
 */
export function generateMicroSteps(parentStepText: string): Step[] {
  const baseTime = Date.now();
  const cleanParent = parentStepText.length > 28 ? parentStepText.substring(0, 25) + '...' : parentStepText;
  return [
    {
      id: baseTime + 1,
      title: 'Prep: Look without doing',
      instruction: `Glance at what you need to "${cleanParent.toLowerCase()}".`,
      text: 'Prep: Look without doing',
      completed: false,
      canSplit: false,
    },
    {
      id: baseTime + 2,
      title: 'Touch: First physical contact',
      instruction: `Make light physical contact with just one item.`,
      text: 'Touch: First physical contact',
      completed: false,
      canSplit: false,
    },
    {
      id: baseTime + 3,
      title: 'Finish: Complete just this piece',
      instruction: `Wrap up just that piece cleanly and stop.`,
      text: 'Finish: Complete just this piece',
      completed: false,
      canSplit: false,
    },
  ];
}

/**
 * Decomposes any custom input into micro-steps based strictly on energy level (1-3).
 */
export function decomposeTask(input: string, level: GranularityLevel): BreakdownResult {
  const clean = input.trim() || 'this task';
  const actionName = clean.length > 50 ? clean.substring(0, 47) + '...' : clean;
  const template = ENERGY_LEVEL_TEMPLATES[level] ?? ENERGY_LEVEL_TEMPLATES[2];
  const ack = template.acknowledgment ? template.acknowledgment(actionName) : (template as any).dialogue(actionName);

  return {
    title: actionName,
    acknowledgment: ack,
    dialogue: ack,
    steps: template.steps.map((s, i) => {
      const stepText = s.text(actionName);
      return {
        id: Date.now() + i,
        title: stepText,
        instruction: 'Take a calm breath and take just this one physical step.',
        text: stepText,
        completed: false,
        canSplit: true,
      };
    }),
  };
}

/**
 * Classifies user intent from natural language input during a session.
 */
export function interpretUserIntent(
  input: string,
  activeSteps: Step[],
  level: GranularityLevel
): AssistantIntent {
  const lower = input.trim().toLowerCase();
  const nextIncomplete = activeSteps.find((s) => !s.completed);
  const nextIncompleteIdx = nextIncomplete ? activeSteps.findIndex((s) => s.id === nextIncomplete.id) : -1;

  // Crisis check
  if (
    lower.includes('suicide') ||
    lower.includes('kill myself') ||
    lower.includes('want to die') ||
    lower.includes('end it all') ||
    lower.includes("can't go on")
  ) {
    const ack = 'Tiny Steps is an everyday task decomposition tool and is not equipped for crisis or mental health support. For free, confidential support worldwide, please visit https://findahelpline.com';
    return {
      type: 'crisis',
      acknowledgment: ack,
      dialogue: ack,
    };
  }

  // 1. Step Completion Intent
  if (
    activeSteps.length > 0 &&
    nextIncomplete &&
    (lower.includes('done') ||
      lower.includes('finished') ||
      lower.includes('next') ||
      lower.includes('did it') ||
      lower === 'k' ||
      lower === 'ok')
  ) {
    const ack = 'Step completed. Here is your next step:';
    return {
      type: 'complete_step',
      targetStepId: nextIncomplete.id,
      acknowledgment: ack,
      dialogue: ack,
    };
  }

  // 2. All Steps Already Complete Intent
  if (
    activeSteps.length > 0 &&
    !nextIncomplete &&
    (lower.includes('done') ||
      lower.includes('finished') ||
      lower.includes('next') ||
      lower.includes('did it') ||
      lower === 'k' ||
      lower === 'ok' ||
      lower.includes('all done') ||
      lower.includes('complete'))
  ) {
    const ack = 'All steps complete. You turned initial friction into momentum.';
    return {
      type: 'all_complete',
      acknowledgment: ack,
      dialogue: ack,
    };
  }

  // 3. Overwhelm / Shrink Intent
  if (
    activeSteps.length > 0 &&
    nextIncomplete &&
    nextIncompleteIdx !== -1 &&
    (lower.includes('too hard') ||
      lower.includes('too big') ||
      lower.includes('stuck') ||
      lower.includes('scared') ||
      lower.includes('shrink') ||
      lower.includes('cannot') ||
      lower.includes("can't"))
  ) {
    const ack = 'Here is a smaller breakdown of this step to keep momentum going:';
    return {
      type: 'shrink_step',
      targetStepIndex: nextIncompleteIdx,
      microSteps: generateMicroSteps(nextIncomplete.text),
      acknowledgment: ack,
      dialogue: ack,
    };
  }

  // 3. New Task Decomposition
  const breakdown = decomposeTask(input, level);
  return {
    type: 'new_task',
    title: breakdown.title,
    acknowledgment: breakdown.acknowledgment,
    dialogue: breakdown.acknowledgment,
    steps: breakdown.steps,
  };
}
