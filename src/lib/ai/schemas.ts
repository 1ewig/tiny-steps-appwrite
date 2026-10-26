import { z } from 'zod';

export const TaskStepSchema = z.object({
  title: z
    .string()
    .max(100)
    .describe('ACTION VERB PHRASE: 3 to 7 words (approx 20 to 45 characters). E.g. "Check the front porch", "Open payment portal". NEVER use generic labels like "Step 1" or "Phase 1".'),
  instruction: z
    .string()
    .max(250)
    .describe('MANDATORY TACTILE CONTEXT: Exactly 1 short concrete physical or digital sentence (under 12 words, approx 35 to 65 characters) giving physical clarity. Must end with a period. Strictly NO run-on clauses with "so that" or "in order to".'),
});

export const TaskBreakdownSchema = z.object({
  status: z
    .enum(['accepted', 'refused'])
    .describe('Whether this is an actionable task ("accepted") or needs gentle redirection ("refused")'),
  refusalCategory: z
    .enum(['none', 'self_harm', 'harmful', 'irrelevant', 'joke', 'gibberish'])
    .describe('Internal category if refused: "self_harm" for self-harm/suicide/crisis, "harmful" for violence/weapons/illegal acts, or "none" if accepted'),
  refusalReason: z
    .string()
    .optional()
    .describe('Brief explanation if refused, otherwise omit to save output tokens'),
  relevanceScore: z
    .number()
    .min(0)
    .max(100)
    .describe('Relevance score 0-100 (0=harmful/trivia/joke, 100=concrete actionable personal/digital task)'),
  title: z
    .string()
    .max(100)
    .describe('User overall mission title: 2 to 5 words (e.g. "Find Your Lost Cat", "Pay Electric Bill"). Never name it after step 1.'),
  acknowledgment: z
    .string()
    .max(300)
    .describe('If accepted: calm assurance under 25 words validating weight with zero cheerleading. If refused: warm, non-judgmental redirection explaining Tiny Steps is for helping you take action on things you want to do.'),
  steps: z
    .array(TaskStepSchema)
    .describe('Adaptive sequence of 2 to 6 steps if accepted (matching energy level guidelines); empty array [] if refused'),
});

export type TaskBreakdownOutput = z.infer<typeof TaskBreakdownSchema>;

export const ShrinkStepSchema = z.object({
  acknowledgment: z
    .string()
    .max(300)
    .describe('Gentle reassurance that wanting smaller steps is completely normal and healthy (1-2 brief sentences under 25 words).'),
  microSteps: z
    .array(TaskStepSchema)
    .min(2)
    .max(4)
    .describe('2 to 4 smaller sub-steps that dissolve the hesitation dimension (too big, unclear, decision needed, or emotional friction)'),
});

export type ShrinkStepOutput = z.infer<typeof ShrinkStepSchema>;

export const AssistantIntentSchema = z.object({
  type: z
    .enum([
      'complete_step',
      'modify_step',
      'modify_substep',
      'reroute_constraint',
      'remove_step',
      'insert_step',
      'shrink_step',
      'all_complete',
      'new_task',
      'tweak_steps',
      'encouragement',
      'off_topic',
      'crisis',
    ])
    .describe('The classified user intent'),
  acknowledgment: z
    .string()
    .max(300)
    .describe(
      'Warm, calm response acknowledging the user (1-2 short sentences max, under 30 words). If self-harm or crisis, offer human care and universal lifeline (https://findahelpline.com). If off_topic, ask one short gentle question to refocus.'
    ),
  targetStepId: z
    .union([z.number(), z.string().transform((v) => Number(v) || undefined)])
    .optional()
    .describe('Target step ID if targeting, completing, or modifying a specific parent step'),
  targetSubStepId: z
    .union([z.number(), z.string().transform((v) => Number(v) || undefined)])
    .optional()
    .describe('Target sub-step ID if modifying or removing a specific sub-step'),
  targetStepIndex: z
    .union([z.number(), z.string().transform((v) => Number(v) || undefined)])
    .optional()
    .describe('Target step index (0-based) if shrinking a step'),
  title: z
    .string()
    .max(100)
    .optional()
    .describe(
      'Updated STEP title (3 to 7 words) for the modified or inserted step. You NEVER change the overall task title.'
    ),
  instruction: z.string().max(250).optional().describe('Updated step instruction (single sentence under 12 words) if modifying or rerouting a step'),
  microSteps: z.array(TaskStepSchema).optional().describe('Micro-steps if type is shrink_step'),
  steps: z.array(TaskStepSchema).optional().describe('Adjusted steps if type is new_task or tweak_steps'),
});

export type AssistantIntentOutput = z.infer<typeof AssistantIntentSchema>;
