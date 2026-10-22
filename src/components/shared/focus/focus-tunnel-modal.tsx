'use client';

import { motion, AnimatePresence } from 'framer-motion';
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
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-modal bg-canvas/95 backdrop-blur-md flex flex-col justify-between p-6 sm:p-10 select-none"
        >
          {/* Focus Header */}
          <div className="max-w-xl w-full mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-text-secondary">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span>{sessionTitle || 'Focus Tunnel'}</span>
            </div>

            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-surface-subtle hover:bg-surface-subtle/80 text-xs font-medium text-text-primary transition-all"
            >
              ✕ Back to Chat
            </button>
          </div>

          {/* Center Focus Card */}
          <motion.div
            initial={{ scale: 0.95, y: 10 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 10 }}
            className="max-w-lg w-full mx-auto my-auto py-8"
          >
            <div className="bg-surface border border-border-subtle rounded-capsule p-7 sm:p-10 shadow-modal text-center space-y-8">
              {activeStep ? (
                <>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-accent-subtle text-accent-text text-xs font-medium border border-accent/20">
                    <span>Just this one single thing</span>
                    <span>•</span>
                    <span>{activeStep.effort || '~1 min'}</span>
                  </div>

                  <p className="text-2xl sm:text-3xl font-bold text-text-primary leading-relaxed">
                    {activeStep.text}
                  </p>

                  <div className="pt-2 space-y-3 max-w-xs mx-auto">
                    {/* Main Done Button */}
                    <button
                      onClick={onComplete}
                      className="w-full py-4 px-6 rounded-xl bg-accent hover:bg-accent-hover active:scale-95 text-text-inverse font-medium text-base shadow-subtle flex items-center justify-center gap-2 group transition-all"
                    >
                      <svg
                        className="w-5 h-5 group-hover:scale-110 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      <span>Done! What is next?</span>
                    </button>

                    {/* Shrink & Skip Actions */}
                    <div className="flex items-center justify-center gap-2 pt-1">
                      {activeStep.canSplit && (
                        <button
                          onClick={onShrink}
                          className="flex-1 py-2.5 px-3 rounded-lg bg-surface-subtle hover:bg-surface-subtle/80 text-text-primary text-xs font-medium transition-all"
                        >
                          ✨ Still too big? Shrink it
                        </button>
                      )}
                      <button
                        onClick={onSkip}
                        className="py-2.5 px-3 rounded-lg bg-surface-subtle hover:bg-surface-subtle/80 text-text-secondary text-xs font-medium transition-all"
                        title="Move to end without guilt"
                      >
                        Skip for now
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-6 py-4">
                  {/* Gentle All-Completed Celebration */}
                  <div className="w-16 h-16 rounded-full bg-accent-subtle text-accent mx-auto flex items-center justify-center text-3xl orb-pulse">
                    🌿
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-text-primary">You made it through.</h2>
                    <p className="text-text-secondary text-sm leading-relaxed max-w-xs mx-auto">
                      Take a breath and unclench your jaw. You took on something heavy and turned it into momentum.
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-text-inverse text-sm font-medium shadow-subtle transition-all"
                  >
                    Rest, or head back to chat
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Focus Footer Shortcut Hint */}
          <div className="max-w-xl w-full mx-auto text-center text-xs text-text-tertiary">
            Press <kbd className="px-1.5 py-0.5 rounded bg-surface-subtle text-text-secondary">Space</kbd> or{' '}
            <kbd className="px-1.5 py-0.5 rounded bg-surface-subtle text-text-secondary">Enter</kbd> to mark done
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
