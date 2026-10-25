'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTaskStore } from '@/store/task-store';
import { useHydrated } from '@/hooks/use-hydrated';
import {
  interpretUserIntentWithAI,
  shrinkStepWithAI,
} from '@/lib/task-generation';
import { TaskCard } from '@/components/task-breakdown/task-card';
import { PeekToggle } from '@/components/task-breakdown/peek-toggle';
import { ChatInput } from '@/components/shared/chat-input';
import { AppIcon } from '@/components/shared/app-icon';
import { MagnifyingGlass } from '@phosphor-icons/react';

interface TaskBreakdownClientProps {
  taskId?: string;
  sessionId?: string; // Backward compatibility
}

export function TaskBreakdownClient({ taskId, sessionId }: TaskBreakdownClientProps) {
  const router = useRouter();
  const [isTyping, setIsTyping] = useState(false);

  const activeId = taskId || sessionId || '';
  const hasHydrated = useHydrated();

  const {
    tasks,
    granularity,
    peekFuture,
    togglePeek,
    focusTunnelTaskId,
    updateTask,
    toggleStepCompletion,
    toggleSubStepCompletion,
    shrinkStep,
  } = useTaskStore();

  const currentTask = tasks.find((t) => t.id === activeId);
  const focusTunnelOpen = focusTunnelTaskId === activeId;

  const steps = currentTask?.steps ?? [];

  // Handle User Message Submission (Tweaking / Venting on the Living Card)
  const handleSendMessage = async (text: string) => {
    if (!currentTask || isTyping) return;

    setIsTyping(true);

    try {
      const intent = await interpretUserIntentWithAI(
        text,
        currentTask.title,
        steps,
        granularity
      );

      if (intent.type === 'complete_step') {
        toggleStepCompletion(currentTask.id, intent.targetStepId);
      } else if (intent.type === 'shrink_step') {
        shrinkStep(currentTask.id, intent.targetStepIndex, intent.microSteps);
      } else if (intent.type === 'new_task') {
        const existingCompleted = steps.filter((s) => s.completed);
        const combinedSteps = [
          ...existingCompleted,
          ...intent.steps.map((st, i) => ({ ...st, id: Date.now() + i, completed: false })),
        ];

        // Single Living Task Card: Mutate existing card steps and title in-place without overwriting guidance
        updateTask(currentTask.id, {
          title: intent.title || currentTask.title,
          steps: combinedSteps,
        });
      }
    } catch (err) {
      console.error('Failed to interpret intent:', err);
    } finally {
      setIsTyping(false);
    }
  };

  // While localStorage is rehydrating, show gentle quiet animated cairn instead of flashing "not found"
  if (!hasHydrated) {
    return (
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <AppIcon size={52} animated className="rounded-2xl shadow-subtle" />
      </main>
    );
  }

  // Missing Task Fallback (Header & Sidebar stay in static layout!)
  if (!currentTask) {
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
      {/* Task Workspace (Expansive 3-Column Grid) */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 scroll-smooth">
        <div className="w-full max-w-6xl mx-auto space-y-6 pb-28">
          <TaskCard
            guidanceText={currentTask.guidance}
            steps={steps}
            isAdjusting={isTyping}
            onToggleStep={(stepId) => {
              toggleStepCompletion(currentTask.id, stepId);
            }}
            onShrinkStep={async (stepIdx) => {
              const targetStep = steps[stepIdx];
              if (!targetStep) return;
              const { microSteps } = await shrinkStepWithAI(
                targetStep.text,
                currentTask.title
              );
              shrinkStep(currentTask.id, stepIdx, microSteps);
            }}
            onToggleSubStep={(parentStepId, subStepId) => {
              toggleSubStepCompletion(
                currentTask.id,
                parentStepId,
                subStepId
              );
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
