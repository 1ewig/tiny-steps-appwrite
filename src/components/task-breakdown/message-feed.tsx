'use client';

import type { ChatMessage } from '@/types/task';
import { AssistantBubble } from './assistant-bubble';
import { UserBubble } from './user-bubble';
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
  return (
    <div className="space-y-6">
      {messages.map((msg) =>
        msg.role === 'user' ? (
          <UserBubble key={msg.id} message={msg} />
        ) : (
          <AssistantBubble
            key={msg.id}
            message={msg}
            onToggleStep={(stepId) => onToggleStep(msg.id, stepId)}
            onShrinkStep={(stepIndex) => onShrinkStep(msg.id, stepIndex)}
          />
        )
      )}

      {isTyping && <TypingIndicator />}
    </div>
  );
}
