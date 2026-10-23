'use client';

import type { ChatMessage } from '@/types/task';

interface UserBubbleProps {
  message: ChatMessage;
}

export function UserBubble({ message }: UserBubbleProps) {
  return (
    <div className="w-full flex justify-end chat-enter">
      <div className="max-w-[85%] sm:max-w-md bg-accent-subtle text-accent-text border border-accent/20 rounded-2xl rounded-br-sm px-4 py-2.5 shadow-subtle text-xs sm:text-sm leading-relaxed whitespace-pre-wrap select-text font-medium">
        {message.text}
      </div>
    </div>
  );
}
