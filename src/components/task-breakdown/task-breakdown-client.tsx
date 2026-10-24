'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTaskStore } from '@/store/task-store';
import { useHydrated } from '@/hooks/use-hydrated';
import { useOfflineAssistant } from '@/hooks/use-offline-assistant';
import {
  getLatestMessageWithSteps,
  getSessionSteps,
} from '@/lib/session-utils';
import { TaskCard } from '@/components/task-breakdown/task-card';
import { PeekToggle } from '@/components/task-breakdown/peek-toggle';
import { ChatInput } from '@/components/shared/chat-input';
import { FocusLoader } from '@/components/shared/focus-loader';
import { MagnifyingGlass } from '@phosphor-icons/react';

interface TaskBreakdownClientProps {
  sessionId: string;
}

export function TaskBreakdownClient({ sessionId }: TaskBreakdownClientProps) {
  const router = useRouter();
  const [isTyping, setIsTyping] = useState(false);
  const typingTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hasHydrated = useHydrated();

  const {
    sessions,
    granularity,
    peekFuture,
    togglePeek,
    focusTunnelSessionId,
    addMessage,
    updateAssistantMessage,
    setSessionTitle,
    toggleStepCompletion,
    shrinkStep,
  } = useTaskStore();

  const { interpretUserIntent } = useOfflineAssistant();

  const currentSession = sessions.find((s) => s.id === sessionId);
  const focusTunnelOpen = focusTunnelSessionId === sessionId;

  // Cleanup typing timer on unmount
  useEffect(() => {
    return () => {
      if (typingTimerRef.current) {
        clearTimeout(typingTimerRef.current);
      }
    };
  }, []);

  // Latest message with steps
  const latestMessageWithSteps = getLatestMessageWithSteps(currentSession);
  const steps = getSessionSteps(currentSession);

  // Handle User Message Submission (Tweaking / Venting)
  const handleSendMessage = (text: string) => {
    if (!currentSession) return;

    setIsTyping(true);

    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current);
    }

    typingTimerRef.current = setTimeout(() => {
      typingTimerRef.current = null;
      setIsTyping(false);

      const intent = interpretUserIntent(text, steps, granularity);

      if (latestMessageWithSteps) {
        if (intent.type === 'complete_step') {
          toggleStepCompletion(currentSession.id, latestMessageWithSteps.id, intent.targetStepId);
          updateAssistantMessage(currentSession.id, latestMessageWithSteps.id, {
            text: intent.dialogue,
          });
        } else if (intent.type === 'shrink_step') {
          shrinkStep(currentSession.id, latestMessageWithSteps.id, intent.targetStepIndex, intent.microSteps);
          updateAssistantMessage(currentSession.id, latestMessageWithSteps.id, {
            text: intent.dialogue,
          });
        } else if (intent.type === 'all_complete') {
          updateAssistantMessage(currentSession.id, latestMessageWithSteps.id, {
            text: intent.dialogue,
          });
        } else if (intent.type === 'new_task') {
          const existingCompleted = (latestMessageWithSteps.steps || []).filter((s) => s.completed);
          const combinedSteps = [
            ...existingCompleted,
            ...intent.steps.map((st, i) => ({ ...st, id: Date.now() + i, completed: false })),
          ];
          const dialogue =
            existingCompleted.length > 0
              ? `${intent.dialogue}\n\nI kept your ${existingCompleted.length} completed step${
                  existingCompleted.length > 1 ? 's' : ''
                } and adjusted the rest.`
              : intent.dialogue;

          if (intent.title) {
            setSessionTitle(currentSession.id, intent.title);
          }

          // Single Living Task Card: Mutate existing card text and steps in-place
          updateAssistantMessage(currentSession.id, latestMessageWithSteps.id, {
            text: dialogue,
            steps: combinedSteps,
          });
        }
      } else {
        const initialSteps = intent.type === 'new_task' ? intent.steps : [];
        addMessage(currentSession.id, {
          role: 'assistant',
          text: intent.dialogue,
          steps: initialSteps,
        });
      }
    }, 600);
  };

  // While localStorage is rehydrating, show gentle quiet loader instead of flashing "not found"
  if (!hasHydrated) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <FocusLoader isVisible={true} />
      </main>
    );
  }

  // Missing Session Fallback (Header & Sidebar stay in static layout!)
  if (!currentSession) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-surface-subtle text-text-tertiary flex items-center justify-center shadow-subtle">
          <MagnifyingGlass size={24} weight="duotone" className="text-text-tertiary" />
        </div>
        <div className="space-y-1.5 max-w-sm">
          <h2 className="text-lg font-bold text-text-primary">This task could not be found</h2>
          <p className="text-text-secondary text-xs sm:text-sm leading-relaxed">
            It may have been cleared from local storage or created in another browser session.
          </p>
        </div>
        <button
          onClick={() => router.push('/tasks')}
          className="py-2.5 px-5 rounded-xl bg-accent hover:bg-accent-hover text-text-inverse text-xs font-semibold shadow-subtle transition-all active:scale-95 cursor-pointer"
        >
          Start a new gentle task
        </button>
      </main>
    );
  }

  return (
    <>
      {/* Task Workspace */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 scroll-smooth">
        <div className="max-w-2xl mx-auto space-y-6 pb-28">
          <TaskCard
            guidanceText={latestMessageWithSteps?.text}
            steps={steps}
            isAdjusting={isTyping}
            onToggleStep={(stepId) => {
              if (latestMessageWithSteps) {
                toggleStepCompletion(currentSession.id, latestMessageWithSteps.id, stepId);
              }
            }}
            onShrinkStep={(stepIdx) => {
              if (latestMessageWithSteps) {
                shrinkStep(currentSession.id, latestMessageWithSteps.id, stepIdx);
              }
            }}
          />
        </div>
      </main>

      {/* Collapsed Chat Chip at Bottom (expands on demand for venting/tweaking) */}
      <ChatInput disabled={isTyping} onSubmit={handleSendMessage} collapsible />

      {/* Floating Round Blur/Peek Toggle (Bottom-Right) */}
      {steps.length > 0 && !focusTunnelOpen && (
        <PeekToggle isPeekEnabled={peekFuture} onToggle={togglePeek} />
      )}
    </>
  );
}
