import type { Task } from '@/types/task';

export function mergePersistedTaskState(
  persistedState: unknown,
  currentState: any
) {
  const state = persistedState as any;
  if (!state) return currentState;

  // Backward compatibility migration: convert legacy sessions to tasks if needed
  let tasks: Task[] = [];
  if (Array.isArray(state.tasks)) {
    tasks = state.tasks;
  } else if (Array.isArray(state.sessions)) {
    tasks = state.sessions
      .map((s: any): Task | null => {
        const latestMsg = [...(s.messages || [])]
          .reverse()
          .find((m: any) => m.steps && m.steps.length > 0);
        const steps = latestMsg?.steps || [];
        if (steps.length === 0 && (!s.messages || s.messages.length === 0)) return null;
        const prompt =
          s.messages?.find((m: any) => m.role === 'user')?.text || s.title || '';
        const guidance = latestMsg?.text || '';
        return {
          id: s.id,
          title: s.title || 'Untitled task',
          prompt,
          guidance,
          energyLevel: s.energyLevel || state.granularity || 2,
          createdAt: s.createdAt || Date.now(),
          updatedAt: s.createdAt || Date.now(),
          steps,
        };
      })
      .filter(Boolean) as Task[];
  }

  const validTasks = tasks.filter((t) => t && typeof t === 'object' && t.id);

  return {
    ...currentState,
    ...state,
    tasks: validTasks,
  };
}
