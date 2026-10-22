'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTaskStore } from '@/store/task-store';
import { decomposeTask } from '@/lib/assistant-engine';
import { HeroWelcome } from '@/components/chat/hero-welcome';
import { ChatInput } from '@/components/chat/chat-input';

export function TaskLauncherClient() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    currentSessionId,
    switchSession,
    granularity,
    createNewSession,
    addMessage,
  } = useTaskStore();

  useEffect(() => {
    if (currentSessionId !== null) {
      switchSession(null);
    }
  }, [currentSessionId, switchSession]);

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

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pb-12 overflow-y-auto">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <HeroWelcome />
        <ChatInput disabled={isSubmitting} onSubmit={handleStartTask} isCentered />
      </div>
    </main>
  );
}
