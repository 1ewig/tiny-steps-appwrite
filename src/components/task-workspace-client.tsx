'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { useTaskStore } from '@/store/task-store';
import { useOfflineAssistant } from '@/hooks/use-offline-assistant';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { AmbientProgress } from '@/components/layout/ambient-progress';
import { AppHeader } from '@/components/layout/app-header';
import { Sidebar } from '@/components/layout/sidebar';
import { MessageFeed } from '@/components/chat/message-feed';
import { ChatInput } from '@/components/chat/chat-input';
import { FocusTunnelModal } from '@/components/focus/focus-tunnel-modal';

const emptySubscribe = () => () => {};

interface TaskWorkspaceClientProps {
  sessionId: string;
}

export function TaskWorkspaceClient({ sessionId }: TaskWorkspaceClientProps) {
  const router = useRouter();

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
    switchSession,
    deleteSession,
    setGranularity,
    togglePeek,
    setFocusTunnel,
    toggleTheme,
    addMessage,
    updateAssistantMessage,
    toggleStepCompletion,
    shrinkStep,
    skipStep,
  } = useTaskStore();

  const { interpretUserIntent, generateMicroSteps } = useOfflineAssistant();

  const currentSession = sessions.find((s) => s.id === sessionId);

  // Sync store's currentSessionId when viewing this task
  useEffect(() => {
    if (currentSession && currentSessionId !== sessionId) {
      switchSession(sessionId);
    }
  }, [sessionId, currentSession, currentSessionId, switchSession]);

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

  // Handle User Message Submission (Tweaking / Venting)
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

      const intent = interpretUserIntent(text, steps, granularity);

      if (latestMessageWithSteps) {
        // Edit existing breakdown card in-place (strictly one checklist per session)
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
          // Preserve any already completed steps and adjust the remaining ones
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
        // Initial breakdown fallback
        const initialSteps = intent.type === 'new_task' ? intent.steps : [];
        addMessage(currentSession.id, {
          role: 'assistant',
          text: intent.dialogue,
          steps: initialSteps,
        });
      }
    }, 600);
  };

  // Keyboard Shortcuts
  useKeyboardShortcuts({
    onNewSession: () => router.push('/tasks'),
    onCompleteFocusStep: () => {
      if (activeStep && latestMessageWithSteps && currentSession) {
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

  // Graceful 404 / Missing Session Screen
  if (!currentSession) {
    return (
      <div className="h-screen flex overflow-hidden font-sans">
        <Sidebar
          isOpen={sidebarOpen}
          sessions={sessions}
          currentSessionId={null}
          theme={theme}
          onClose={() => setSidebarOpen(false)}
          onNewSession={() => {
            setSidebarOpen(false);
            switchSession(null);
            router.push('/tasks');
          }}
          onSelectSession={(id) => {
            setSidebarOpen(false);
            router.push(`/tasks/${id}`);
          }}
          onDeleteSession={(id) => deleteSession(id)}
          onToggleTheme={toggleTheme}
        />

        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <AppHeader
            sessionTitle="Task not found"
            hasActiveSteps={false}
            granularity={granularity}
            peekFuture={false}
            onToggleSidebar={() => setSidebarOpen(true)}
            showNewTaskButton
            onNewTask={() => {
              switchSession(null);
              router.push('/tasks');
            }}
          />

          <main className="flex-1 flex flex-col items-center justify-center px-4 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-surface-subtle text-text-tertiary flex items-center justify-center text-xl shadow-subtle">
              🔍
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
        </div>
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
        currentSessionId={currentSession.id}
        theme={theme}
        onClose={() => setSidebarOpen(false)}
        onNewSession={() => {
          setSidebarOpen(false);
          switchSession(null);
          router.push('/tasks');
        }}
        onSelectSession={(id) => {
          setSidebarOpen(false);
          router.push(`/tasks/${id}`);
        }}
        onDeleteSession={(id) => {
          deleteSession(id);
          if (id === currentSession.id) {
            router.push('/tasks');
          }
        }}
        onToggleTheme={toggleTheme}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <AppHeader
          sessionTitle={currentSession.title || 'Gentle Task'}
          hasActiveSteps={steps.length > 0}
          granularity={granularity}
          peekFuture={peekFuture}
          onToggleSidebar={() => setSidebarOpen(true)}
          onOpenFocusTunnel={() => setFocusTunnel(true)}
          onSelectGranularity={setGranularity}
          onTogglePeek={togglePeek}
          showNewTaskButton
          onNewTask={() => {
            switchSession(null);
            router.push('/tasks');
          }}
        />

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
              onSkipStep={(msgId, stepIdx) => skipStep(currentSession.id, msgId, stepIdx)}
              onOpenFocusTunnel={() => setFocusTunnel(true)}
            />
          </div>
        </main>

        {/* Collapsed Chat Chip at Bottom (expands on demand for venting/tweaking) */}
        <ChatInput disabled={isTyping} onSubmit={handleSendMessage} collapsible />
      </div>

      {/* Focus Tunnel Modal */}
      <FocusTunnelModal
        isOpen={focusTunnelOpen}
        activeStep={activeStep}
        sessionTitle={currentSession.title || 'Focus Tunnel'}
        onClose={() => setFocusTunnel(false)}
        onComplete={() => {
          if (activeStep && latestMessageWithSteps) {
            toggleStepCompletion(currentSession.id, latestMessageWithSteps.id, activeStep.id);
          }
        }}
        onShrink={() => {
          if (activeStepIndex !== -1 && latestMessageWithSteps && activeStep) {
            const subSteps = generateMicroSteps(activeStep.text);
            shrinkStep(currentSession.id, latestMessageWithSteps.id, activeStepIndex, subSteps);
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
