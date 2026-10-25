import { z } from 'zod';

export const TaskStepSchema = z.object({
  title: z
    .string()
    .max(100)
    .describe('ACTION VERB PHRASE: 3 to 7 words (approx 20 to 45 characters). E.g. "Check the front porch", "Open payment portal". NEVER use generic labels like "Step 1" or "Phase 1".'),
  instruction: z
    .string()
    .max(250)
    .describe('MANDATORY TACTILE CONTEXT: Exactly 1 short concrete physical sentence (under 12 words, approx 35 to 65 characters) giving physical clarity. Must end with a period. Strictly NO run-on clauses with "so that" or "in order to".'),
});

export const TaskBreakdownSchema = z.object({
  title: z
    .string()
    .max(100)
    .describe('User overall mission title: 2 to 5 words (e.g. "Find Your Lost Cat", "Pay Electric Bill"). Never name it after step 1.'),
  dialogue: z
    .string()
    .max(300)
    .describe('Calm empathetic assurance: exactly 1 to 2 short English sentences (under 25 words total). Plain text only, no pipes or lists.'),
  steps: z
    .array(TaskStepSchema)
    .min(3)
    .max(5)
    .describe('Sequence of 3 to 5 tiny sequential micro-steps'),
});

export type TaskBreakdownOutput = z.infer<typeof TaskBreakdownSchema>;

export const ShrinkStepSchema = z.object({
  dialogue: z.string().max(300).describe('Gentle reassurance that wanting smaller steps is completely normal and healthy (1-2 brief sentences).'),
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
  dialogue: z.string().max(300).describe('Warm, empathetic response to the user (2-3 short sentences max)'),
  targetStepId: z.number().optional().describe('Target step ID if completing a step'),
  targetStepIndex: z.number().optional().describe('Target step index if shrinking a step'),
  microSteps: z.array(TaskStepSchema).optional().describe('Micro-steps if type is shrink_step'),
  steps: z.array(TaskStepSchema).optional().describe('Adjusted steps if type is new_task or tweak_steps'),
  title: z.string().max(100).optional().describe('Updated task title if applicable'),
});

export type AssistantIntentOutput = z.infer<typeof AssistantIntentSchema>;
