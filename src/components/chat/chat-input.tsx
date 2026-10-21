'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatInputProps {
  disabled?: boolean;
  onSubmit: (text: string) => void;
  isCentered?: boolean;
  collapsible?: boolean;
}

export function ChatInput({
  disabled,
  onSubmit,
  isCentered = false,
  collapsible = false,
}: ChatInputProps) {
  const [text, setText] = useState('');
  const [isMultiline, setIsMultiline] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
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
    if (collapsible) {
      setIsExpanded(false);
    }
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  useEffect(() => {
    if (isCentered) {
      textareaRef.current?.focus();
    }
  }, [isCentered]);

  const inputBlock = (
    <div className="max-w-2xl mx-auto pointer-events-auto w-full">
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
  );

  if (isCentered) {
    return <div className="w-full px-4">{inputBlock}</div>;
  }

  if (collapsible) {
    return (
      <AnimatePresence mode="wait">
        {!isExpanded ? (
          <motion.div
            key="collapsed-chip"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.16 }}
            className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 flex justify-center pointer-events-none z-capsule"
          >
            <button
              type="button"
              onClick={() => {
                setIsExpanded(true);
                setTimeout(() => textareaRef.current?.focus(), 50);
              }}
              className="pointer-events-auto px-4 py-2 rounded-full bg-surface/95 hover:bg-surface border border-border-subtle shadow-card text-xs font-medium text-text-secondary hover:text-text-primary flex items-center gap-2 transition-all backdrop-blur-md active:scale-95 group"
            >
              <span className="text-sm group-hover:scale-110 transition-transform">💬</span>
              <span>Need to tweak or vent?</span>
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="expanded-input"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.16 }}
            className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-canvas via-canvas/95 to-transparent pointer-events-none z-capsule"
          >
            <div className="max-w-2xl mx-auto pointer-events-auto w-full space-y-1.5">
              <div className="flex items-center justify-between px-2 text-2xs text-text-tertiary">
                <span>Adjust your task or vent freely</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsExpanded(false);
                    setText('');
                  }}
                  className="hover:text-text-primary px-2 py-0.5 rounded hover:bg-surface-subtle transition-colors flex items-center gap-1 font-medium"
                >
                  <span>✕</span>
                  <span>Close</span>
                </button>
              </div>
              {inputBlock}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 bg-gradient-to-t from-canvas via-canvas/90 to-transparent pointer-events-none z-capsule">
      {inputBlock}
    </div>
  );
}
