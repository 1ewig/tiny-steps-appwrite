'use client';

import type { ChatMessage } from '@/types/task';
import { AssistantBubble } from './assistant-bubble';
import { TypingIndicator } from './typing-indicator';

interface MessageFeedProps {
  messages: ChatMessage[];
  isTyping: boolean;
  onToggleStep: (messageId: string, stepId: number) => void;
  onShrinkStep: (messageId: string, stepIndex: number) => void;
}

export function MessageFeed({
  messages,
  isTyping,
  onToggleStep,
  onShrinkStep,
}: MessageFeedProps) {
  // Always render strictly the single living card
  const livingCard =
    [...messages].reverse().find((m) => m.role === 'assistant' && m.steps && m.steps.length > 0) ||
    messages.find((m) => m.role === 'assistant');

  return (
    <div className="space-y-6">
      {livingCard && (
        <AssistantBubble
          key={livingCard.id}
          message={livingCard}
          onToggleStep={(stepId) => onToggleStep(livingCard.id, stepId)}
          onShrinkStep={(stepIndex) => onShrinkStep(livingCard.id, stepIndex)}
        />
      )}

      {isTyping && <TypingIndicator />}
    </div>
  );
}
