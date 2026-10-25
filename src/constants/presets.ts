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
      `Let's decompress "${task}" into clean, direct steps.`,
    steps: [
      {
        text: () => 'Open the primary file, tool, or workspace needed',
        effort: 'Setup',
        hint: 'Direct launch with zero extra organizing.',
      },
      {
        text: () => 'Execute the simplest starter piece first',
        effort: 'Starter',
        hint: 'Pick the most obvious piece to build momentum.',
      },
      {
        text: () => 'Draft the core substance without perfectionism',
        effort: 'Core',
        hint: 'Get an imperfect version in place.',
      },
      {
        text: () => 'Review and save a clean checkpoint',
        effort: 'Checkpoint',
        hint: 'Reach a solid stopping point.',
      },
    ],
  },
  2: {
    name: 'Overwhelmed',
    acknowledgment: (task) =>
      `Let's decompress "${task}" into low-friction steps.`,
    steps: [
      {
        text: () => 'Clear the lowest-hanging barrier to starting',
        effort: 'Entry',
        hint: 'The single easiest step to break inertia.',
      },
      {
        text: () => 'Complete the first mechanical piece',
        effort: 'Momentum',
        hint: 'A quick starter chunk to get rolling.',
      },
      {
        text: () => 'Tackle the main section in one focused push',
        effort: 'Primary',
        hint: 'Work through the primary task calmly.',
      },
      {
        text: () => 'Save your progress at a solid checkpoint',
        effort: 'Checkpoint',
        hint: 'Stop here or keep going as needed.',
      },
    ],
  },
  3: {
    name: 'Full paralysis',
    acknowledgment: (task) =>
      `Let's break "${task}" into ultra-small momentum actions.`,
    steps: [
      {
        text: () => 'Make the easiest possible contact with the task',
        effort: 'Contact',
        hint: 'Zero performance pressure.',
      },
      {
        text: () => 'Complete one tiny observable action of the work',
        effort: 'Micro-action',
        hint: 'One line, one item, or one piece.',
      },
      {
        text: () => 'Pause right here with momentum established',
        effort: 'Checkpoint',
        hint: 'Stopping here is a full win.',
      },
    ],
  },
};
