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
    .describe(
      'If accepted: calm, grounded companion reassurance under 25 words validating weight without cheerleading. ' +
      'Strictly forbidden: robotic clichés ("This is a common challenge", "We will break it down into simple, manageable actions/steps", "Don\'t worry"). ' +
      'For Level 3 (Full Paralysis), provide radical permission to only do one tiny piece with zero pressure to finish the whole mountain. ' +
      'If refused: warm, non-judgmental redirection explaining Tiny Steps is for helping you take action on things you want to do.'
    ),
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
    .max(3)
    .describe('2 to 3 smaller sub-steps (strictly maximum 3) that dissolve the hesitation dimension (too big, unclear, decision needed, or emotional friction)'),
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
      'Warm, calm response acknowledging the user (1-2 short sentences max, under 30 words). ' +
      'If self-harm or crisis, offer human care and universal lifeline (https://findahelpline.com). ' +
      'If off_topic / fluff / general chatbot query, set a calm 1-sentence boundary: "I can only adjust or reroute steps for this task. Which step feels in the way right now?". ' +
      'If encouragement (venting exhaustion), provide calm solidarity.'
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
    .max(200)
    .optional()
    .describe(
      'PUNCHY ACTION VERB PHRASE: 3 to 6 words (approx 18 to 32 characters). Strictly NO trailing period. E.g. "Order stamps online", "Submit via portal". NEVER write essays, explanations, or advice here.'
    ),
  instruction: z
    .string()
    .max(300)
    .optional()
    .describe(
      'MANDATORY TACTILE SENTENCE: Exactly 1 short physical or digital sentence under 10 words (approx 30 to 55 characters) giving concrete clarity. Must end with a period. Required whenever modifying, inserting, or rerouting a step.'
    ),
  microSteps: z
    .array(TaskStepSchema)
    .max(3)
    .optional()
    .describe('2 to 3 micro-steps (strictly maximum 3) if type is shrink_step. MANDATORY whenever type is shrink_step.'),
  steps: z.array(TaskStepSchema).optional().describe('Adjusted steps if type is new_task or tweak_steps'),
});

export type AssistantIntentOutput = z.infer<typeof AssistantIntentSchema>;
