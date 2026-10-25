import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { TaskState, Task, EnergyLevel, Step } from '@/types/task';
import { generateMicroSteps } from '@/lib/assistant-engine';

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [],
      granularity: 2,
      peekFuture: false,
      focusTunnelTaskId: null,
      isGeneratingTask: false,
      generationNotice: null,
      isHistoryOpen: false,
      theme: 'light',

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
        };

        set((state) => ({
          tasks: [newTask, ...state.tasks],
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

      setGranularity: (level: EnergyLevel) => {
        set({ granularity: level });
      },

      togglePeek: () => {
        set((state) => ({ peekFuture: !state.peekFuture }));
      },

      openFocusTunnel: (taskId: string) => {
        set({ focusTunnelTaskId: taskId });
      },

      closeFocusTunnel: () => {
        set({ focusTunnelTaskId: null });
      },

      setGeneratingTask: (isGenerating: boolean) => {
        set({ isGeneratingTask: isGenerating });
      },

      setGenerationNotice: (notice: string | null) => {
        set({ generationNotice: notice });
      },

      openHistory: () => {
        set({ isHistoryOpen: true });
      },

      closeHistory: () => {
        set({ isHistoryOpen: false });
      },

      toggleHistory: () => {
        set((state) => ({ isHistoryOpen: !state.isHistoryOpen }));
      },

      toggleTheme: () => {
        set((state) => ({
          theme: state.theme === 'light' ? 'dark' : 'light',
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

      shrinkStep: (taskId: string, stepIndex: number, subSteps?: Step[]) => {
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== taskId || !task.steps[stepIndex]) return task;
            const original = task.steps[stepIndex];
            const microSteps = subSteps ?? generateMicroSteps(original.text);

            const updatedSteps = [...task.steps];
            updatedSteps[stepIndex] = {
              ...original,
              subSteps: microSteps,
              canSplit: false,
            };
            return { ...task, steps: updatedSteps, updatedAt: Date.now() };
          }),
        }));
      },
    }),
    {
      name: 'tinysteps_zustand_store',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : dummyStorage)),
      partialize: (state) => ({
        tasks: state.tasks,
        granularity: state.granularity,
        peekFuture: state.peekFuture,
        theme: state.theme,
      }),
      onRehydrateStorage: () => (state) => {
        if (typeof document !== 'undefined' && state?.theme === 'dark') {
          document.documentElement.classList.add('dark');
        }
      },
      merge: (persistedState, currentState) => {
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

        const validTasks = tasks.filter((t) => t.steps && t.steps.length > 0);

        return {
          ...currentState,
          ...state,
          tasks: validTasks,
        };
      },
    }
  )
);

const dummyStorage = {
  getItem: () => null,
  setItem: () => {},
  removeItem: () => {},
};
