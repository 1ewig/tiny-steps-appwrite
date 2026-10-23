'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ClockCounterClockwise } from '@phosphor-icons/react';
import { useTaskStore } from '@/store/task-store';
import { useStartTask } from '@/hooks/use-start-task';
import { HeroWelcome } from '@/components/start/hero-welcome';
import { EnergySelector } from '@/components/start/energy-selector';
import { ChatInput } from '@/components/shared/chat-input';
import { tactileButtonVariants } from '@/constants/animation';

export function StartClient() {
  const { granularity, setGranularity, sessions, openHistory } = useTaskStore();
  const { startTask, isGeneratingTask, error, restoreText } = useStartTask();
  const reduceMotion = useReducedMotion();

  const hasSavedTasks = sessions.some(
    (s) => s.messages && s.messages.length > 0
  );

  return (
    <main className="flex-1 flex flex-col items-center justify-between px-4 sm:px-6 py-6 sm:py-8 overflow-y-auto">
      <div className="w-full max-w-2xl mx-auto my-auto space-y-6">
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

      {hasSavedTasks && !isGeneratingTask && (
        <div className="pt-4 pb-2 text-center shrink-0">
          <motion.button
            type="button"
            onClick={openHistory}
            variants={reduceMotion ? undefined : tactileButtonVariants}
            initial="rest"
            animate="rest"
            whileHover={reduceMotion ? undefined : 'hover'}
            whileTap={reduceMotion ? undefined : 'tap'}
            className="inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-secondary transition-colors duration-fast cursor-pointer py-1.5 px-3.5 rounded-full hover:bg-surface-subtle"
          >
            <ClockCounterClockwise size={14} className="text-accent" />
            <span>Looking for an earlier task? View history</span>
            <span aria-hidden="true">→</span>
          </motion.button>
        </div>
      )}
    </main>
  );
}
