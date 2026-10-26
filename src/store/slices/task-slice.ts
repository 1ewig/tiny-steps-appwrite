import type { StateCreator } from 'zustand';
import type { TaskState, Task, Step, EnergyLevel, AssistantIntent } from '@/types/task';

export interface TaskSlice {
  tasks: Task[];
  setTasks: (tasks: Task[]) => void;
  createTask: (params: {
    title?: string;
    prompt: string;
    guidance?: string;
    steps?: Step[];
    energyLevel?: EnergyLevel;
  }) => string;
  setTaskTitle: (taskId: string, title: string) => void;
  updateTask: (
    taskId: string,
    updates: { title?: string; guidance?: string; steps?: Step[] }
  ) => void;
  deleteTask: (taskId: string) => void;
  markIntroSeen: (taskId: string) => void;
  toggleStepCompletion: (taskId: string, stepId: number) => void;
  toggleSubStepCompletion: (
    taskId: string,
    parentStepId: number,
    subStepId: number
  ) => void;
  shrinkStep: (taskId: string, stepIndex: number, subSteps: Step[]) => void;
  modifyStep: (
    taskId: string,
    stepId: number,
    updates: { title?: string; instruction?: string; text?: string }
  ) => void;
  modifySubStep: (
    taskId: string,
    parentStepId: number,
    subStepId: number,
    updates: { title?: string; instruction?: string; text?: string }
  ) => void;
  removeStep: (taskId: string, stepId: number) => void;
  removeSubStep: (taskId: string, parentStepId: number, subStepId: number) => void;
  insertStep: (
    taskId: string,
    afterStepId: number | null,
    step: { title: string; instruction?: string }
  ) => void;
  applyAssistantIntent: (taskId: string, intent: AssistantIntent) => void;
}

export const createTaskSlice: StateCreator<TaskState, [], [], TaskSlice> = (set, get) => ({
  tasks: [],

  setTasks: (tasks) => set({ tasks }),

  createTask: ({
    title,
    prompt,
    guidance = '',
    steps = [],
    energyLevel = 2,
  }) => {
    const newId = 'task_' + Date.now();
    const cleanTitle =
      title || (prompt.length > 28 ? prompt.substring(0, 25) + '...' : prompt) || 'New gentle task';

    const newTask: Task = {
      id: newId,
      title: cleanTitle,
      prompt,
      guidance,
      energyLevel,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      steps,
      introSeen: false,
    };

    set((state) => ({
      tasks: [{ ...newTask, userId: state.user?.id || null }, ...state.tasks],
    }));

    return newId;
  },

  setTaskTitle: (taskId: string, title: string) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, title, updatedAt: Date.now() } : t
      ),
    }));
  },

  updateTask: (taskId, updates) => {
    set((state) => ({
      tasks: state.tasks.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          title: updates.title !== undefined ? updates.title : t.title,
          guidance: updates.guidance !== undefined ? updates.guidance : t.guidance,
          steps: updates.steps !== undefined ? updates.steps : t.steps,
          updatedAt: Date.now(),
        };
      }),
    }));
  },

  deleteTask: (taskId: string) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
      focusTunnelTaskId:
        state.focusTunnelTaskId === taskId ? null : state.focusTunnelTaskId,
    }));
  },

  markIntroSeen: (taskId: string) => {
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId && t.introSeen !== true ? { ...t, introSeen: true } : t
      ),
    }));
  },

  toggleStepCompletion: (taskId: string, stepId: number) => {
    set((state) => ({
      tasks: state.tasks.map((task) => {
        if (task.id !== taskId) return task;
        const updatedSteps = task.steps.map((st) => {
          if (st.id !== stepId) return st;
          const nextCompleted = !st.completed;
          const subSteps = st.subSteps?.map((sub) => ({ ...sub, completed: nextCompleted }));
          return {
            ...st,
            completed: nextCompleted,
            completedAt: nextCompleted ? Date.now() : undefined,
            subSteps,
          };
        });
        return { ...task, steps: updatedSteps, updatedAt: Date.now() };
      }),
    }));
  },

  toggleSubStepCompletion: (
    taskId: string,
    parentStepId: number,
    subStepId: number
  ) => {
    set((state) => ({
      tasks: state.tasks.map((task) => {
        if (task.id !== taskId) return task;
        const updatedSteps = task.steps.map((st) => {
          if (st.id !== parentStepId || !st.subSteps) return st;
          const updatedSubSteps = st.subSteps.map((sub) =>
            sub.id === subStepId
              ? {
                  ...sub,
                  completed: !sub.completed,
                  completedAt: !sub.completed ? Date.now() : undefined,
                }
              : sub
          );
          return { ...st, subSteps: updatedSubSteps };
        });
        return { ...task, steps: updatedSteps, updatedAt: Date.now() };
      }),
    }));
  },

  shrinkStep: (taskId: string, stepIndex: number, subSteps: Step[]) => {
    set((state) => ({
      tasks: state.tasks.map((task) => {
        if (task.id !== taskId || !task.steps[stepIndex]) return task;
        const original = task.steps[stepIndex];

        const updatedSteps = [...task.steps];
        updatedSteps[stepIndex] = {
          ...original,
          subSteps,
          canSplit: false,
        };
        return { ...task, steps: updatedSteps, updatedAt: Date.now() };
      }),
    }));
  },

  modifyStep: (taskId, stepId, updates) => {
    set((state) => ({
      tasks: state.tasks.map((task) => {
        if (task.id !== taskId) return task;
        const updatedSteps = task.steps.map((st) => {
          if (st.id !== stepId) return st;
          const title = updates.title ?? st.title ?? st.text;
          const text = updates.text ?? title;
          return {
            ...st,
            title,
            text,
            instruction: updates.instruction ?? st.instruction,
          };
        });
        return { ...task, steps: updatedSteps, updatedAt: Date.now() };
      }),
    }));
  },

  modifySubStep: (taskId, parentStepId, subStepId, updates) => {
    set((state) => ({
      tasks: state.tasks.map((task) => {
        if (task.id !== taskId) return task;
        const updatedSteps = task.steps.map((st) => {
          if (st.id !== parentStepId || !st.subSteps) return st;
          const updatedSubSteps = st.subSteps.map((sub) => {
            if (sub.id !== subStepId) return sub;
            const title = updates.title ?? sub.title ?? sub.text;
            const text = updates.text ?? title;
            return {
              ...sub,
              title,
              text,
              instruction: updates.instruction ?? sub.instruction,
            };
          });
          return { ...st, subSteps: updatedSubSteps };
        });
        return { ...task, steps: updatedSteps, updatedAt: Date.now() };
      }),
    }));
  },

  removeStep: (taskId, stepId) => {
    set((state) => ({
      tasks: state.tasks.map((task) => {
        if (task.id !== taskId) return task;
        const updatedSteps = task.steps.filter((st) => st.id !== stepId);
        return { ...task, steps: updatedSteps, updatedAt: Date.now() };
      }),
    }));
  },

  removeSubStep: (taskId, parentStepId, subStepId) => {
    set((state) => ({
      tasks: state.tasks.map((task) => {
        if (task.id !== taskId) return task;
        const updatedSteps = task.steps.map((st) => {
          if (st.id !== parentStepId || !st.subSteps) return st;
          const remainingSubSteps = st.subSteps.filter((sub) => sub.id !== subStepId);
          return {
            ...st,
            subSteps: remainingSubSteps.length > 0 ? remainingSubSteps : undefined,
            canSplit: remainingSubSteps.length === 0,
          };
        });
        return { ...task, steps: updatedSteps, updatedAt: Date.now() };
      }),
    }));
  },

  insertStep: (taskId, afterStepId, step) => {
    set((state) => ({
      tasks: state.tasks.map((task) => {
        if (task.id !== taskId) return task;
        const newStep: Step = {
          id: Date.now(),
          title: step.title,
          text: step.title,
          instruction: step.instruction ?? 'Take a calm breath and take just this one physical step.',
          completed: false,
          canSplit: true,
        };

        let updatedSteps: Step[];
        if (afterStepId === null) {
          updatedSteps = [...task.steps, newStep];
        } else {
          const targetIdx = task.steps.findIndex((st) => st.id === afterStepId);
          if (targetIdx === -1) {
            updatedSteps = [...task.steps, newStep];
          } else {
            updatedSteps = [
              ...task.steps.slice(0, targetIdx + 1),
              newStep,
              ...task.steps.slice(targetIdx + 1),
            ];
          }
        }
        return { ...task, steps: updatedSteps, updatedAt: Date.now() };
      }),
    }));
  },

  applyAssistantIntent: (taskId, intent) => {
    switch (intent.type) {
      case 'complete_step':
        get().toggleStepCompletion(taskId, intent.targetStepId);
        break;
      case 'shrink_step':
        get().shrinkStep(taskId, intent.targetStepIndex, intent.microSteps);
        break;
      case 'modify_step':
      case 'reroute_constraint':
        if (intent.targetSubStepId) {
          get().modifySubStep(taskId, intent.targetStepId, intent.targetSubStepId, {
            title: intent.title,
            instruction: intent.instruction,
          });
        } else {
          get().modifyStep(taskId, intent.targetStepId, {
            title: intent.title,
            instruction: intent.instruction,
          });
        }
        break;
      case 'modify_substep':
        get().modifySubStep(taskId, intent.targetStepId, intent.targetSubStepId, {
          title: intent.title,
          instruction: intent.instruction,
        });
        break;
      case 'remove_step':
        if (intent.targetSubStepId) {
          get().removeSubStep(taskId, intent.targetStepId, intent.targetSubStepId);
        } else {
          get().removeStep(taskId, intent.targetStepId);
        }
        break;
      case 'insert_step':
        get().insertStep(taskId, intent.afterStepId ?? null, {
          title: intent.title,
          instruction: intent.instruction,
        });
        break;
      case 'new_task': {
        const currentTask = get().tasks.find((t) => t.id === taskId);
        if (!currentTask) break;
        const existingCompleted = currentTask.steps.filter((s) => s.completed);
        const combinedSteps = [
          ...existingCompleted,
          ...intent.steps.map((st, i) => ({ ...st, id: Date.now() + i, completed: false })),
        ];
        get().updateTask(taskId, { steps: combinedSteps });
        break;
      }
      case 'tweak_steps': {
        const currentTask = get().tasks.find((t) => t.id === taskId);
        if (!currentTask) break;
        get().updateTask(taskId, { steps: intent.steps });
        break;
      }
      case 'all_complete':
      case 'encouragement':
      case 'off_topic':
      case 'crisis':
      default:
        break;
    }
  },
});
