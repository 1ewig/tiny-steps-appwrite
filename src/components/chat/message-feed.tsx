'use client';

import { useEffect, useRef } from 'react';
import type { ChatMessage } from '@/types/task';
import { UserBubble } from './user-bubble';
import { AssistantBubble } from './assistant-bubble';
import { TypingIndicator } from './typing-indicator';

interface MessageFeedProps {
  messages: ChatMessage[];
  isTyping: boolean;
  onToggleStep: (messageId: string, stepId: number) => void;
  onShrinkStep: (messageId: string, stepIndex: number) => void;
  onSkipStep: (messageId: string, stepIndex: number) => void;
  onOpenFocusTunnel: () => void;
}

export function MessageFeed({
  messages,
  isTyping,
  onToggleStep,
  onShrinkStep,
  onSkipStep,
  onOpenFocusTunnel,
}: MessageFeedProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  return (
    <div className="space-y-6">
      {messages.map((msg) =>
        msg.role === 'user' ? (
          <UserBubble key={msg.id} text={msg.text} />
        ) : (
          <AssistantBubble
            key={msg.id}
            message={msg}
            onToggleStep={(stepId) => onToggleStep(msg.id, stepId)}
            onShrinkStep={(stepIndex) => onShrinkStep(msg.id, stepIndex)}
            onSkipStep={(stepIndex) => onSkipStep(msg.id, stepIndex)}
            onOpenFocusTunnel={onOpenFocusTunnel}
          />
        )
      )}

      {isTyping && <TypingIndicator />}

      <div ref={bottomRef} className="h-4" />
    </div>
  );
}
