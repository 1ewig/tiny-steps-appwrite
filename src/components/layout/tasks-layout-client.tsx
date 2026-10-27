'use client';

import { useEffect } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { useTaskStore } from '@/store/task-store';
import { useHydrated } from '@/hooks/use-hydrated';
import { useFocusStepActions } from '@/hooks/use-focus-step-actions';
import { MAX_BREAKDOWN_WAIT_MS } from '@/constants/timing';
import { getActiveStep, getActiveStepIndex } from '@/lib/task-utils';
import { getTaskDraftKey, removeChatDraft } from '@/lib/chat-drafts';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { useShrinkStep } from '@/hooks/use-shrink-step';
import { useTaskSyncSubscription } from '@/hooks/use-task-sync';
import { AppIcon } from '@/components/shared/app-icon';
import { AppHeader } from '@/components/layout/app-header';
import { HistoryDrawer } from '@/components/layout/history-drawer';
import { ThemeToggleFab } from '@/components/shared/theme-toggle-fab';
import { FocusTunnelModal } from '@/components/task-breakdown/focus-tunnel-modal';
import { FocusLoader } from '@/components/shared/focus-loader';
import { OnboardingModal } from '@/components/onboarding/onboarding-modal';

export function TasksLayoutClient({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const routeTaskId = typeof params?.id === 'string' ? params.id : null;
  const hasHydrated = useHydrated();

  // Single-instance active two-way Appwrite TablesDB synchronization
  useTaskSyncSubscription();

  const {
    tasks,
    peekFuture,
    focusTunnelTaskId,
    isGeneratingTask,
    generationNotice,
    isHistoryOpen,
    isOnboardingOpen,
    hasSeenOnboarding,
    theme,
    deleteTask,
    markIntroSeen,
    openFocusTunnel,
    closeFocusTunnel,
    openOnboarding,
    closeOnboarding,
    completeOnboarding,
    setGeneratingTask,
    setGenerationNotice,
    toggleTheme,
    closeHistory,
    toggleHistory,
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

  const showOnboarding = Boolean(
    hasHydrated &&
      (isOnboardingOpen ||
        (!hasSeenOnboarding && tasks.length === 0 && !routeTaskId && !isGeneratingTask))
  );

  const steps = activeTask?.steps ?? [];
  const activeStep = getActiveStep(steps);
  const activeStepIndex = getActiveStepIndex(steps);
  const totalStepsCount = steps.length;
  const activeStepNumber = activeStep
    ? steps.findIndex((s) => s.id === activeStep.id) + 1
    : null;

  const { completeStepOrSubStep, completeWholeStep, shrinkStepAction } =
    useFocusStepActions();

  const showIntro = Boolean(
    focusTunnelOpen &&
      activeTask?.introSeen === false &&
      activeTask.guidance &&
      activeStep
  );

  const handleCompleteFocusStep = () => {
    if (!activeStep || !activeTask) return;
    completeStepOrSubStep(activeTask, activeStep);
  };

  const handleCompleteWholeStep = () => {
    if (!activeStep || !activeTask) return;
    completeWholeStep(activeTask.id, activeStep.id);
  };

  const shrinkFocusStepNow = async () => {
    if (
      activeStepIndex !== -1 &&
      activeStep &&
      activeTask &&
      activeStep.canSplit
    ) {
      await shrinkStepAction(
        activeTask.title,
        activeTask.id,
        activeStepIndex,
        steps,
        (err) => console.error('Failed to shrink step in Focus Tunnel:', err)
      );
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
    isFocusTunnelActive:
      focusTunnelOpen && !showIntro && !isGeneratingTask && !isShrinkingFocusStep,
    onToggleHistory: toggleHistory,
    onCloseHistory: closeHistory,
    isHistoryOpen,
  });

  if (!hasHydrated) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-canvas">
        <AppIcon size={52} animated className="rounded-2xl shadow-subtle" />
      </div>
    );
  }

  return (
    <div className={`h-screen flex overflow-hidden font-sans ${peekEnabled ? 'peek-enabled' : ''}`}>
      {/* Main Full-Width Column (Distraction-Free Workspace) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* AppHeader - Fixed, Static & Never Unmounted */}
        <AppHeader
          hasActiveSteps={Boolean(activeTask && steps.length > 0)}
          hasBorder={Boolean(activeTaskId)}
          onToggleHistory={toggleHistory}
          onOpenOnboarding={openOnboarding}
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
          removeChatDraft(getTaskDraftKey(id));
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
        showIntro={showIntro}
        introText={showIntro ? activeTask?.guidance : undefined}
        onBegin={() => {
          if (activeTask) markIntroSeen(activeTask.id);
        }}
        activeStep={activeStep}
        activeStepNumber={activeStepNumber}
        totalStepsCount={totalStepsCount}
        sessionTitle={activeTask?.title || 'Focus Tunnel'}
        onClose={closeFocusTunnel}
        onComplete={handleCompleteFocusStep}
        onCompleteWholeStep={handleCompleteWholeStep}
        onShrink={handleShrinkFocusStep}
      />

      <FocusLoader
        isVisible={isGeneratingTask || Boolean(generationNotice)}
        noticeMessage={generationNotice}
        onDismissNotice={() => {
          setGenerationNotice(null);
          setGeneratingTask(false);
        }}
      />

      {/* First-Time Gentle Onboarding Modal */}
      <OnboardingModal
        isOpen={showOnboarding}
        onClose={closeOnboarding}
        onComplete={completeOnboarding}
        focusInputOnClose={!isOnboardingOpen}
      />
    </div>
  );
}
