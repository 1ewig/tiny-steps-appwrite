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

/**
 * Formats a session timestamp into a sensory-friendly, concise date label.
 */
export function formatSessionDate(timestamp?: number): string {
  if (!timestamp || typeof timestamp !== 'number' || Number.isNaN(timestamp)) return '';
  const date = new Date(timestamp);
  const now = new Date();

  // Same day
  if (
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate()
  ) {
    return 'Today';
  }

  // Yesterday
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  if (
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate()
  ) {
    return 'Yesterday';
  }

  // Within current year
  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  // Older years
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

