'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaskStore } from '@/store/task-store';
import { useHydrated } from '@/hooks/use-hydrated';
import {
  interpretUserIntentWithAI,
  shrinkStepWithAI,
} from '@/lib/ai/client';
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
  const [assistantFeedback, setAssistantFeedback] = useState<string | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  const showFeedback = (msg?: string) => {
    if (!msg) return;
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }
    setAssistantFeedback(msg);
    feedbackTimerRef.current = setTimeout(() => {
      setAssistantFeedback(null);
    }, 5000);
  };

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
    modifyStep,
    modifySubStep,
    removeStep,
    removeSubStep,
    insertStep,
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

      const ack = intent.acknowledgment || intent.dialogue;

      if (intent.type === 'complete_step') {
        toggleStepCompletion(currentTask.id, intent.targetStepId);
        showFeedback(ack);
      } else if (intent.type === 'shrink_step') {
        shrinkStep(currentTask.id, intent.targetStepIndex, intent.microSteps);
        showFeedback(ack);
      } else if (intent.type === 'modify_step' || intent.type === 'reroute_constraint') {
        if (intent.targetSubStepId) {
          modifySubStep(currentTask.id, intent.targetStepId, intent.targetSubStepId, {
            title: intent.title,
            instruction: intent.instruction,
          });
        } else {
          modifyStep(currentTask.id, intent.targetStepId, {
            title: intent.title,
            instruction: intent.instruction,
          });
        }
        showFeedback(ack);
      } else if (intent.type === 'modify_substep') {
        modifySubStep(currentTask.id, intent.targetStepId, intent.targetSubStepId, {
          title: intent.title,
          instruction: intent.instruction,
        });
        showFeedback(ack);
      } else if (intent.type === 'remove_step') {
        if (intent.targetSubStepId) {
          removeSubStep(currentTask.id, intent.targetStepId, intent.targetSubStepId);
        } else {
          removeStep(currentTask.id, intent.targetStepId);
        }
        showFeedback(ack);
      } else if (intent.type === 'insert_step') {
        insertStep(currentTask.id, intent.afterStepId ?? null, {
          title: intent.title,
          instruction: intent.instruction,
        });
        showFeedback(ack);
      } else if (intent.type === 'new_task') {
        const existingCompleted = steps.filter((s) => s.completed);
        const combinedSteps = [
          ...existingCompleted,
          ...intent.steps.map((st, i) => ({ ...st, id: Date.now() + i, completed: false })),
        ];

        // Step-only update: Task title and original guidance remain immutable
        updateTask(currentTask.id, {
          steps: combinedSteps,
        });
        showFeedback(ack);
      } else if (ack) {
        // Handles 'crisis', 'off_topic', 'all_complete', and general encouragement
        showFeedback(ack);
      }
    } catch (err) {
      console.error('Failed to interpret intent:', err);
      showFeedback('The assistant needs a moment. Please try again.');
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
            energyLevel={currentTask.energyLevel}
            onToggleStep={(stepId) => {
              toggleStepCompletion(currentTask.id, stepId);
            }}
            onShrinkStep={async (stepIdx) => {
              const targetStep = steps[stepIdx];
              if (!targetStep) return;
              const prevStep = steps[stepIdx - 1]?.text;
              const nextStep = steps[stepIdx + 1]?.text;
              try {
                const { microSteps } = await shrinkStepWithAI(
                  targetStep.text,
                  currentTask.title,
                  prevStep,
                  nextStep
                );
                shrinkStep(currentTask.id, stepIdx, microSteps);
              } catch (err) {
                console.error('Failed to shrink step:', err);
                showFeedback('Could not break down this step right now. Please try again.');
              }
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

      {/* Ephemeral Assistant Feedback Pill */}
      <AnimatePresence>
        {assistantFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-30 max-w-md w-[calc(100%-2rem)] sm:w-auto px-4 py-2.5 rounded-2xl bg-surface-elevated/95 backdrop-blur-md border border-border-subtle shadow-capsule text-center pointer-events-none"
          >
            <p className="text-xs sm:text-sm text-text-primary font-medium leading-relaxed">
              {assistantFeedback}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapsed Chat Chip at Bottom (expands on demand for venting/tweaking) */}
      <ChatInput disabled={isTyping} onSubmit={handleSendMessage} collapsible />

      {/* Floating Round Blur/Peek Toggle (Bottom-Right) */}
      {steps.length > 0 && !focusTunnelOpen && (
        <PeekToggle isPeekEnabled={peekFuture} onToggle={togglePeek} />
      )}
    </>
  );
}
