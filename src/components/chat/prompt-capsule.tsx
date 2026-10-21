'use client';

import { useState, useRef, useEffect } from 'react';

interface PromptCapsuleProps {
  peekFuture: boolean;
  disabled?: boolean;
  onSubmit: (text: string) => void;
  onTogglePeek: () => void;
}

export function PromptCapsule({ peekFuture, disabled, onSubmit, onTogglePeek }: PromptCapsuleProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    // Auto-adjust height
    const el = e.target;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
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
        {/* Floating Capsule Card */}
        <div className="bg-surface/95 backdrop-blur-md rounded-capsule border border-border-subtle shadow-capsule p-2 sm:p-2.5 space-y-2 transition-all">
          {/* Textarea & Send Button */}
          <div className="flex items-end gap-2 px-2 pt-1">
            <textarea
              ref={textareaRef}
              rows={1}
              value={text}
              disabled={disabled}
              onChange={handleInput}
              onKeyDown={handleKeyDown}
              placeholder="What feels heavy? Type anything or brain-dump..."
              className="w-full bg-transparent text-text-primary placeholder-text-tertiary text-sm sm:text-base resize-none focus:outline-none max-h-36 py-1.5 leading-relaxed"
            />

            <button
              onClick={handleSend}
              disabled={!text.trim() || disabled}
              className="w-9 h-9 rounded-xl bg-accent hover:bg-accent-hover active:scale-95 text-text-inverse flex items-center justify-center shrink-0 shadow-subtle transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              title="Break it down"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
              </svg>
            </button>
          </div>

          {/* Bottom Utility Row */}
          <div className="flex items-center justify-between px-2 pt-1 pb-0.5 border-t border-border-subtle/60 text-2xs text-text-tertiary">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Offline &amp; Private</span>
              </span>
              <span>•</span>
              <button onClick={onTogglePeek} className="hover:text-text-secondary transition-colors">
                {peekFuture ? 'Blur future steps' : 'Unblur future steps'}
              </button>
            </div>

            <div className="text-2xs">
              <span className="hidden sm:inline">Press </span>
              <kbd className="px-1 py-0.5 rounded bg-surface-subtle text-text-secondary">Enter</kbd>
              <span className="hidden sm:inline"> to shrink</span>
            </div>
          </div>
        </div>

        <p className="text-center text-2xs text-text-tertiary pt-2 tracking-wide">
          Doing just one tiny step and stopping is still a complete victory.
        </p>
      </div>
    </div>
  );
}
