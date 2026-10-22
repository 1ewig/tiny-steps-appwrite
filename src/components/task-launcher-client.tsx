'use client';

import { useState, useEffect, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';
import { useTaskStore } from '@/store/task-store';
import { decomposeTask } from '@/lib/assistant-engine';
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';
import { AppHeader } from '@/components/layout/app-header';
import { Sidebar } from '@/components/layout/sidebar';
import { HeroWelcome } from '@/components/chat/hero-welcome';
import { ChatInput } from '@/components/chat/chat-input';

const emptySubscribe = () => () => {};

export function TaskLauncherClient() {
  const router = useRouter();

  const mounted = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inputKey, setInputKey] = useState(0);

  const {
    sessions,
    granularity,
    theme,
    createNewSession,
    switchSession,
    deleteSession,
    setGranularity,
    toggleTheme,
    addMessage,
  } = useTaskStore();

  // On launcher mount, ensure active session is cleared
  useEffect(() => {
    switchSession(null);
  }, [switchSession]);

  const handleStartTask = (text: string) => {
    if (!text.trim() || isSubmitting) return;

    setIsSubmitting(true);

    try {
      // 1. Create a clean new session
      const newSessionId = createNewSession(true);

      // 2. Add user message
      addMessage(newSessionId, {
        role: 'user',
        text,
      });

      // 3. Decompose task into empathetic micro-steps
      const breakdown = decomposeTask(text, granularity);
      addMessage(newSessionId, {
        role: 'assistant',
        text: breakdown.dialogue,
        steps: breakdown.steps,
      });

      // 4. Smoothly navigate to the dedicated task workspace
      router.push(`/tasks/${newSessionId}`);
    } catch (err) {
      setIsSubmitting(false);
      throw err;
    }
  };

  useKeyboardShortcuts({
    onNewSession: () => {
      // Clear input and focus
      setIsSubmitting(false);
      setInputKey((prev) => prev + 1);
    },
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
    <div className="h-screen flex overflow-hidden font-sans">
      {/* Collapsible Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        sessions={sessions}
        currentSessionId={null}
        theme={theme}
        onClose={() => setSidebarOpen(false)}
        onNewSession={() => {
          setSidebarOpen(false);
          setIsSubmitting(false);
          setInputKey((prev) => prev + 1);
        }}
        onSelectSession={(id) => {
          setSidebarOpen(false);
          router.push(`/tasks/${id}`);
        }}
        onDeleteSession={(id) => deleteSession(id)}
        onToggleTheme={toggleTheme}
      />

      {/* Main Launcher View */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <AppHeader
          sessionTitle="New gentle task"
          hasActiveSteps={false}
          granularity={granularity}
          peekFuture={false}
          onToggleSidebar={() => setSidebarOpen(true)}
          onSelectGranularity={setGranularity}
        />

        <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pb-12 overflow-y-auto">
          <div className="w-full max-w-2xl mx-auto space-y-6">
            <HeroWelcome />
            <ChatInput key={inputKey} disabled={isSubmitting} onSubmit={handleStartTask} isCentered />
          </div>
        </main>
      </div>
    </div>
  );
}
