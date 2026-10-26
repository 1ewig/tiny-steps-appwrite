import type { Step, Task } from '@/types/task';

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
 * Formats a task timestamp into a sensory-friendly, concise date label.
 */
export function formatTaskDate(timestamp?: number): string {
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

// Backward-compatibility alias
export const formatSessionDate = formatTaskDate;

/**
 * Backward compatibility helper for legacy code
 */
export function getSessionSteps(task?: Task | null): Step[] {
  return task?.steps || [];
}

const CRISIS_PATTERN = /findahelpline|helpline|crisis|lifeline|suicide|self-harm|988|741741/i;

/**
 * Checks whether a guidance or notice message contains crisis helpline references.
 */
export function isCrisisGuidance(text?: string | null): boolean {
  if (!text) return false;
  return CRISIS_PATTERN.test(text);
}
