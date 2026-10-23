'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTaskStore } from '@/store/task-store';
import { generateMicroSteps } from '@/lib/assistant-engine';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { AppHeader } from '@/components/shared/layout/app-header';
import { HistoryDrawer } from '@/components/shared/layout/history-drawer';
import { ThemeToggleFab } from '@/components/shared/theme-toggle-fab';
import { FocusTunnelModal } from '@/components/task-breakdown/focus-tunnel-modal';
import { FocusLoader } from '@/components/shared/focus-loader';
import { AppIcon } from '@/components/shared/app-icon';

const emptySubscribe = () => () => {};

export function TasksLayoutClient({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const routeSessionId = typeof params?.id === 'string' ? params.id : null;

  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const {
    sessions,
    currentSessionId,
    granularity,
    peekFuture,
    focusTunnelSessionId,
    isGeneratingTask,
    isHistoryOpen,
    theme,
    switchSession,
    deleteSession,
    setGranularity,
    openFocusTunnel,
    closeFocusTunnel,
    setGeneratingTask,
    toggleTheme,
    closeHistory,
    toggleHistory,
    toggleStepCompletion,
    shrinkStep,
  } = useTaskStore();

  const activeSessionId = routeSessionId ?? currentSessionId;

  // Sync route session with Zustand store
  useEffect(() => {
    if (routeSessionId && routeSessionId !== currentSessionId) {
      switchSession(routeSessionId);
    } else if (!routeSessionId && currentSessionId !== null) {
      switchSession(null);
    }
  }, [routeSessionId, currentSessionId, switchSession]);

  // Ensure DOM matches store theme on mount and changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const activeSession = sessions.find((s) => s.id === activeSessionId);
  const focusTunnelOpen = Boolean(
    activeSessionId && focusTunnelSessionId === activeSessionId
  );

  const latestMessageWithSteps = activeSession?.messages
    ? [...activeSession.messages].reverse().find((m) => m.steps && m.steps.length > 0)
    : undefined;

  const steps = latestMessageWithSteps?.steps || [];
  const activeStep = steps.find((s) => !s.completed) || null;
  const activeStepIndex = activeStep ? steps.findIndex((s) => s.id === activeStep.id) : -1;

  useEffect(() => {
    if (!focusTunnelSessionId || isGeneratingTask) return;
    if (!routeSessionId || focusTunnelSessionId !== routeSessionId) {
      closeFocusTunnel();
    }
  }, [routeSessionId, focusTunnelSessionId, isGeneratingTask, closeFocusTunnel]);

  useEffect(() => {
    if (!isGeneratingTask) return;
    if (!routeSessionId || focusTunnelSessionId !== routeSessionId) return;

    // Once arrived at the session view, smoothly fade out loader after a brief crossfade
    const timer = setTimeout(() => setGeneratingTask(false), 200);
    return () => clearTimeout(timer);
  }, [
    isGeneratingTask,
    routeSessionId,
    focusTunnelSessionId,
    setGeneratingTask,
  ]);

  // Global Keyboard Shortcuts
  useKeyboardShortcuts({
    onNewSession: () => {
      if (isGeneratingTask) return;
      closeFocusTunnel();
      closeHistory();
      switchSession(null);
      router.push('/tasks');
    },
    onCompleteFocusStep: () => {
      if (activeStep && latestMessageWithSteps && activeSession) {
        toggleStepCompletion(activeSession.id, latestMessageWithSteps.id, activeStep.id);
      }
    },
    isFocusTunnelActive: focusTunnelOpen && !isGeneratingTask,
    onToggleHistory: toggleHistory,
    onCloseHistory: closeHistory,
    isHistoryOpen,
  });

  if (!mounted) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-canvas text-text-tertiary">
        <AppIcon size={52} animated className="rounded-2xl shadow-subtle" />
      </div>
    );
  }

  return (
    <div className={`h-screen flex overflow-hidden font-sans ${peekFuture ? 'peek-enabled' : ''}`}>
      {/* Main Full-Width Column (Distraction-Free Workspace) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* AppHeader - Fixed, Static & Never Unmounted */}
        <AppHeader
          hasActiveSteps={Boolean(activeSession && steps.length > 0)}
          granularity={granularity}
          onToggleHistory={toggleHistory}
          onOpenFocusTunnel={
            activeSession && activeSessionId && steps.length > 0
              ? () => openFocusTunnel(activeSessionId)
              : undefined
          }
          onSelectGranularity={activeSessionId ? setGranularity : undefined}
          showHomeButton={Boolean(activeSessionId)}
          onHome={() => {
            closeFocusTunnel();
            closeHistory();
            switchSession(null);
            router.push('/tasks');
          }}
        />

        {/* Dynamic Page Content */}
        {children}
      </div>

      {/* Floating Theme Toggle (Bottom-Left FAB) */}
      {!focusTunnelOpen && !isGeneratingTask && (
        <ThemeToggleFab theme={theme} onToggle={toggleTheme} />
      )}

      {/* Slide-over History Drawer (Opens to Right, Above Header & Workspace) */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        sessions={sessions}
        currentSessionId={activeSessionId}
        onClose={closeHistory}
        onSelectSession={(id) => {
          closeHistory();
          closeFocusTunnel();
          switchSession(id);
          router.push(`/tasks/${id}`);
        }}
        onDeleteSession={(id) => {
          if (focusTunnelSessionId === id) {
            closeFocusTunnel();
          }
          deleteSession(id);
          if (id === activeSessionId) {
            router.push('/tasks');
          }
        }}
      />

      {/* Focus Tunnel Modal - Persistent */}
      <FocusTunnelModal
        isOpen={focusTunnelOpen}
        isBusy={isGeneratingTask}
        activeStep={activeStep}
        sessionTitle={activeSession?.title || 'Focus Tunnel'}
        onClose={closeFocusTunnel}
        onComplete={() => {
          if (activeStep && latestMessageWithSteps && activeSession) {
            toggleStepCompletion(activeSession.id, latestMessageWithSteps.id, activeStep.id);
          }
        }}
        onShrink={() => {
          if (activeStepIndex !== -1 && latestMessageWithSteps && activeStep && activeSession) {
            const subSteps = generateMicroSteps(activeStep.text);
            shrinkStep(activeSession.id, latestMessageWithSteps.id, activeStepIndex, subSteps);
          }
        }}
      />

      <FocusLoader isVisible={isGeneratingTask} />
    </div>
  );
}
