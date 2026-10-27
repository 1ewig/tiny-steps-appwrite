'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useTaskStore } from '@/store/task-store';
import { interpretUserIntentWithAI } from '@/lib/ai/client';
import type { Task, EnergyLevel } from '@/types/task';

/**
 * Custom hook managing the conversational assistant interactions for a task.
 * Encapsulates intent interpretation, feedback timer, and atomic store updates.
 */
export function useAssistantChat(task?: Task | null, granularity?: EnergyLevel) {
  const [isTyping, setIsTyping] = useState(false);
  const [assistantFeedback, setAssistantFeedback] = useState<string | null>(null);
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyAssistantIntent = useTaskStore((state) => state.applyAssistantIntent);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  const showFeedback = useCallback((msg?: string) => {
    if (!msg) return;
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }
    setAssistantFeedback(msg);
    feedbackTimerRef.current = setTimeout(() => {
      setAssistantFeedback(null);
    }, 5000);
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!task || isTyping) return;

      setIsTyping(true);

      try {
        const intent = await interpretUserIntentWithAI(
          text,
          task.title,
          task.steps,
          granularity ?? task.energyLevel
        );

        const ack = intent.acknowledgment || intent.dialogue;

        applyAssistantIntent(task.id, intent);

        if (ack) {
          showFeedback(ack);
        }
      } catch (err) {
        console.error('Failed to interpret intent:', err);
        showFeedback('The assistant needs a moment. Please try again.');
        throw err;
      } finally {
        setIsTyping(false);
      }
    },
    [task, isTyping, granularity, applyAssistantIntent, showFeedback]
  );

  return {
    isTyping,
    assistantFeedback,
    showFeedback,
    sendMessage,
  };
}
