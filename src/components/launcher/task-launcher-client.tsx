'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTaskStore } from '@/store/task-store';
import { decomposeTask } from '@/lib/assistant-engine';
import { HeroWelcome } from '@/components/launcher/hero-welcome';
import { EnergySelector } from '@/components/launcher/energy-selector';
import { ChatInput } from '@/components/shared/chat-input';

export function TaskLauncherClient() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    granularity,
    setGranularity,
    createNewSession,
    addMessage,
  } = useTaskStore();

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
        <div className="space-y-4">
          <ChatInput disabled={isSubmitting} onSubmit={handleStartTask} isCentered />
          <EnergySelector
            currentLevel={granularity}
            onSelect={setGranularity}
            disabled={isSubmitting}
          />
        </div>
      </div>
    </main>
  );
}
