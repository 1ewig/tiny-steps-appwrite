'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTaskStore } from '@/store/task-store';
import { generateMicroSteps } from '@/lib/assistant-engine';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { AmbientProgress } from '@/components/shared/layout/ambient-progress';
import { AppHeader } from '@/components/shared/layout/app-header';
import { Sidebar } from '@/components/shared/layout/sidebar';
import { FocusTunnelModal } from '@/components/task-breakdown/focus-tunnel-modal';
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

  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    setFocusTunnel,
    toggleTheme,
    toggleStepCompletion,
    shrinkStep,
    skipStep,
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

  const latestMessageWithSteps = activeSession?.messages
    ? [...activeSession.messages].reverse().find((m) => m.steps && m.steps.length > 0)
    : undefined;

  const steps = latestMessageWithSteps?.steps || [];
  const activeStep = steps.find((s) => !s.completed) || null;
  const activeStepIndex = activeStep ? steps.findIndex((s) => s.id === activeStep.id) : -1;

  const totalSteps = steps.length;
  const completedSteps = steps.filter((s) => s.completed).length;
  const progressPct = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;

  // Global Keyboard Shortcuts
  useKeyboardShortcuts({
    onNewSession: () => {
      switchSession(null);
      router.push('/tasks');
    },
    onCompleteFocusStep: () => {
      if (activeStep && latestMessageWithSteps && activeSession) {
        toggleStepCompletion(activeSession.id, latestMessageWithSteps.id, activeStep.id);
      }
    },
    isFocusTunnelActive: focusTunnelOpen,
  });

  if (!mounted) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-canvas text-text-tertiary">
        <span className="orb-pulse flex items-center justify-center">
          <AppIcon size={36} className="rounded-xl shadow-subtle" />
        </span>
      </div>
    );
  }

  return (
    <div className={`h-screen flex overflow-hidden font-sans ${peekFuture ? 'peek-enabled' : ''}`}>
      {/* Ambient Top Progress Bar - Persistent & Static */}
      <AmbientProgress progressPercentage={activeSessionId ? progressPct : 0} />

      {/* Collapsible Sidebar - Persistent & Static */}
      <Sidebar
        isOpen={sidebarOpen}
        sessions={sessions}
        currentSessionId={activeSessionId}
        theme={theme}
        onClose={() => setSidebarOpen(false)}
        onNewSession={() => {
          setSidebarOpen(false);
          switchSession(null);
          router.push('/tasks');
        }}
        onSelectSession={(id) => {
          setSidebarOpen(false);
          switchSession(id);
          router.push(`/tasks/${id}`);
        }}
        onDeleteSession={(id) => {
          deleteSession(id);
          if (id === activeSessionId) {
            router.push('/tasks');
          }
        }}
        onToggleTheme={toggleTheme}
      />

      {/* Main Column */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* AppHeader - Fixed, Static & Never Unmounted */}
        <AppHeader
          sessionTitle={activeSession ? activeSession.title : 'New gentle task'}
          hasActiveSteps={Boolean(activeSession && steps.length > 0)}
          granularity={granularity}
          onToggleSidebar={() => setSidebarOpen(true)}
          onOpenFocusTunnel={activeSession && steps.length > 0 ? () => setFocusTunnel(true) : undefined}
          onSelectGranularity={activeSessionId ? setGranularity : undefined}
          showNewTaskButton={Boolean(activeSessionId)}
          onNewTask={() => {
            switchSession(null);
            router.push('/tasks');
          }}
        />

        {/* Dynamic Page Content */}
        {children}
      </div>

      {/* Focus Tunnel Modal - Persistent */}
      <FocusTunnelModal
        isOpen={focusTunnelOpen}
        activeStep={activeStep}
        sessionTitle={activeSession?.title || 'Focus Tunnel'}
        onClose={() => setFocusTunnel(false)}
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
        onSkip={() => {
          if (activeStepIndex !== -1 && latestMessageWithSteps && activeSession) {
            skipStep(activeSession.id, latestMessageWithSteps.id, activeStepIndex);
          }
        }}
      />
    </div>
  );
}
