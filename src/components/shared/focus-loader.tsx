'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { PhoneCall, ChatCircleDots, ArrowLeft } from '@phosphor-icons/react';
import {
  CALM_EASE,
  tactileButtonVariants,
  subtleMorphVariants,
} from '@/constants/animation';

const LOADING_LINES = [
  'Making this smaller…',
  'Finding your start…',
  'Softening the steps…',
  'Getting things ready…',
];

interface FocusLoaderProps {
  isVisible: boolean;
  noticeMessage?: string | null;
  onDismissNotice?: () => void;
}

export function FocusLoader({
  isVisible,
  noticeMessage,
  onDismissNotice,
}: FocusLoaderProps) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {isVisible && (
        <FocusLoaderContent
          reduceMotion={Boolean(reduceMotion)}
          noticeMessage={noticeMessage}
          onDismissNotice={onDismissNotice}
        />
      )}
    </AnimatePresence>
  );
}

function FocusLoaderContent({
  reduceMotion,
  noticeMessage,
  onDismissNotice,
}: {
  reduceMotion: boolean;
  noticeMessage?: string | null;
  onDismissNotice?: () => void;
}) {
  const [showText, setShowText] = useState(reduceMotion || Boolean(noticeMessage));
  const [lineIndex, setLineIndex] = useState(0);
  const dismissButtonRef = useRef<HTMLButtonElement>(null);

  const isCrisis = noticeMessage
    ? /988|741741|crisis|lifeline|suicide|self-harm/i.test(noticeMessage)
    : false;

  // Handle keyboard dismissal when notice is active
  useEffect(() => {
    if (!noticeMessage || !onDismissNotice) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter') {
        e.preventDefault();
        onDismissNotice();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [noticeMessage, onDismissNotice]);

  // Auto-focus dismiss button when notice appears
  useEffect(() => {
    if (noticeMessage && dismissButtonRef.current) {
      dismissButtonRef.current.focus();
    }
  }, [noticeMessage]);

  // Overlay covers screen first (~0.2s) before loading text begins
  useEffect(() => {
    if (reduceMotion || noticeMessage) return;

    const overlayTimer = setTimeout(() => {
      setShowText(true);
    }, 200);

    return () => clearTimeout(overlayTimer);
  }, [reduceMotion, noticeMessage]);

  // Loading text cycling
  useEffect(() => {
    if (reduceMotion || !showText || noticeMessage) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNext = (delayMs: number) => {
      timeoutId = setTimeout(() => {
        setLineIndex((prev) => {
          if (prev >= LOADING_LINES.length - 1) return prev;
          const next = prev + 1;
          scheduleNext(4000);
          return next;
        });
      }, delayMs);
    };

    scheduleNext(3000);

    return () => clearTimeout(timeoutId);
  }, [showText, reduceMotion, noticeMessage]);

  const overlayVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: reduceMotion ? 0 : 0.2,
        ease: CALM_EASE,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: reduceMotion ? 0 : 0.4,
        ease: CALM_EASE,
      },
    },
  };

  const textMorphVariants = reduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.2 } },
        exit: { opacity: 0, transition: { duration: 0.2 } },
      }
    : subtleMorphVariants;

  return (
    <motion.div
      variants={overlayVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="focus-loader fixed inset-0 bg-canvas flex items-center justify-center px-4 sm:px-6 select-none"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">
        {noticeMessage ? 'Gentle guidance message' : 'Preparing your tiny steps.'}
      </span>

      <div className="relative w-full max-w-xl flex items-center justify-center">
        <AnimatePresence mode="wait">
          {noticeMessage ? (
            <motion.div
              key="notice-card"
              variants={reduceMotion ? undefined : subtleMorphVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="w-full max-w-xl mx-auto flex flex-col items-center text-center space-y-6"
            >
              {isCrisis && (
                <div className="w-12 h-12 rounded-full bg-accent-subtle flex items-center justify-center text-accent">
                  <PhoneCall size={24} weight="bold" />
                </div>
              )}

              <div className="space-y-3 max-w-lg">
                <h2 className="text-2xl sm:text-3xl font-semibold text-text-primary tracking-tight">
                  {isCrisis ? 'Support Notice' : 'A gentle pause'}
                </h2>
                <p className="text-base sm:text-lg text-text-secondary leading-relaxed">
                  {noticeMessage}
                </p>
              </div>

              {isCrisis && (
                <div className="flex flex-col sm:flex-row gap-3 w-full justify-center pt-2">
                  <a
                    href="tel:988"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-accent text-text-inverse text-sm font-medium hover:bg-accent-hover transition-colors shadow-subtle"
                  >
                    <PhoneCall size={16} weight="bold" />
                    <span>Call or text 988</span>
                  </a>
                  <a
                    href="sms:741741"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-full bg-surface-subtle text-text-primary text-sm font-medium hover:bg-border-subtle transition-colors"
                  >
                    <ChatCircleDots size={16} weight="bold" />
                    <span>Text HOME to 741741</span>
                  </a>
                </div>
              )}

              <div className="pt-2 flex flex-col items-center space-y-2">
                <motion.button
                  ref={dismissButtonRef}
                  type="button"
                  onClick={onDismissNotice}
                  variants={reduceMotion ? undefined : tactileButtonVariants}
                  initial="rest"
                  animate="rest"
                  whileHover={reduceMotion ? undefined : 'hover'}
                  whileTap={reduceMotion ? undefined : 'tap'}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-surface-subtle hover:bg-border-subtle text-sm font-medium text-text-primary transition-colors cursor-pointer"
                >
                  <ArrowLeft size={16} weight="bold" />
                  <span>Back to my words</span>
                </motion.button>
                <span className="text-xs text-text-tertiary">
                  Press Esc or Enter to return
                </span>
              </div>
            </motion.div>
          ) : (
            showText && (
              <motion.p
                key={reduceMotion ? 'static' : lineIndex}
                variants={textMorphVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{ willChange: reduceMotion ? undefined : 'filter, opacity, transform' }}
                className="absolute inset-0 flex items-center justify-center text-2xl sm:text-4xl md:text-5xl font-bold text-text-primary leading-snug sm:leading-tight tracking-tight text-center max-w-2xl mx-auto"
              >
                {reduceMotion ? LOADING_LINES[0] : LOADING_LINES[lineIndex]}
              </motion.p>
            )
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
