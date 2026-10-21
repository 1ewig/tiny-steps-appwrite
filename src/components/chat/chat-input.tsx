'use client';

import { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  disabled?: boolean;
  onSubmit: (text: string) => void;
}

export function ChatInput({ disabled, onSubmit }: ChatInputProps) {
  const [text, setText] = useState('');
  const [isMultiline, setIsMultiline] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setText(val);

    // Auto-adjust height
    const el = e.target;
    el.style.height = 'auto';
    const newHeight = Math.min(el.scrollHeight, 140);
    el.style.height = `${newHeight}px`;

    // Detect if content spans more than one row
    setIsMultiline(newHeight > 36 || val.includes('\n'));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setText('');
    setIsMultiline(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-canvas via-canvas/90 to-transparent pointer-events-none z-capsule">
      <div className="max-w-2xl mx-auto pointer-events-auto">
        {/* Dynamic input container: pill for single-line, rounded-2xl for multiline */}
        <div
          className={`bg-surface/95 backdrop-blur-md border border-border-subtle shadow-capsule px-4 transition-all duration-200 focus-within:border-accent/40 focus-within:ring-2 focus-within:ring-accent/15 flex gap-2.5 ${
            isMultiline
              ? 'rounded-2xl py-3 items-end'
              : 'rounded-full py-2 sm:py-2.5 items-center'
          }`}
        >
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            disabled={disabled}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="What feels heavy? Type anything or brain-dump..."
            className="w-full bg-transparent text-text-primary placeholder-text-tertiary text-sm sm:text-base resize-none focus:outline-none py-1 leading-normal max-h-36"
          />

          <button
            onClick={handleSend}
            disabled={!text.trim() || disabled}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-accent hover:bg-accent-hover active:scale-95 text-text-inverse flex items-center justify-center shrink-0 shadow-subtle transition-all disabled:opacity-40 disabled:cursor-not-allowed mb-0.5"
            title="Break it down"
            aria-label="Send message"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
            </svg>
          </button>
        </div>

        <p className="text-center text-2xs text-text-tertiary pt-2 tracking-wide">
          Doing just one tiny step and stopping is still a complete victory.
        </p>
      </div>
    </div>
  );
}
