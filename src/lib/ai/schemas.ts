import { z } from 'zod';

export const TaskStepSchema = z.object({
  title: z
    .string()
    .max(50)
    .describe('PUNCHY ACTION VERB: 3 to 7 words MAXIMUM. Example: "Open one door", "Tap two fingers", "Put feet flat on floor". Strictly NO run-on sentences, paragraphs, or lists of alternatives.'),
  instruction: z
    .string()
    .max(100)
    .optional()
    .describe('1 short concrete sentence of physical context, max 12 words. Example: "Peek inside the bathroom or closet, then close it."'),
  effort: z
    .string()
    .max(20)
    .describe('Estimated time e.g. "10 sec", "30 sec", "~1 min"'),
  hint: z
    .string()
    .max(140)
    .optional()
    .describe('One brief, complete calming whisper sentence (under 15 words) e.g. "Looking is enough, no need to touch."'),
});

export const TaskBreakdownSchema = z.object({
  title: z.string().max(40).describe('A gentle 2-5 word summary of the task. E.g. "Find the Cat"'),
  dialogue: z.string().max(250).describe('Empathetic, zero-shame validation acknowledging the difficulty in 2-3 brief sentences. Max 40 words. Do NOT write an essay.'),
  steps: z
    .array(TaskStepSchema)
    .min(3)
    .max(5)
    .describe('Sequence of 3 to 5 tiny sequential micro-steps'),
});

export type TaskBreakdownOutput = z.infer<typeof TaskBreakdownSchema>;

export const ShrinkStepSchema = z.object({
  dialogue: z.string().max(180).describe('Gentle reassurance that wanting smaller steps is completely normal and healthy (1-2 brief sentences).'),
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
  dialogue: z.string().max(250).describe('Warm, empathetic response to the user (2-3 short sentences max)'),
  targetStepId: z.number().optional().describe('Target step ID if completing a step'),
  targetStepIndex: z.number().optional().describe('Target step index if shrinking a step'),
  microSteps: z.array(TaskStepSchema).optional().describe('Micro-steps if type is shrink_step'),
  steps: z.array(TaskStepSchema).optional().describe('Adjusted steps if type is new_task or tweak_steps'),
  title: z.string().max(40).optional().describe('Updated task title if applicable'),
});

export type AssistantIntentOutput = z.infer<typeof AssistantIntentSchema>;
