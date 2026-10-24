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
        text: (task) => `Gather only what you need to start "${task}"`,
        effort: '~1 min',
        hint: "Only the essentials. Don't set up the whole workspace.",
      },
      {
        text: () => 'Do the easiest, most mechanical 2-minute part',
        effort: '~2 min',
        hint: 'Pick the most boring, obvious piece.',
      },
      {
        text: () => 'Spend 5 gentle minutes chipping away—rough draft is great',
        effort: '~5 min',
        hint: 'Rough draft, rough attempt, anything.',
      },
      {
        text: () => 'Reach a safe stopping point, bookmark it, and celebrate',
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
        text: () => 'Take one slow breath and let your shoulders drop',
        effort: '10 sec',
        hint: 'Let your shoulders drop away from your ears.',
      },
      {
        text: (task) => `Open the app, notebook, or room where "${task}" happens`,
        effort: '30 sec',
        hint: 'Opening is the step—not starting the hard part.',
      },
      {
        text: () => "Set up just the very first piece (don't start the hard part yet)",
        effort: '~1 min',
        hint: 'Just the first piece. Nothing more.',
      },
      {
        text: () => 'Do just 60 seconds of gentle, imperfect action',
        effort: '~1 min',
        hint: 'Sixty seconds, imperfect is fine.',
      },
      {
        text: () => 'Check in with yourself—you can stop here or keep rolling',
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
        text: () => 'Exhale slowly. You only have to do 10 seconds of physical motion right now.',
        effort: '5 sec',
        hint: "Ten seconds of motion. That's the whole task.",
      },
      {
        text: () => 'Put both feet flat on the floor or sit comfortably',
        effort: '10 sec',
        hint: 'Find a position that feels supported.',
      },
      {
        text: (task) => `Just LOOK at or open the place where "${task}" lives (zero pressure to work)`,
        effort: '15 sec',
        hint: 'Looking is enough. No pressure to work.',
      },
      {
        text: () => 'Touch or type just the very first word or object involved',
        effort: '20 sec',
        hint: 'One touch or one word.',
      },
      {
        text: () => 'Spend 30 seconds on the easiest piece, then you have permission to stop completely',
        effort: '30 sec',
        hint: 'Thirty seconds, then permission to stop completely.',
      },
    ],
  },
};
