'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sparkle, Check, X } from '@phosphor-icons/react';
import type { Step } from '@/types/task';
import {
  tactileButtonVariants,
  tactileIconVariants,
  CALM_EASE,
} from '@/constants/animation';

interface FocusTunnelModalProps {
  isOpen: boolean;
  isBusy?: boolean;
  activeStep: Step | null;
  activeStepNumber?: number | null;
  totalStepsCount?: number;
  sessionTitle: string;
  onClose: () => void;
  onComplete: () => void;
  onCompleteWholeStep?: () => void;
  onShrink: () => void;
}

export function FocusTunnelModal({
  isOpen,
  isBusy = false,
  activeStep,
  activeStepNumber,
  totalStepsCount,
  sessionTitle,
  onClose,
  onComplete,
  onCompleteWholeStep,
  onShrink,
}: FocusTunnelModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);
  const reduceMotion = useReducedMotion();

  const subSteps = activeStep?.subSteps ?? [];
  const hasSubSteps = subSteps.length > 0;
  const incompleteSubSteps = subSteps.filter((s) => !s.completed);
  const currentSubStep = incompleteSubSteps[0] ?? null;
  const currentSubStepIndex = currentSubStep
    ? subSteps.findIndex((s) => s.id === currentSubStep.id)
    : -1;

  // Preserve the previously focused element while the dialog is open
  useEffect(() => {
    if (!isOpen) return;

    previousActiveElementRef.current = document.activeElement as HTMLElement | null;
    return () => {
      previousActiveElementRef.current?.focus();
      previousActiveElementRef.current = null;
    };
  }, [isOpen]);

  // Focus the dialog container so keyboard listeners and tab-trapping are active without auto-selecting buttons
  useEffect(() => {
    if (!isOpen || isBusy) return;

    const timer = setTimeout(() => {
      modalRef.current?.focus({ preventScroll: true });
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen, isBusy]);

  // Key handling: Escape and Tab trapping
  useEffect(() => {
    if (!isOpen || isBusy) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }

      if (e.key === 'Tab' && modalRef.current) {
        const focusables = modalRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isBusy, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          aria-label={sessionTitle ? `Focus Tunnel: ${sessionTitle}` : 'Focus mode'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-modal bg-canvas/95 backdrop-blur-md flex flex-col items-center justify-between p-3.5 sm:p-5 md:p-6 select-none overflow-y-auto focus:outline-none"
        >
          {/* Top Bar: Session Name, Step Indicator & Minimal Close */}
          <div className="w-full flex items-center justify-between z-10 shrink-0">
            <div className="flex items-center gap-2 text-xs font-medium text-text-secondary max-w-[70vw] sm:max-w-md truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shrink-0" />
              <span className="truncate">{sessionTitle || 'Focus'}</span>
              {activeStepNumber && totalStepsCount && (
                <span className="text-2xs font-mono text-text-tertiary">
                  · Step {activeStepNumber} of {totalStepsCount}
                </span>
              )}
            </div>

            <motion.button
              onClick={onClose}
              disabled={isBusy}
              variants={reduceMotion ? undefined : tactileButtonVariants}
              initial="rest"
              animate="rest"
              whileHover={isBusy || reduceMotion ? undefined : 'hover'}
              whileTap={isBusy || reduceMotion ? undefined : 'tap'}
              className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-colors duration-fast cursor-pointer focus:outline-none focus-visible:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Close Focus Tunnel"
              title={isBusy ? 'Preparing your steps' : 'Close (Esc)'}
            >
              <motion.span
                variants={reduceMotion ? undefined : tactileIconVariants}
                className="flex items-center"
              >
                <X size={18} weight="bold" />
              </motion.span>
            </motion.button>
          </div>

          {/* Top Context Anchor: Original Parent Step (When Shrunk) */}
          <AnimatePresence>
            {hasSubSteps && currentSubStep && (
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: CALM_EASE }}
                className="pt-4 pb-1 shrink-0 z-10 text-center max-w-3xl lg:max-w-4xl mx-auto px-4"
              >
                <p className="text-sm sm:text-base md:text-lg font-medium text-text-secondary truncate">
                  {activeStep?.text}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Centered Active Step / Micro-Step Spotlight */}
          <motion.div
            key={
              activeStep
                ? hasSubSteps && currentSubStep
                  ? `sub_${activeStep.id}_${currentSubStep.id}`
                  : `step_${activeStep.id}`
                : 'completed'
            }
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 py-8 max-w-4xl lg:max-w-5xl mx-auto w-full my-auto"
          >
            {activeStep ? (
              hasSubSteps && currentSubStep ? (
                <div className="space-y-4 max-w-4xl w-full mx-auto">
                  {/* Spotlight Tiny Step Text */}
                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-text-primary leading-snug sm:leading-tight tracking-tight text-center max-w-4xl mx-auto">
                    {currentSubStep.text}
                  </h1>

                  {/* Micro-step Stepping Stone Dots */}
                  <div className="flex items-center justify-center gap-2 pt-2 select-none">
                    {subSteps.map((sub, idx) => (
                      <span
                        key={sub.id}
                        className={`h-1.5 rounded-full transition-all duration-300 ${
                          sub.completed
                            ? 'w-4 bg-accent'
                            : idx === currentSubStepIndex
                            ? 'w-7 bg-accent shadow-sm'
                            : 'w-2 bg-border-muted/80'
                        }`}
                        title={`Step ${idx + 1}: ${sub.text}`}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-3 max-w-4xl w-full mx-auto">
                  <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-text-primary leading-snug sm:leading-tight tracking-tight text-center max-w-4xl mx-auto">
                    {activeStep.text}
                  </h1>
                  {activeStep.hint ? (
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-xl mx-auto">
                      {activeStep.hint}
                    </p>
                  ) : activeStep.effort ? (
                    <p className="text-xs text-text-tertiary">
                      Takes about {activeStep.effort.replace('~', '')}
                    </p>
                  ) : null}
                </div>
              )
            ) : (
              <div className="space-y-4 max-w-md">
                <div className="w-12 h-12 rounded-2xl bg-accent-subtle text-accent flex items-center justify-center orb-pulse mx-auto">
                  <Sparkle size={28} weight="duotone" className="text-accent" />
                </div>
                <div className="space-y-1.5">
                  <h1 className="text-2xl sm:text-3xl font-bold text-text-primary leading-tight">
                    You made it through.
                  </h1>
                  <p className="text-text-secondary text-sm sm:text-base leading-relaxed">
                    Take a breath and unclench your jaw. You turned something heavy into momentum.
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Bottom Action Area */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="w-full flex flex-col items-center gap-3 pb-1 shrink-0"
          >
            {activeStep ? (
              <>
                <div className="flex flex-wrap items-center justify-center gap-2.5">
                  {/* Primary: Done */}
                  <motion.button
                    onClick={onComplete}
                    disabled={isBusy}
                    variants={reduceMotion ? undefined : tactileButtonVariants}
                    initial="rest"
                    animate="rest"
                    whileHover={isBusy || reduceMotion ? undefined : 'hover'}
                    whileTap={isBusy || reduceMotion ? undefined : 'tap'}
                    className="h-10 sm:h-11 px-5 sm:px-6 rounded-full bg-accent hover:bg-accent-hover text-text-inverse font-medium text-xs sm:text-sm shadow-subtle flex items-center gap-2 transition-colors duration-fast cursor-pointer focus:outline-none focus-visible:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <motion.span
                      variants={reduceMotion ? undefined : tactileIconVariants}
                      className="flex items-center shrink-0"
                    >
                      <Check size={14} weight="bold" />
                    </motion.span>
                    <span>Done</span>
                  </motion.button>

                  {/* Secondary: Shrink (if step can split and not yet shrunk) */}
                  {!hasSubSteps && activeStep.canSplit && (
                    <motion.button
                      onClick={onShrink}
                      disabled={isBusy}
                      variants={reduceMotion ? undefined : tactileButtonVariants}
                      initial="rest"
                      animate="rest"
                      whileHover={isBusy || reduceMotion ? undefined : 'hover'}
                      whileTap={isBusy || reduceMotion ? undefined : 'tap'}
                      className="h-10 sm:h-11 px-4 rounded-full bg-surface-subtle/80 hover:bg-surface-subtle text-text-secondary hover:text-text-primary text-xs sm:text-sm font-medium transition-colors duration-fast flex items-center gap-1.5 cursor-pointer focus:outline-none focus-visible:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Break into 3 smaller micro-steps (S)"
                    >
                      <motion.span
                        variants={reduceMotion ? undefined : tactileIconVariants}
                        className="flex items-center"
                      >
                        <Sparkle size={13} weight="duotone" className="text-accent" />
                      </motion.span>
                      <span>Shrink</span>
                    </motion.button>
                  )}

                  {/* Secondary: Complete Whole Step (when inside micro-steps) */}
                  {hasSubSteps && currentSubStep && onCompleteWholeStep && (
                    <motion.button
                      onClick={onCompleteWholeStep}
                      disabled={isBusy}
                      variants={reduceMotion ? undefined : tactileButtonVariants}
                      initial="rest"
                      animate="rest"
                      whileHover={isBusy || reduceMotion ? undefined : 'hover'}
                      whileTap={isBusy || reduceMotion ? undefined : 'tap'}
                      className="h-10 sm:h-11 px-4 rounded-full bg-surface-subtle/70 hover:bg-surface-subtle text-text-tertiary hover:text-text-secondary text-xs sm:text-sm font-normal transition-colors duration-fast flex items-center gap-1.5 cursor-pointer focus:outline-none focus-visible:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
                      title="Mark the whole task finished immediately"
                    >
                      <span>Finish whole step</span>
                    </motion.button>
                  )}
                </div>

                {/* Micro Keyboard Hint */}
                <div className="text-2xs text-text-tertiary opacity-70 flex items-center gap-2 select-none">
                  <span>
                    <kbd className="font-mono text-text-secondary">Space</kbd> done
                  </span>
                  {!hasSubSteps && activeStep.canSplit && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>
                        <kbd className="font-mono text-text-secondary">S</kbd> shrink
                      </span>
                    </>
                  )}
                  <span aria-hidden="true">·</span>
                  <span>
                    <kbd className="font-mono text-text-secondary">Esc</kbd> exit
                  </span>
                </div>
              </>
            ) : (
              <motion.button
                onClick={onClose}
                variants={reduceMotion ? undefined : tactileButtonVariants}
                initial="rest"
                animate="rest"
                whileHover={reduceMotion ? undefined : 'hover'}
                whileTap={reduceMotion ? undefined : 'tap'}
                className="h-9 sm:h-10 px-5 rounded-full bg-accent hover:bg-accent-hover text-text-inverse text-xs sm:text-sm font-medium shadow-subtle transition-colors duration-fast cursor-pointer focus:outline-none focus-visible:outline-none"
              >
                Close
              </motion.button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}