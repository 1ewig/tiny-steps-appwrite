import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { TaskState, ChatSession, GranularityLevel, Step } from '@/types/task';
import { generateMicroSteps } from '@/lib/assistant-engine';

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      sessions: [],
      currentSessionId: null,
      granularity: 2,
      peekFuture: false,
      focusTunnelOpen: false,
      theme: 'light',

      createNewSession: (switchImmediately = true) => {
        const newId = 'session_' + Date.now();
        const newSession: ChatSession = {
          id: newId,
          title: 'New gentle task',
          createdAt: Date.now(),
          messages: [],
        };

        set((state) => ({
          sessions: [newSession, ...state.sessions],
          currentSessionId: switchImmediately ? newId : state.currentSessionId,
        }));

        return newId;
      },

      switchSession: (sessionId: string | null) => {
        set({ currentSessionId: sessionId });
      },

      deleteSession: (sessionId: string) => {
        set((state) => {
          const filtered = state.sessions.filter((s) => s.id !== sessionId);
          return {
            sessions: filtered,
            currentSessionId: state.currentSessionId === sessionId ? null : state.currentSessionId,
          };
        });
      },

      clearAllSessions: () => {
        set({
          sessions: [],
          currentSessionId: null,
        });
      },

      setGranularity: (level: GranularityLevel) => {
        set({ granularity: level });
      },

      togglePeek: () => {
        set((state) => ({ peekFuture: !state.peekFuture }));
      },

      setFocusTunnel: (open: boolean) => {
        set({ focusTunnelOpen: open });
      },

      toggleTheme: () => {
        set((state) => {
          const next = state.theme === 'light' ? 'dark' : 'light';
          if (typeof document !== 'undefined') {
            if (next === 'dark') {
              document.documentElement.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
            }
          }
          return { theme: next };
        });
      },

      addMessage: (sessionId: string, message) => {
        set((state) => {
          const sessions = state.sessions.map((sess) => {
            if (sess.id !== sessionId) return sess;

            const fullMessage = {
              ...message,
              id: 'msg_' + Date.now() + Math.random().toString(36).slice(2, 6),
              timestamp: Date.now(),
            };

            const updatedMessages = [...sess.messages, fullMessage];
            // Auto update session title from first user prompt
            let updatedTitle = sess.title;
            if (sess.messages.length === 0 && message.role === 'user') {
              updatedTitle = message.text.length > 28 ? message.text.substring(0, 25) + '...' : message.text;
            }

            return {
              ...sess,
              title: updatedTitle,
              messages: updatedMessages,
            };
          });

          return { sessions };
        });
      },

      updateAssistantMessage: (sessionId, messageId, updates) => {
        set((state) => {
          const sessions = state.sessions.map((sess) => {
            if (sess.id !== sessionId) return sess;
            const messages = sess.messages.map((msg) => {
              if (msg.id !== messageId) return msg;
              return {
                ...msg,
                text: updates.text !== undefined ? updates.text : msg.text,
                steps: updates.steps !== undefined ? updates.steps : msg.steps,
              };
            });
            return { ...sess, messages };
          });
          return { sessions };
        });
      },

      toggleStepCompletion: (sessionId: string, messageId: string, stepId: number) => {
        set((state) => {
          const sessions = state.sessions.map((sess) => {
            if (sess.id !== sessionId) return sess;
            const messages = sess.messages.map((msg) => {
              if (msg.id !== messageId || !msg.steps) return msg;
              const steps = msg.steps.map((st) => (st.id === stepId ? { ...st, completed: !st.completed } : st));
              return { ...msg, steps };
            });
            return { ...sess, messages };
          });
          return { sessions };
        });
      },

      shrinkStep: (sessionId: string, messageId: string, stepIndex: number, subSteps?: Step[]) => {
        set((state) => {
          const sessions = state.sessions.map((sess) => {
            if (sess.id !== sessionId) return sess;
            const messages = sess.messages.map((msg) => {
              if (msg.id !== messageId || !msg.steps || !msg.steps[stepIndex]) return msg;
              const original = msg.steps[stepIndex];
              const microSteps = subSteps ?? generateMicroSteps(original.text);

              const updatedSteps = [...msg.steps];
              updatedSteps.splice(stepIndex, 1, ...microSteps);
              return { ...msg, steps: updatedSteps };
            });
            return { ...sess, messages };
          });
          return { sessions };
        });
      },

      skipStep: (sessionId: string, messageId: string, stepIndex: number) => {
        set((state) => {
          const sessions = state.sessions.map((sess) => {
            if (sess.id !== sessionId) return sess;
            const messages = sess.messages.map((msg) => {
              if (msg.id !== messageId || !msg.steps || !msg.steps[stepIndex]) return msg;
              const updatedSteps = [...msg.steps];
              if (updatedSteps.length > stepIndex + 1) {
                const [skipped] = updatedSteps.splice(stepIndex, 1);
                updatedSteps.splice(stepIndex + 1, 0, skipped);
              } else {
                updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], completed: true };
              }
              return { ...msg, steps: updatedSteps };
            });
            return { ...sess, messages };
          });
          return { sessions };
        });
      },
    }),
    {
      name: 'tinysteps_zustand_store',
      storage: createJSONStorage(() => (typeof window !== 'undefined' ? localStorage : dummyStorage)),
      onRehydrateStorage: () => (state) => {
        if (typeof document !== 'undefined' && state?.theme === 'dark') {
          document.documentElement.classList.add('dark');
        }
      },
      merge: (persistedState, currentState) => {
        const state = persistedState as Partial<TaskState> | undefined;
        if (!state) return currentState;
        const validSessions = (state.sessions || []).filter(
          (s) => s.messages && s.messages.length > 0
        );
        return {
          ...currentState,
          ...state,
          sessions: validSessions,
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
