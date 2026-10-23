'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkle, Check } from '@phosphor-icons/react';
import type { Step } from '@/types/task';

interface FocusTunnelModalProps {
  isOpen: boolean;
  isBusy?: boolean;
  activeStep: Step | null;
  sessionTitle: string;
  onClose: () => void;
  onComplete: () => void;
  onShrink: () => void;
}

export function FocusTunnelModal({
  isOpen,
  isBusy = false,
  activeStep,
  sessionTitle,
  onClose,
  onComplete,
  onShrink,
}: FocusTunnelModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // Preserve the previously focused element while the dialog is open
  useEffect(() => {
    if (!isOpen) return;

    previousActiveElementRef.current = document.activeElement as HTMLElement | null;
    return () => {
      previousActiveElementRef.current?.focus();
      previousActiveElementRef.current = null;
    };
  }, [isOpen]);

  // Move focus into the dialog once it is ready for interaction
  useEffect(() => {
    if (!isOpen || isBusy) return;

    const timer = setTimeout(() => {
      const autofocus = modalRef.current?.querySelector<HTMLElement>('[data-autofocus]');
      const firstFocusable = modalRef.current?.querySelector<HTMLElement>(
        'button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      (autofocus ?? firstFocusable)?.focus();
    }, 50);

    return () => clearTimeout(timer);
  }, [isOpen, isBusy, activeStep?.id]);

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
          aria-label={sessionTitle ? `Focus Tunnel: ${sessionTitle}` : 'Focus mode'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-modal bg-canvas/95 backdrop-blur-md flex flex-col items-center justify-between p-6 sm:p-10 select-none overflow-y-auto"
        >
          {/* Top Bar: Session Name & Minimal Close */}
          <div className="w-full flex items-center justify-between z-10 shrink-0">
            <div className="flex items-center gap-2 text-xs font-medium text-text-secondary max-w-[70vw] sm:max-w-md truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse shrink-0" />
              <span className="truncate">{sessionTitle || 'Focus'}</span>
            </div>

            <button
              onClick={onClose}
              disabled={isBusy}
              className="p-2 rounded-full text-text-tertiary hover:text-text-primary hover:bg-surface-subtle transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Close Focus Tunnel"
              title={isBusy ? 'Preparing your steps' : 'Exit (Esc)'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Centered Active Step */}
          <motion.div
            key={activeStep ? activeStep.id : 'completed'}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="flex-1 flex flex-col items-center justify-center text-center px-4 py-8 max-w-3xl mx-auto w-full my-auto"
          >
            {activeStep ? (
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-text-primary leading-snug sm:leading-tight tracking-tight text-center max-w-2xl">
                {activeStep.text}
              </h1>
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

          {/* Bottom Action Area: Compact, Single-Word Pills */}
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="w-full flex flex-col items-center gap-3 pb-1 shrink-0"
          >
            {activeStep ? (
              <>
                <div className="flex items-center justify-center gap-2">
                  {/* Primary: Done */}
                  <button
                    data-autofocus
                    onClick={onComplete}
                    disabled={isBusy}
                    className="h-9 sm:h-10 px-4 sm:px-5 rounded-full bg-accent hover:bg-accent-hover active:scale-95 text-text-inverse font-medium text-xs sm:text-sm shadow-subtle flex items-center gap-1.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Check size={14} weight="bold" />
                    <span>Done</span>
                  </button>

                  {/* Secondary: Shrink */}
                  {activeStep.canSplit && (
                    <button
                      onClick={onShrink}
                      disabled={isBusy}
                      className="h-9 sm:h-10 px-3.5 rounded-full bg-surface-subtle/80 hover:bg-surface-subtle text-text-secondary hover:text-text-primary text-xs sm:text-sm font-medium transition-all active:scale-95 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Sparkle size={13} weight="duotone" className="text-accent" />
                      <span>Shrink</span>
                    </button>
                  )}

                </div>

                {/* Micro Keyboard Hint */}
                <div className="text-2xs text-text-tertiary opacity-70 flex items-center gap-2">
                  <span>
                    <kbd className="font-mono text-text-secondary">Space</kbd> done
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>
                    <kbd className="font-mono text-text-secondary">Esc</kbd> exit
                  </span>
                </div>
              </>
            ) : (
              <button
                onClick={onClose}
                className="h-9 sm:h-10 px-5 rounded-full bg-accent hover:bg-accent-hover active:scale-95 text-text-inverse text-xs sm:text-sm font-medium shadow-subtle transition-all"
              >
                Close
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}