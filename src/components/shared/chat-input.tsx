'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChatCircleDots, X, SpinnerGap } from '@phosphor-icons/react';
import { tactileButtonVariants, tactileIconVariants } from '@/constants/animation';

interface ChatInputProps {
  disabled?: boolean;
  onSubmit: (text: string) => void | Promise<void>;
  isCentered?: boolean;
  collapsible?: boolean;
  initialText?: string;
}

export function ChatInput({
  disabled,
  onSubmit,
  isCentered = false,
  collapsible = false,
  initialText = '',
}: ChatInputProps) {
  const reduceMotion = useReducedMotion();
  const [text, setText] = useState(initialText);
  const [isMultiline, setIsMultiline] = useState(
    initialText.includes('\n') || initialText.length > 36
  );
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

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    const submittedText = trimmed;
    setText('');
    setIsMultiline(false);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    try {
      await onSubmit(submittedText);
    } finally {
      if (collapsible) {
        setIsExpanded(false);
      }
    }
  };

  // Automatically dismiss collapsible input when assistant response arrives
  const prevDisabledRef = useRef(disabled);
  useEffect(() => {
    if (prevDisabledRef.current && !disabled && collapsible) {
      setIsExpanded(false);
    }
    prevDisabledRef.current = disabled;
  }, [disabled, collapsible]);

  useEffect(() => {
    if (isCentered && !disabled) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isCentered, disabled]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
  }, []);

  const inputBlock = (
    <div className="max-w-2xl mx-auto pointer-events-auto w-full">
      {/* Dynamic input container: pill for single-line, rounded-2xl for multiline */}
      <div
        onClick={() => textareaRef.current?.focus()}
        className={`bg-surface/95 backdrop-blur-md shadow-capsule px-4 flex gap-2.5 cursor-text ${
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
          autoFocus={isCentered}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Type or vent anything..."
          className="w-full bg-transparent text-text-primary placeholder-text-tertiary text-sm sm:text-base resize-none focus:outline-none py-1 leading-normal max-h-36 disabled:opacity-50"
        />

        <motion.button
          onClick={handleSend}
          disabled={!text.trim() || disabled}
          variants={reduceMotion ? undefined : tactileButtonVariants}
          initial="rest"
          animate="rest"
          whileHover={!text.trim() || disabled || reduceMotion ? undefined : 'hover'}
          whileTap={!text.trim() || disabled || reduceMotion ? undefined : 'tap'}
          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-accent hover:bg-accent-hover text-text-inverse flex items-center justify-center shrink-0 shadow-subtle transition-colors duration-fast disabled:opacity-50 disabled:cursor-not-allowed mb-0.5"
          title={disabled ? 'Adjusting...' : 'Break it down'}
          aria-label={disabled ? 'Adjusting...' : 'Send message'}
        >
          {disabled ? (
            <SpinnerGap size={18} className="animate-spin text-text-inverse" />
          ) : (
            <motion.svg
              variants={reduceMotion ? undefined : tactileIconVariants}
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
            </motion.svg>
          )}
        </motion.button>
      </div>
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
            <motion.button
              type="button"
              onClick={() => {
                setIsExpanded(true);
                setTimeout(() => textareaRef.current?.focus(), 50);
              }}
              variants={reduceMotion ? undefined : tactileButtonVariants}
              initial="rest"
              animate="rest"
              whileHover={reduceMotion ? undefined : 'hover'}
              whileTap={reduceMotion ? undefined : 'tap'}
              className="pointer-events-auto px-4 py-2 rounded-full bg-surface/95 hover:bg-surface shadow-card text-xs font-medium text-text-secondary hover:text-text-primary flex items-center gap-2 transition-colors duration-fast backdrop-blur-md group"
            >
              <motion.span variants={reduceMotion ? undefined : tactileIconVariants} className="shrink-0 flex items-center">
                <ChatCircleDots size={16} weight="regular" className="text-accent" />
              </motion.span>
              <span>Need to tweak or vent?</span>
            </motion.button>
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
                <motion.button
                  type="button"
                  onClick={() => {
                    setIsExpanded(false);
                    setText('');
                  }}
                  variants={reduceMotion ? undefined : tactileButtonVariants}
                  initial="rest"
                  animate="rest"
                  whileHover={reduceMotion ? undefined : 'hover'}
                  whileTap={reduceMotion ? undefined : 'tap'}
                  className="hover:text-text-primary px-2 py-0.5 rounded hover:bg-surface-subtle transition-colors flex items-center gap-1 font-medium"
                >
                  <motion.span variants={reduceMotion ? undefined : tactileIconVariants} className="shrink-0 flex items-center">
                    <X size={12} weight="bold" />
                  </motion.span>
                  <span>Close</span>
                </motion.button>
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
