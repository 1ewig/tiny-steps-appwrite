import type { GranularityLevel } from '@/types/task';

export interface LevelTemplateStep {
  text: (task: string) => string;
  effort: string;
  hint?: string;
}

export interface LevelTemplate {
  name: string;
  acknowledgment: (task: string) => string;
  dialogue?: (task: string) => string;
  steps: LevelTemplateStep[];
}

export const ENERGY_LEVEL_TEMPLATES: Record<GranularityLevel, LevelTemplate> = {
  1: {
    name: 'A little stuck',
    acknowledgment: (task) =>
      `Let's make clean work of "${task}". We don't have to finish the whole mountain—let's just clear the initial friction.`,
    steps: [
      {
        text: () => 'Gather only the single core item needed',
        effort: 'Setup',
        hint: "Only the essentials. Don't set up the whole workspace.",
      },
      {
        text: () => 'Start on the simplest mechanical piece first',
        effort: 'Starter',
        hint: 'Pick the most boring, obvious piece.',
      },
      {
        text: () => 'Chip away at an imperfect draft',
        effort: 'Draft',
        hint: 'Rough draft, rough attempt, anything.',
      },
      {
        text: () => 'Reach a safe stopping point and bookmark',
        effort: 'Bookmark',
        hint: "Bookmark it and leave it. That's a complete win.",
      },
    ],
  },
  2: {
    name: 'Overwhelmed',
    acknowledgment: (task) =>
      `I hear you. "${task}" feels heavy right now. Let's not look at the summit—let's just place one foot on level ground.`,
    steps: [
      {
        text: () => 'Sit comfortably and let your shoulders drop',
        effort: 'Grounding',
        hint: 'Let your shoulders drop away from your ears. No work yet.',
      },
      {
        text: () => 'Open the exact room or app needed',
        effort: 'Stage',
        hint: 'Opening the space is the whole step—not doing the work.',
      },
      {
        text: () => 'Set up only the very first item',
        effort: 'Ready',
        hint: 'Just the first piece. Nothing more.',
      },
      {
        text: () => 'Take one gentle action with zero panic',
        effort: 'Momentum',
        hint: 'A gentle starter action, imperfect is fine.',
      },
      {
        text: () => 'Check in with yourself and choose pace',
        effort: 'Checkpoint',
        hint: 'Stop here or keep rolling—both are completely valid.',
      },
    ],
  },
  3: {
    name: 'Full paralysis',
    acknowledgment: (task) =>
      `Breathe. You are safe. You do not have to finish "${task}" today. Doing just 1% of this is a 100% victory.`,
    steps: [
      {
        text: () => 'Put feet flat and glance toward area',
        effort: 'Orient',
        hint: 'Looking is enough. Zero work expected from you right now.',
      },
      {
        text: () => 'Touch one item with your fingers',
        effort: 'Touch',
        hint: 'Just one light physical contact. Do not open or start it yet.',
      },
      {
        text: () => 'Complete just this single microscopic piece',
        effort: 'Micro-action',
        hint: 'One sentence, one dish, or one word. Then you are free to stop.',
      },
      {
        text: () => 'Stop right here and rest completely',
        effort: 'Complete',
        hint: 'You broke the freeze. Celebrate turning something heavy into momentum.',
      },
    ],
  },
};
