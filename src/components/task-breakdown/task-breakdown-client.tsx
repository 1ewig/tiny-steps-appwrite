'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTaskStore } from '@/store/task-store';
import { useOfflineAssistant } from '@/hooks/use-offline-assistant';
import { MessageFeed } from '@/components/task-breakdown/message-feed';
import { PeekToggle } from '@/components/task-breakdown/peek-toggle';
import { ChatInput } from '@/components/shared/chat-input';
import { MagnifyingGlass } from '@phosphor-icons/react';

interface TaskBreakdownClientProps {
  sessionId: string;
}

export function TaskBreakdownClient({ sessionId }: TaskBreakdownClientProps) {
  const router = useRouter();
  const [isTyping, setIsTyping] = useState(false);

  const {
    sessions,
    granularity,
    peekFuture,
    togglePeek,
    focusTunnelSessionId,
    addMessage,
    updateAssistantMessage,
    toggleStepCompletion,
    shrinkStep,
  } = useTaskStore();

  const { interpretUserIntent, generateMicroSteps } = useOfflineAssistant();

  const currentSession = sessions.find((s) => s.id === sessionId);
  const focusTunnelOpen = focusTunnelSessionId === sessionId;

  // Latest message with steps
  const latestMessageWithSteps = currentSession?.messages
    ? [...currentSession.messages].reverse().find((m) => m.steps && m.steps.length > 0)
    : undefined;

  const steps = latestMessageWithSteps?.steps || [];

  // Handle User Message Submission (Tweaking / Venting)
  const handleSendMessage = (text: string) => {
    if (!currentSession) return;

    addMessage(currentSession.id, {
      role: 'user',
      text,
    });

    setIsTyping(true);

    setTimeout(() => {
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
        } else if (intent.type === 'new_task') {
          const existingCompleted = (latestMessageWithSteps.steps || []).filter((s) => s.completed);
          const combinedSteps = [
            ...existingCompleted,
            ...intent.steps.map((st, i) => ({ ...st, id: Date.now() + i, completed: false })),
          ];
          const updatedDialogue =
            existingCompleted.length > 0
              ? `Plan updated! Kept your ${existingCompleted.length} completed step${
                  existingCompleted.length > 1 ? 's' : ''
                } and adjusted the rest:`
              : intent.dialogue;

          updateAssistantMessage(currentSession.id, latestMessageWithSteps.id, {
            text: updatedDialogue,
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
          className="py-2.5 px-5 rounded-xl bg-accent hover:bg-accent-hover text-text-inverse text-xs font-semibold shadow-subtle transition-all active:scale-95"
        >
          Start a new gentle task
        </button>
      </main>
    );
  }

  return (
    <>
      {/* Scrollable Feed */}
      <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 scroll-smooth">
        <div className="max-w-2xl mx-auto space-y-6 pb-28">
          <MessageFeed
            messages={currentSession.messages}
            isTyping={isTyping}
            onToggleStep={(msgId, stepId) => toggleStepCompletion(currentSession.id, msgId, stepId)}
            onShrinkStep={(msgId, stepIdx) => {
              const target = steps[stepIdx];
              const subSteps = target ? generateMicroSteps(target.text) : undefined;
              shrinkStep(currentSession.id, msgId, stepIdx, subSteps);
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
