'use client';

import { useState, useSyncExternalStore } from 'react';
import { useTaskStore } from '@/store/task-store';
import { useOfflineAssistant } from '@/hooks/use-offline-assistant';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { AmbientProgress } from '@/components/layout/ambient-progress';
import { AppHeader } from '@/components/layout/app-header';
import { Sidebar } from '@/components/layout/sidebar';
import { HeroWelcome } from '@/components/chat/hero-welcome';
import { MessageFeed } from '@/components/chat/message-feed';
import { PromptCapsule } from '@/components/chat/prompt-capsule';
import { FocusTunnelModal } from '@/components/focus/focus-tunnel-modal';

const emptySubscribe = () => () => {};

export function TinyStepsClient() {
  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  const {
    sessions,
    currentSessionId,
    granularity,
    peekFuture,
    focusTunnelOpen,
    theme,
    createNewSession,
    switchSession,
    deleteSession,
    clearAllSessions,
    setGranularity,
    togglePeek,
    setFocusTunnel,
    toggleTheme,
    addMessage,
    toggleStepCompletion,
    shrinkStep,
    skipStep,
  } = useTaskStore();

  const { decomposeTask } = useOfflineAssistant();

  const currentSession = sessions.find((s) => s.id === currentSessionId) || sessions[0];

  // Latest message with steps
  const latestMessageWithSteps = currentSession?.messages
    ? [...currentSession.messages].reverse().find((m) => m.steps && m.steps.length > 0)
    : undefined;

  const steps = latestMessageWithSteps?.steps || [];
  const activeStep = steps.find((s) => !s.completed) || null;
  const activeStepIndex = activeStep ? steps.findIndex((s) => s.id === activeStep.id) : -1;

  // Progress percentage
  const totalSteps = steps.length;
  const completedSteps = steps.filter((s) => s.completed).length;
  const progressPct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  // Handle User Message Submission
  const handleSendMessage = (text: string) => {
    if (!currentSession) return;

    // 1. Add User Message
    addMessage(currentSession.id, {
      role: 'user',
      text,
    });

    setIsTyping(true);

    // Simulate thoughtful empathetic response delay
    setTimeout(() => {
      setIsTyping(false);

      const lower = text.toLowerCase();
      const lastAssistantMsg = [...currentSession.messages]
        .reverse()
        .find((m) => m.role === 'assistant' && m.steps && m.steps.length > 0);

      // Check if user is completing an ongoing step
      if (
        lastAssistantMsg &&
        (lower.includes('done') || lower.includes('finished') || lower.includes('next') || lower.includes('did it'))
      ) {
        const nextIncomplete = lastAssistantMsg.steps?.find((s) => !s.completed);
        if (nextIncomplete) {
          toggleStepCompletion(currentSession.id, lastAssistantMsg.id, nextIncomplete.id);
        }
        addMessage(currentSession.id, {
          role: 'assistant',
          text: 'Incredible work! 🎉 Notice how taking that one microscopic action did not break you. Take a brief breath. Here is your next step:',
          steps: lastAssistantMsg.steps,
        });
      } else if (
        lastAssistantMsg &&
        (lower.includes('too hard') || lower.includes('too big') || lower.includes('stuck') || lower.includes('scared') || lower.includes('shrink'))
      ) {
        // Shrink the current step
        const curIdx = lastAssistantMsg.steps?.findIndex((s) => !s.completed) ?? -1;
        if (curIdx !== -1) {
          shrinkStep(currentSession.id, lastAssistantMsg.id, curIdx);
        }
        addMessage(currentSession.id, {
          role: 'assistant',
          text: 'No problem at all! If a step makes you hesitate, that is just your brain saying it is still too large. I shrank it into tiny bite-sized pieces for you:',
          steps: lastAssistantMsg.steps,
        });
      } else {
        // Decompose new task
        const breakdown = decomposeTask(text, granularity);
        addMessage(currentSession.id, {
          role: 'assistant',
          text: breakdown.dialogue,
          steps: breakdown.steps,
        });
      }
    }, 600);
  };

  // Keyboard Shortcuts
  useKeyboardShortcuts({
    onNewSession: () => createNewSession(true),
    onCompleteFocusStep: () => {
      if (activeStep && latestMessageWithSteps) {
        toggleStepCompletion(currentSession.id, latestMessageWithSteps.id, activeStep.id);
      }
    },
    isFocusTunnelActive: focusTunnelOpen,
  });

  if (!mounted) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-canvas text-text-tertiary">
        <span className="w-6 h-6 rounded-full bg-accent/20 orb-pulse flex items-center justify-center text-xs">
          🌱
        </span>
      </div>
    );
  }

  return (
    <div className={`h-screen flex overflow-hidden font-sans ${peekFuture ? 'peek-enabled' : ''}`}>
      {/* Ambient Top Progress Bar */}
      <AmbientProgress progressPercentage={progressPct} />

      {/* Collapsible Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        sessions={sessions}
        currentSessionId={currentSessionId}
        granularity={granularity}
        theme={theme}
        onClose={() => setSidebarOpen(false)}
        onNewSession={() => createNewSession(true)}
        onSelectSession={(id) => switchSession(id)}
        onDeleteSession={(id) => deleteSession(id)}
        onClearAll={clearAllSessions}
        onSelectGranularity={setGranularity}
        onToggleTheme={toggleTheme}
      />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <AppHeader
          sessionTitle={currentSession?.title || 'New session'}
          hasActiveSteps={steps.length > 0}
          granularity={granularity}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          onOpenFocusTunnel={() => setFocusTunnel(true)}
          onSelectGranularity={setGranularity}
        />

        {/* Scrollable Feed */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 scroll-smooth">
          <div className="max-w-2xl mx-auto space-y-6 pb-28">
            {currentSession?.messages.length === 0 ? (
              <HeroWelcome onSelectPreset={handleSendMessage} />
            ) : (
              <MessageFeed
                messages={currentSession?.messages || []}
                isTyping={isTyping}
                onToggleStep={(msgId, stepId) => toggleStepCompletion(currentSession.id, msgId, stepId)}
                onShrinkStep={(msgId, stepIdx) => shrinkStep(currentSession.id, msgId, stepIdx)}
                onSkipStep={(msgId, stepIdx) => skipStep(currentSession.id, msgId, stepIdx)}
                onOpenFocusTunnel={() => setFocusTunnel(true)}
              />
            )}
          </div>
        </main>

        {/* Floating Prompt Capsule */}
        <PromptCapsule
          peekFuture={peekFuture}
          disabled={isTyping}
          onSubmit={handleSendMessage}
          onTogglePeek={togglePeek}
        />
      </div>

      {/* Focus Tunnel Modal */}
      <FocusTunnelModal
        isOpen={focusTunnelOpen}
        activeStep={activeStep}
        sessionTitle={currentSession?.title || 'Focus Tunnel'}
        onClose={() => setFocusTunnel(false)}
        onComplete={() => {
          if (activeStep && latestMessageWithSteps) {
            toggleStepCompletion(currentSession.id, latestMessageWithSteps.id, activeStep.id);
          }
        }}
        onShrink={() => {
          if (activeStepIndex !== -1 && latestMessageWithSteps) {
            shrinkStep(currentSession.id, latestMessageWithSteps.id, activeStepIndex);
          }
        }}
        onSkip={() => {
          if (activeStepIndex !== -1 && latestMessageWithSteps) {
            skipStep(currentSession.id, latestMessageWithSteps.id, activeStepIndex);
          }
        }}
      />
    </div>
  );
}
