'use client';

import { useTaskStore } from '@/store/task-store';
import { useStartTask } from '@/hooks/use-start-task';
import { HeroWelcome } from '@/components/start/hero-welcome';
import { EnergySelector } from '@/components/start/energy-selector';
import { ChatInput } from '@/components/shared/chat-input';

export function StartClient() {
  const { granularity, setGranularity } = useTaskStore();
  const { startTask, isGeneratingTask, error, restoreText } = useStartTask();

  return (
    <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 pb-12 overflow-y-auto">
      <div className="w-full max-w-2xl mx-auto space-y-6">
        <HeroWelcome />
        <div className="space-y-4">
          <ChatInput
            key={restoreText ?? 'fresh'}
            disabled={isGeneratingTask}
            onSubmit={startTask}
            initialText={restoreText ?? ''}
            isCentered
          />
          {error && (
            <p
              aria-live="polite"
              className="text-xs text-text-secondary text-center leading-relaxed"
            >
              {error}
            </p>
          )}
          <EnergySelector
            currentLevel={granularity}
            onSelect={setGranularity}
            disabled={isGeneratingTask}
          />
        </div>
      </div>
    </main>
  );
}
