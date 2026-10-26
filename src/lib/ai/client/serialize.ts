import type { Step } from '@/types/task';
import type { PromptStepTreeItem } from '@/lib/ai/prompts';

/**
 * Serializes domain steps into the compact, lifecycle-aware shape sent to
 * AI prompt builders. Shared by assistant and shrink client calls.
 */
export function serializeStepTree(steps: Step[]): PromptStepTreeItem[] {
  return steps.map((step) => ({
    id: step.id,
    title: step.title,
    text: step.text,
    instruction: step.instruction,
    completed: Boolean(step.completed),
    subSteps: step.subSteps?.map((sub) => ({
      id: sub.id,
      title: sub.title,
      text: sub.text,
      instruction: sub.instruction,
      completed: Boolean(sub.completed),
    })),
  }));
}
