import { z } from 'zod';

export const TaskStepSchema = z.object({
  text: z.string().describe('Microscopic physical starter action (5-60 seconds)'),
  effort: z.string().describe('Estimated time e.g. "10 sec", "~1 min"'),
  hint: z.string().optional().describe('Whisper hint that lowers friction further'),
});

export const TaskBreakdownSchema = z.object({
  title: z.string().describe('A gentle 3-6 word summary of the task'),
  dialogue: z.string().describe('Empathetic, zero-shame validation acknowledging the difficulty'),
  steps: z
    .array(TaskStepSchema)
    .min(3)
    .max(6)
    .describe('Sequence of tiny sequential micro-steps'),
});

export type TaskBreakdownOutput = z.infer<typeof TaskBreakdownSchema>;

export const ShrinkStepSchema = z.object({
  dialogue: z.string().describe('Gentle reassurance that wanting smaller steps is completely normal and healthy'),
  microSteps: z
    .array(TaskStepSchema)
    .length(3)
    .describe('Exactly 3 microscopic physical actions (Prep, Touch, Finish)'),
});

export type ShrinkStepOutput = z.infer<typeof ShrinkStepSchema>;

export const AssistantIntentSchema = z.object({
  type: z
    .enum(['complete_step', 'shrink_step', 'all_complete', 'new_task', 'tweak_steps', 'encouragement'])
    .describe('The classified user intent'),
  dialogue: z.string().describe('Warm, empathetic response to the user'),
  targetStepId: z.number().optional().describe('Target step ID if completing a step'),
  targetStepIndex: z.number().optional().describe('Target step index if shrinking a step'),
  microSteps: z.array(TaskStepSchema).optional().describe('Micro-steps if type is shrink_step'),
  steps: z.array(TaskStepSchema).optional().describe('Adjusted steps if type is new_task or tweak_steps'),
  title: z.string().optional().describe('Updated task title if applicable'),
});

export type AssistantIntentOutput = z.infer<typeof AssistantIntentSchema>;
