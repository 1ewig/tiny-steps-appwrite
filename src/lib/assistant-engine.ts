import type { Step, GranularityLevel } from '@/types/task';
import { ENERGY_LEVEL_TEMPLATES } from '@/constants/presets';

export interface BreakdownResult {
  dialogue: string;
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
      dialogue: string;
    }
  | {
      type: 'shrink_step';
      targetStepIndex: number;
      microSteps: Step[];
      dialogue: string;
    }
  | {
      type: 'all_complete';
      dialogue: string;
    }
  | {
      type: 'new_task';
      title: string;
      dialogue: string;
      steps: Step[];
    }
  | {
      type: 'tweak_steps';
      title?: string;
      dialogue: string;
      steps: Step[];
    }
  | {
      type: 'encouragement';
      dialogue: string;
    }
  | {
      type: 'off_topic';
      dialogue: string;
    }
  | {
      type: 'crisis';
      dialogue: string;
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

  return {
    title: actionName,
    dialogue: template.dialogue(actionName),
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
    return {
      type: 'crisis',
      dialogue:
        'Please know you are not alone and your life matters. Support is free and confidential: text HOME to 741741 or call/text 988 anytime (24/7).',
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
    return {
      type: 'complete_step',
      targetStepId: nextIncomplete.id,
      dialogue:
        'Incredible work! Notice how taking that one microscopic action did not break you. Take a brief breath. Here is your next step:',
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
    return {
      type: 'all_complete',
      dialogue:
        'You did it! Every single tiny step is complete. Take a deep breath, unclench your jaw, and celebrate turning something heavy into momentum.',
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
    return {
      type: 'shrink_step',
      targetStepIndex: nextIncompleteIdx,
      microSteps: generateMicroSteps(nextIncomplete.text),
      dialogue:
        'No problem at all! If a step makes you hesitate, that is just your brain saying it is still too large. I shrank it into tiny bite-sized pieces for you:',
    };
  }

  // 3. New Task Decomposition
  const breakdown = decomposeTask(input, level);
  return {
    type: 'new_task',
    title: breakdown.title,
    dialogue: breakdown.dialogue,
    steps: breakdown.steps,
  };
}
