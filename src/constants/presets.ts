import type { GranularityLevel } from '@/types/task';

export interface LevelTemplateStep {
  text: (task: string) => string;
  effort: string;
  hint?: string;
}

export interface LevelTemplate {
  name: string;
  dialogue: (task: string) => string;
  steps: LevelTemplateStep[];
}

export const ENERGY_LEVEL_TEMPLATES: Record<GranularityLevel, LevelTemplate> = {
  1: {
    name: 'A little stuck',
    dialogue: (task) =>
      `Let's make quick work of "${task}". We don't have to finish the whole thing flawlessly—let's just get the initial friction out of the way.`,
    steps: [
      {
        text: () => 'Gather only the single core item that you need now',
        effort: '~1 min',
        hint: "Only the essentials. Don't set up the whole workspace.",
      },
      {
        text: () => 'Pick out the simplest mechanical piece to start on',
        effort: '~2 min',
        hint: 'Pick the most boring, obvious piece.',
      },
      {
        text: () => 'Chip away at an imperfect draft with zero pressure',
        effort: '~5 min',
        hint: 'Rough draft, rough attempt, anything.',
      },
      {
        text: () => 'Reach a safe stopping point, then bookmark it here',
        effort: '~1 min',
        hint: "Bookmark it and leave it. That's a win.",
      },
    ],
  },
  2: {
    name: 'Overwhelmed',
    dialogue: (task) =>
      `I hear you. "${task}" is carrying a lot of weight right now. Let's not look at the summit of the mountain—let's just put one foot forward on level ground.`,
    steps: [
      {
        text: () => 'Take one slow breath, then let your shoulders drop',
        effort: '10 sec',
        hint: 'Let your shoulders drop away from your ears.',
      },
      {
        text: () => 'Open the exact room or app where this task happens',
        effort: '30 sec',
        hint: 'Opening is the step—not starting the hard part.',
      },
      {
        text: () => 'Set up only the very first item without any stress',
        effort: '~1 min',
        hint: 'Just the first piece. Nothing more.',
      },
      {
        text: () => 'Take one gentle and imperfect step with zero panic',
        effort: '~1 min',
        hint: 'A gentle starter action, imperfect is fine.',
      },
      {
        text: () => 'Check in with yourself and choose your gentle pace',
        effort: '~1 min',
        hint: 'Stop here or keep rolling—both are okay.',
      },
    ],
  },
  3: {
    name: 'Full paralysis',
    dialogue: (task) =>
      `Breathe. You are safe. You do not have to finish "${task}" today. In fact, doing just 1% of this task is a 100% complete victory. Here is your microscopic permission slip:`,
    steps: [
      {
        text: () => 'Exhale very slowly and let tension leave your body',
        effort: '5 sec',
        hint: "Ten seconds of motion. That's the whole task.",
      },
      {
        text: () => 'Put both feet flat on the floor or sit comfortably',
        effort: '10 sec',
        hint: 'Find a position that feels supported.',
      },
      {
        text: () => 'Gently glance toward the area where your task sits',
        effort: '15 sec',
        hint: 'Looking is enough. No pressure to work.',
      },
      {
        text: () => 'Make light physical contact with your first object',
        effort: '20 sec',
        hint: 'One touch or one word.',
      },
      {
        text: () => 'Finish this microscopic action and rest completely',
        effort: '30 sec',
        hint: 'Finish this piece, then permission to stop completely.',
      },
    ],
  },
};
