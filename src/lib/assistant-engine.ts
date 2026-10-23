import type { Step, GranularityLevel } from '@/types/task';
import { PRESETS } from '@/constants/presets';

export interface BreakdownResult {
  dialogue: string;
  title: string;
  steps: Step[];
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
    };

/**
 * Splits any parent step into 3 microscopic, zero-guilt actions.
 */
export function generateMicroSteps(parentStepText: string): Step[] {
  const baseTime = Date.now();
  return [
    {
      id: baseTime + 1,
      text: `Prep: Just look at what you need to "${parentStepText.toLowerCase()}"`,
      effort: '10 sec',
      hint: "Look, don't do. Ten seconds.",
      completed: false,
      canSplit: false,
    },
    {
      id: baseTime + 2,
      text: `Touch: Do the first 20 seconds of "${parentStepText}"`,
      effort: '20 sec',
      hint: 'Twenty seconds of contact—nothing more.',
      completed: false,
      canSplit: false,
    },
    {
      id: baseTime + 3,
      text: `Finish: Complete just that piece cleanly`,
      effort: '30 sec',
      hint: 'Finish just this piece, then stop.',
      completed: false,
      canSplit: false,
    },
  ];
}

/**
 * Decomposes a task into micro-steps based on sensitivity level (1-3)
 * with preset matching or dynamic heuristic breakdown.
 */
export function decomposeTask(input: string, level: GranularityLevel): BreakdownResult {
  const clean = input.trim();
  const lower = clean.toLowerCase();

  // Match presets
  if (lower.includes('desk') || lower.includes('table') || lower.includes('room clean')) {
    return {
      dialogue: PRESETS.desk.dialogue,
      title: PRESETS.desk.title,
      steps: PRESETS.desk.levels[level].map((s, i) => ({
        id: Date.now() + i,
        text: s.text,
        effort: s.effort,
        hint: s.hint,
        completed: false,
        canSplit: true,
      })),
    };
  }

  if (
    lower.includes('email') ||
    lower.includes('message') ||
    lower.includes('reply') ||
    lower.includes('text') ||
    lower.includes('dread')
  ) {
    return {
      dialogue: PRESETS.email.dialogue,
      title: PRESETS.email.title,
      steps: PRESETS.email.levels[level].map((s, i) => ({
        id: Date.now() + i,
        text: s.text,
        effort: s.effort,
        hint: s.hint,
        completed: false,
        canSplit: true,
      })),
    };
  }

  if (lower.includes('laundry') || lower.includes('clothes') || lower.includes('wash')) {
    return {
      dialogue: PRESETS.laundry.dialogue,
      title: PRESETS.laundry.title,
      steps: PRESETS.laundry.levels[level].map((s, i) => ({
        id: Date.now() + i,
        text: s.text,
        effort: s.effort,
        hint: s.hint,
        completed: false,
        canSplit: true,
      })),
    };
  }

  if (
    lower.includes('10 things') ||
    lower.includes('overwhelmed') ||
    lower.includes('frozen') ||
    lower.includes('stuck') ||
    lower.includes('paralysis') ||
    lower.includes('too much')
  ) {
    return {
      dialogue: PRESETS.braindump.dialogue,
      title: PRESETS.braindump.title,
      steps: PRESETS.braindump.levels[level].map((s, i) => ({
        id: Date.now() + i,
        text: s.text,
        effort: s.effort,
        hint: s.hint,
        completed: false,
        canSplit: true,
      })),
    };
  }

  // Dynamic heuristic breakdown for any custom input
  const actionName = clean.length > 40 ? clean.substring(0, 37) + '...' : clean;

  if (level === 1) {
    return {
      dialogue: `Let's make quick work of "${actionName}". We don't have to finish the whole thing flawlessly—let's just get the initial friction out of the way.`,
      title: actionName,
      steps: [
        { id: Date.now() + 1, text: `Gather only what you need to start "${actionName}"`, effort: '~1 min', hint: "Only the essentials. Don't set up the whole workspace.", completed: false, canSplit: true },
        { id: Date.now() + 2, text: `Do the easiest, most mechanical 2-minute part`, effort: '~2 min', hint: 'Pick the most boring, obvious piece.', completed: false, canSplit: true },
        { id: Date.now() + 3, text: `Spend 5 gentle minutes chipping away—rough draft is great`, effort: '~5 min', hint: 'Rough draft, rough attempt, anything.', completed: false, canSplit: true },
        { id: Date.now() + 4, text: `Reach a safe stopping point, bookmark it, and celebrate`, effort: '~1 min', hint: "Bookmark it and leave it. That's a win.", completed: false, canSplit: true },
      ],
    };
  } else if (level === 2) {
    return {
      dialogue: `I hear you. "${actionName}" is carrying a lot of weight right now. Let's not look at the summit of the mountain—let's just put one foot forward on level ground.`,
      title: actionName,
      steps: [
        { id: Date.now() + 1, text: `Take one slow breath and let your shoulders drop`, effort: '10 sec', hint: 'Let your shoulders drop away from your ears.', completed: false, canSplit: true },
        { id: Date.now() + 2, text: `Open the app, notebook, or room where "${actionName}" happens`, effort: '30 sec', hint: 'Opening is the step—not starting the hard part.', completed: false, canSplit: true },
        { id: Date.now() + 3, text: `Set up just the very first piece (don't start the hard part yet)`, effort: '~1 min', hint: 'Just the first piece. Nothing more.', completed: false, canSplit: true },
        { id: Date.now() + 4, text: `Do just 60 seconds of gentle, imperfect action`, effort: '~1 min', hint: 'Sixty seconds, imperfect is fine.', completed: false, canSplit: true },
        { id: Date.now() + 5, text: `Check in with yourself—you can stop here or keep rolling`, effort: '~1 min', hint: 'Stop here or keep rolling—both are okay.', completed: false, canSplit: true },
      ],
    };
  } else {
    return {
      dialogue: `Breathe. You are safe. You do not have to finish "${actionName}" today. In fact, doing just 1% of this task is a 100% complete victory. Here is your microscopic permission slip:`,
      title: actionName,
      steps: [
        { id: Date.now() + 1, text: `Exhale slowly. You only have to do 10 seconds of physical motion right now.`, effort: '5 sec', hint: "Ten seconds of motion. That's the whole task.", completed: false, canSplit: true },
        { id: Date.now() + 2, text: `Put both feet flat on the floor or sit comfortably`, effort: '10 sec', hint: 'Find a position that feels supported.', completed: false, canSplit: true },
        { id: Date.now() + 3, text: `Just LOOK at or open the place where "${actionName}" lives (zero pressure to work)`, effort: '15 sec', hint: 'Looking is enough. No pressure to work.', completed: false, canSplit: true },
        { id: Date.now() + 4, text: `Touch or type just the very first word or object involved`, effort: '20 sec', hint: 'One touch or one word.', completed: false, canSplit: true },
        { id: Date.now() + 5, text: `Spend 30 seconds on the easiest piece, then you have permission to stop completely`, effort: '30 sec', hint: 'Thirty seconds, then permission to stop completely.', completed: false, canSplit: true },
      ],
    };
  }
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
