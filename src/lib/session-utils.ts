import type { ChatSession, ChatMessage, Step } from '@/types/task';

/**
 * Returns the most recent message in the session that contains breakdown steps.
 */
export function getLatestMessageWithSteps(
  session?: ChatSession | null
): ChatMessage | undefined {
  if (!session?.messages || session.messages.length === 0) return undefined;
  return [...session.messages].reverse().find((m) => m.steps && m.steps.length > 0);
}

/**
 * Returns the steps from the latest breakdown message in the session.
 */
export function getSessionSteps(session?: ChatSession | null): Step[] {
  return getLatestMessageWithSteps(session)?.steps || [];
}

/**
 * Returns the first uncompleted step (spotlight step) or null if all are completed.
 */
export function getActiveStep(steps: Step[]): Step | null {
  return steps.find((s) => !s.completed) || null;
}

/**
 * Returns the index of the first uncompleted step or -1 if all are completed.
 */
export function getActiveStepIndex(steps: Step[]): number {
  const active = getActiveStep(steps);
  return active ? steps.findIndex((s) => s.id === active.id) : -1;
}
