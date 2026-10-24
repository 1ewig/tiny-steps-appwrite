'use client';

import { useEffect } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { useTaskStore } from '@/store/task-store';
import { useHydrated } from '@/hooks/use-hydrated';
import { generateMicroSteps } from '@/lib/assistant-engine';
import { MAX_BREAKDOWN_WAIT_MS } from '@/lib/task-generation';
import { getActiveStep, getActiveStepIndex } from '@/lib/task-utils';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useShrinkStep } from '@/hooks/use-shrink-step';
import { AppHeader } from '@/components/shared/layout/app-header';
import { HistoryDrawer } from '@/components/shared/layout/history-drawer';
import { ThemeToggleFab } from '@/components/shared/theme-toggle-fab';
import { FocusTunnelModal } from '@/components/task-breakdown/focus-tunnel-modal';
import { FocusLoader } from '@/components/shared/focus-loader';

export function TasksLayoutClient({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const routeTaskId = typeof params?.id === 'string' ? params.id : null;
  const hasHydrated = useHydrated();

  const {
    tasks,
    peekFuture,
    focusTunnelTaskId,
    isGeneratingTask,
    isHistoryOpen,
    theme,
    deleteTask,
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

  const activeTaskId = routeTaskId;

  // Ensure DOM matches store theme on mount and changes
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const activeTask =
    hasHydrated && routeTaskId
      ? tasks.find((t) => t.id === routeTaskId)
      : undefined;

  const focusTunnelOpen = Boolean(
    activeTaskId && focusTunnelTaskId === activeTaskId
  );

  const steps = activeTask?.steps ?? [];
  const activeStep = getActiveStep(steps);
  const activeStepIndex = getActiveStepIndex(steps);
  const totalStepsCount = steps.length;
  const activeStepNumber = activeStep
    ? steps.findIndex((s) => s.id === activeStep.id) + 1
    : null;

  const handleCompleteFocusStep = () => {
    if (!activeStep || !activeTask) return;
    const subSteps = activeStep.subSteps ?? [];
    const incompleteSubSteps = subSteps.filter((s) => !s.completed);

    if (incompleteSubSteps.length > 0) {
      const currentSubStep = incompleteSubSteps[0];
      const isLast = incompleteSubSteps.length === 1;
      toggleSubStepCompletion(
        activeTask.id,
        activeStep.id,
        currentSubStep.id
      );
      if (isLast) {
        toggleStepCompletion(
          activeTask.id,
          activeStep.id
        );
      }
    } else {
      toggleStepCompletion(
        activeTask.id,
        activeStep.id
      );
    }
  };

  const handleCompleteWholeStep = () => {
    if (!activeStep || !activeTask) return;
    toggleStepCompletion(
      activeTask.id,
      activeStep.id
    );
  };

  const shrinkFocusStepNow = () => {
    if (
      activeStepIndex !== -1 &&
      activeStep &&
      activeTask &&
      activeStep.canSplit
    ) {
      const subSteps = generateMicroSteps(activeStep.text);
      shrinkStep(activeTask.id, activeStepIndex, subSteps);
    }
  };

  const {
    isShrinking: isShrinkingFocusStep,
    trigger: handleShrinkFocusStep,
    cancel: cancelShrinkFocusStep,
  } = useShrinkStep(shrinkFocusStepNow);

  useEffect(() => {
    cancelShrinkFocusStep();
  }, [activeStep?.id, focusTunnelOpen, cancelShrinkFocusStep]);

  useEffect(() => {
    if (!focusTunnelTaskId || isGeneratingTask) return;
    if (!routeTaskId || focusTunnelTaskId !== routeTaskId) {
      closeFocusTunnel();
    }
  }, [routeTaskId, focusTunnelTaskId, isGeneratingTask, closeFocusTunnel]);

  useEffect(() => {
    if (!isGeneratingTask) return;
    if (!routeTaskId || focusTunnelTaskId !== routeTaskId) return;

    // Once arrived at the task view, smoothly fade out loader after a brief crossfade
    const timer = setTimeout(() => setGeneratingTask(false), 200);
    return () => clearTimeout(timer);
  }, [
    isGeneratingTask,
    routeTaskId,
    focusTunnelTaskId,
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
    isFocusTunnelActive: focusTunnelOpen && !isGeneratingTask && !isShrinkingFocusStep,
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
          hasActiveSteps={Boolean(activeTask && steps.length > 0)}
          hasBorder={Boolean(activeTaskId)}
          onToggleHistory={toggleHistory}
          onOpenFocusTunnel={
            activeTask && activeTaskId && steps.length > 0
              ? () => openFocusTunnel(activeTaskId)
              : undefined
          }
          showHomeButton={Boolean(activeTaskId)}
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
        tasks={tasks}
        currentTaskId={activeTaskId}
        onClose={closeHistory}
        onSelectTask={(id) => {
          closeHistory();
          closeFocusTunnel();
          router.push(`/tasks/${id}`);
        }}
        onDeleteTask={(id) => {
          if (focusTunnelTaskId === id) {
            closeFocusTunnel();
          }
          deleteTask(id);
          if (id === activeTaskId) {
            router.push('/tasks');
          }
        }}
      />

      {/* Focus Tunnel Modal - Persistent */}
      <FocusTunnelModal
        isOpen={focusTunnelOpen}
        isBusy={isGeneratingTask}
        isShrinking={isShrinkingFocusStep}
        activeStep={activeStep}
        activeStepNumber={activeStepNumber}
        totalStepsCount={totalStepsCount}
        sessionTitle={activeTask?.title || 'Focus Tunnel'}
        onClose={closeFocusTunnel}
        onComplete={handleCompleteFocusStep}
        onCompleteWholeStep={handleCompleteWholeStep}
        onShrink={handleShrinkFocusStep}
      />

      <FocusLoader isVisible={isGeneratingTask} />
    </div>
  );
}
