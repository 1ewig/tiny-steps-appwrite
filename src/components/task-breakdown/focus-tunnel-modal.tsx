'use client';

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkle } from '@phosphor-icons/react';
import type { Step } from '@/types/task';

interface FocusTunnelModalProps {
  isOpen: boolean;
  activeStep: Step | null;
  sessionTitle: string;
  onClose: () => void;
  onComplete: () => void;
  onShrink: () => void;
  onSkip: () => void;
}

export function FocusTunnelModal({
  isOpen,
  activeStep,
  sessionTitle,
  onClose,
  onComplete,
  onShrink,
  onSkip,
}: FocusTunnelModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-modal bg-canvas/95 backdrop-blur-md flex flex-col items-center justify-between p-6 sm:p-10 select-none overflow-y-auto"
        >
          {/* Top Bar: Task Name on Top Left, Close on Top Right */}
          <div className="w-full flex items-center justify-between z-10 shrink-0">
            {/* Task Name on Top Left Corner */}
            <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-text-secondary max-w-[70vw] sm:max-w-md truncate">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse shrink-0" />
              <span className="truncate">{sessionTitle || 'Focus Tunnel'}</span>
            </div>

            {/* Close Button on Top Right Corner */}
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-surface-subtle/80 hover:bg-surface-subtle text-text-secondary hover:text-text-primary transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent"
              aria-label="Close Focus Tunnel"
              title="Back to chat (Esc)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Centered Task (No Box Container) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex-1 flex flex-col items-center justify-center text-center px-4 py-8 max-w-3xl mx-auto w-full my-auto"
          >
            {activeStep ? (
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-text-primary leading-snug sm:leading-tight tracking-tight text-center max-w-2xl">
                {activeStep.text}
              </h1>
            ) : (
              <div className="space-y-4 max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-accent-subtle text-accent flex items-center justify-center orb-pulse mx-auto">
                  <Sparkle size={36} weight="duotone" className="text-accent" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl sm:text-4xl font-bold text-text-primary leading-tight">
                    You made it through.
                  </h1>
                  <p className="text-text-secondary text-base leading-relaxed">
                    Take a breath and unclench your jaw. You took on something heavy and turned it into momentum.
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Bottom Action Area (Centered, Equal-Sized Buttons) */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="w-full max-w-2xl mx-auto flex flex-col items-center gap-4 pb-2 shrink-0"
          >
            {activeStep ? (
              <>
                <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-3 w-full max-w-xl">
                  {/* Primary Complete Button */}
                  <button
                    onClick={onComplete}
                    className="flex-1 min-w-[150px] sm:w-48 h-12 px-5 rounded-xl bg-accent hover:bg-accent-hover active:scale-95 text-text-inverse font-medium text-sm shadow-subtle flex items-center justify-center gap-2 group transition-all"
                  >
                    <svg
                      className="w-4 h-4 group-hover:scale-110 transition-transform shrink-0"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="truncate">Done! What is next?</span>
                  </button>

                  {/* Shrink Step Button */}
                  {activeStep.canSplit && (
                    <button
                      onClick={onShrink}
                      className="flex-1 min-w-[150px] sm:w-48 h-12 px-5 rounded-xl bg-surface-subtle hover:bg-surface-subtle/80 text-text-primary text-sm font-medium transition-all active:scale-95 flex items-center justify-center gap-1.5"
                    >
                      <Sparkle size={15} weight="duotone" className="text-accent" />
                      <span className="truncate">Shrink it</span>
                    </button>
                  )}

                  {/* Skip Step Button */}
                  <button
                    onClick={onSkip}
                    className="flex-1 min-w-[150px] sm:w-48 h-12 px-5 rounded-xl bg-surface-subtle hover:bg-surface-subtle/80 text-text-secondary hover:text-text-primary text-sm font-medium transition-all active:scale-95 flex items-center justify-center"
                    title="Move to end without guilt"
                  >
                    <span className="truncate">Skip for now</span>
                  </button>
                </div>

                <div className="text-xs text-text-tertiary text-center">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-surface-subtle text-text-secondary font-mono text-[11px]">Space</kbd> or{' '}
                  <kbd className="px-1.5 py-0.5 rounded bg-surface-subtle text-text-secondary font-mono text-[11px]">Enter</kbd> to mark done •{' '}
                  <kbd className="px-1.5 py-0.5 rounded bg-surface-subtle text-text-secondary font-mono text-[11px]">Esc</kbd> to exit
                </div>
              </>
            ) : (
              <button
                onClick={onClose}
                className="h-12 px-6 rounded-xl bg-accent hover:bg-accent-hover active:scale-95 text-text-inverse text-sm font-medium shadow-subtle transition-all flex items-center justify-center"
              >
                Rest, or head back to chat
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
