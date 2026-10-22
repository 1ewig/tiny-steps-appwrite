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
  const assistantMessages = messages.filter((m) => m.role === 'assistant');

  return (
    <div className="space-y-6">
      {assistantMessages.map((msg) => (
        <AssistantBubble
          key={msg.id}
          message={msg}
          onToggleStep={(stepId) => onToggleStep(msg.id, stepId)}
          onShrinkStep={(stepIndex) => onShrinkStep(msg.id, stepIndex)}
        />
      ))}

      {isTyping && <TypingIndicator />}
    </div>
  );
}
