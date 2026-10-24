'use client';

import { useEffect } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { useTaskStore } from '@/store/task-store';
import { useHydrated } from '@/hooks/use-hydrated';
import { generateMicroSteps } from '@/lib/assistant-engine';
import { MAX_BREAKDOWN_WAIT_MS } from '@/lib/task-generation';
import {
  getLatestMessageWithSteps,
  getSessionSteps,
  getActiveStep,
  getActiveStepIndex,
} from '@/lib/session-utils';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { AppHeader } from '@/components/shared/layout/app-header';
import { HistoryDrawer } from '@/components/shared/layout/history-drawer';
import { ThemeToggleFab } from '@/components/shared/theme-toggle-fab';
import { FocusTunnelModal } from '@/components/task-breakdown/focus-tunnel-modal';
import { FocusLoader } from '@/components/shared/focus-loader';

export function TasksLayoutClient({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const routeSessionId = typeof params?.id === 'string' ? params.id : null;
  const hasHydrated = useHydrated();

  const {
    sessions,
    peekFuture,
    focusTunnelSessionId,
    isGeneratingTask,
    isHistoryOpen,
    theme,
    deleteSession,
    openFocusTunnel,
    closeFocusTunnel,
    setGeneratingTask,
    toggleTheme,
    closeHistory,
    toggleHistory,
    toggleStepCompletion,
    toggleSubStepCompletion,
    shrinkStep,
  } = useTaskStore();

  const activeSessionId = routeSessionId;

  // Ensure DOM matches store theme on mount and changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const activeSession =
    hasHydrated && routeSessionId
      ? sessions.find((s) => s.id === routeSessionId)
      : undefined;
  const focusTunnelOpen = Boolean(
    activeSessionId && focusTunnelSessionId === activeSessionId
  );

  const latestMessageWithSteps = getLatestMessageWithSteps(activeSession);
  const steps = getSessionSteps(activeSession);
  const activeStep = getActiveStep(steps);
  const activeStepIndex = getActiveStepIndex(steps);
  const totalStepsCount = steps.length;
  const activeStepNumber = activeStep
    ? steps.findIndex((s) => s.id === activeStep.id) + 1
    : null;

  const handleCompleteFocusStep = () => {
    if (!activeStep || !latestMessageWithSteps || !activeSession) return;
    const subSteps = activeStep.subSteps ?? [];
    const incompleteSubSteps = subSteps.filter((s) => !s.completed);

    if (incompleteSubSteps.length > 0) {
      const currentSubStep = incompleteSubSteps[0];
      const isLast = incompleteSubSteps.length === 1;
      toggleSubStepCompletion(
        activeSession.id,
        latestMessageWithSteps.id,
        activeStep.id,
        currentSubStep.id
      );
      if (isLast) {
        toggleStepCompletion(
          activeSession.id,
          latestMessageWithSteps.id,
          activeStep.id
        );
      }
    } else {
      toggleStepCompletion(
        activeSession.id,
        latestMessageWithSteps.id,
        activeStep.id
      );
    }
  };

  const handleCompleteWholeStep = () => {
    if (!activeStep || !latestMessageWithSteps || !activeSession) return;
    toggleStepCompletion(
      activeSession.id,
      latestMessageWithSteps.id,
      activeStep.id
    );
  };

  const handleShrinkFocusStep = () => {
    if (
      activeStepIndex !== -1 &&
      latestMessageWithSteps &&
      activeStep &&
      activeSession &&
      activeStep.canSplit
    ) {
      const subSteps = generateMicroSteps(activeStep.text);
      shrinkStep(activeSession.id, latestMessageWithSteps.id, activeStepIndex, subSteps);
    }
  };

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

  // Watchdog: never leave the loader covering the app if navigation is interrupted
  useEffect(() => {
    if (!isGeneratingTask) return;
    const timer = setTimeout(() => setGeneratingTask(false), MAX_BREAKDOWN_WAIT_MS);
    return () => clearTimeout(timer);
  }, [isGeneratingTask, setGeneratingTask]);

  const displayedTheme = hasHydrated ? theme : 'light';
  const peekEnabled = hasHydrated && peekFuture;

  // Global Keyboard Shortcuts
  useKeyboardShortcuts({
    onNewSession: () => {
      if (isGeneratingTask) return;
      closeFocusTunnel();
      closeHistory();
      router.push('/tasks');
    },
    onCompleteFocusStep: handleCompleteFocusStep,
    onShrinkFocusStep: handleShrinkFocusStep,
    isFocusTunnelActive: focusTunnelOpen && !isGeneratingTask,
    onToggleHistory: toggleHistory,
    onCloseHistory: closeHistory,
    isHistoryOpen,
  });

  return (
    <div className={`h-screen flex overflow-hidden font-sans ${peekEnabled ? 'peek-enabled' : ''}`}>
      {/* Main Full-Width Column (Distraction-Free Workspace) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* AppHeader - Fixed, Static & Never Unmounted */}
        <AppHeader
          hasActiveSteps={Boolean(activeSession && steps.length > 0)}
          hasBorder={Boolean(activeSessionId)}
          onToggleHistory={toggleHistory}
          onOpenFocusTunnel={
            activeSession && activeSessionId && steps.length > 0
              ? () => openFocusTunnel(activeSessionId)
              : undefined
          }
          showHomeButton={Boolean(activeSessionId)}
          onHome={() => {
            closeFocusTunnel();
            closeHistory();
            router.push('/tasks');
          }}
        />

        {/* Dynamic Page Content */}
        <div key={pathname} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {children}
        </div>
      </div>

      {/* Floating Theme Toggle (Bottom-Left FAB) */}
      {!focusTunnelOpen && !isGeneratingTask && (
        <ThemeToggleFab theme={displayedTheme} onToggle={toggleTheme} />
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
        activeStepNumber={activeStepNumber}
        totalStepsCount={totalStepsCount}
        sessionTitle={activeSession?.title || 'Focus Tunnel'}
        onClose={closeFocusTunnel}
        onComplete={handleCompleteFocusStep}
        onCompleteWholeStep={handleCompleteWholeStep}
        onShrink={handleShrinkFocusStep}
      />

      <FocusLoader isVisible={isGeneratingTask} />
    </div>
  );
}
