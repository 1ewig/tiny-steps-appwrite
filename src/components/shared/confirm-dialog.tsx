'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Trash, Warning, Check, SpinnerGap, X } from '@phosphor-icons/react';
import {
  backdropVariants,
  tactileButtonVariants,
  tactileIconVariants,
  CALM_EASE,
  CALM_SPRING,
} from '@/constants/animation';

export interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'accent' | 'default';
  isBusy?: boolean;
  icon?: ReactNode;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isBusy = false,
  icon,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const reduceMotion = useReducedMotion();
  const dialogRef = useRef<HTMLDivElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Focus management: capture previous focus & safely auto-focus the Cancel button
  useEffect(() => {
    if (!isOpen) return;

    previousFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    const frame = requestAnimationFrame(() => {
      cancelButtonRef.current?.focus();
    });

    return () => {
      cancelAnimationFrame(frame);
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    };
  }, [isOpen]);

  // Intercept Escape key on window with capture to avoid triggering parent panels
  useEffect(() => {
    if (!isOpen || isBusy) return;

    const handleKeyDownCapture = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopPropagation();
        onClose();
        return;
      }

      if (event.key === 'Tab' && dialogRef.current) {
        const focusables = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => el.offsetParent !== null);

        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDownCapture, { capture: true });
    return () => {
      window.removeEventListener('keydown', handleKeyDownCapture, { capture: true });
    };
  }, [isOpen, isBusy, onClose]);

  const defaultIcon =
    variant === 'danger' ? (
      <Trash size={20} weight="duotone" className="text-danger-text" />
    ) : variant === 'accent' ? (
      <Check size={20} weight="bold" className="text-accent-text" />
    ) : (
      <Warning size={20} weight="duotone" className="text-text-secondary" />
    );

  const iconContainerClass =
    variant === 'danger'
      ? 'bg-danger-subtle text-danger-text'
      : variant === 'accent'
      ? 'bg-accent-subtle text-accent-text'
      : 'bg-surface-subtle text-text-secondary';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop (rendered at z-modal) */}
          <motion.div
            key="confirm-backdrop"
            variants={reduceMotion ? undefined : backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={isBusy ? undefined : onClose}
            className="fixed inset-0 bg-scrim/50 backdrop-blur-sm z-modal cursor-pointer"
            aria-hidden="true"
          />

          {/* Centered Modal Container */}
          <div
            className="fixed inset-0 z-modal flex items-center justify-center p-4 sm:p-6 pointer-events-none select-none"
            role="presentation"
          >
            <motion.div
              ref={dialogRef}
              key="confirm-card"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="confirm-dialog-title"
              aria-describedby={description ? 'confirm-dialog-desc' : undefined}
              tabIndex={-1}
              variants={
                reduceMotion
                  ? undefined
                  : {
                      initial: { opacity: 0, scale: 0.95, y: 8 },
                      animate: {
                        opacity: 1,
                        scale: 1,
                        y: 0,
                        transition: CALM_SPRING,
                      },
                      exit: {
                        opacity: 0,
                        scale: 0.96,
                        y: 4,
                        transition: { duration: 0.16, ease: CALM_EASE },
                      },
                    }
              }
              initial="initial"
              animate="animate"
              exit="exit"
              className="pointer-events-auto w-full max-w-sm sm:max-w-md bg-surface border border-border-subtle rounded-2xl p-5 sm:p-6 shadow-modal space-y-4 focus:outline-none"
            >
              {/* Header with sensory icon and close X */}
              <div className="flex items-start justify-between gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-subtle ${iconContainerClass}`}
                >
                  {icon ?? defaultIcon}
                </div>

                <motion.button
                  type="button"
                  disabled={isBusy}
                  onClick={onClose}
                  variants={reduceMotion ? undefined : tactileButtonVariants}
                  initial="rest"
                  animate="rest"
                  whileHover={isBusy || reduceMotion ? undefined : 'hover'}
                  whileTap={isBusy || reduceMotion ? undefined : 'tap'}
                  className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-subtle transition-colors duration-fast cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  aria-label="Close dialog"
                >
                  <motion.span
                    variants={reduceMotion ? undefined : tactileIconVariants}
                    className="flex items-center"
                  >
                    <X size={16} weight="bold" />
                  </motion.span>
                </motion.button>
              </div>

              {/* Title and empathetic description */}
              <div className="space-y-1.5">
                <h3
                  id="confirm-dialog-title"
                  className="text-base sm:text-lg font-bold text-text-primary tracking-tight leading-snug"
                >
                  {title}
                </h3>
                {description && (
                  <div
                    id="confirm-dialog-desc"
                    className="text-xs sm:text-sm text-text-secondary leading-relaxed"
                  >
                    {description}
                  </div>
                )}
              </div>

              {/* Action Buttons: Cancel (safely default focused) and Confirm */}
              <div className="pt-2 flex items-center gap-2.5 sm:gap-3">
                <motion.button
                  ref={cancelButtonRef}
                  type="button"
                  disabled={isBusy}
                  onClick={onClose}
                  variants={reduceMotion ? undefined : tactileButtonVariants}
                  initial="rest"
                  animate="rest"
                  whileHover={isBusy || reduceMotion ? undefined : 'hover'}
                  whileTap={isBusy || reduceMotion ? undefined : 'tap'}
                  className="flex-1 h-10 px-4 rounded-xl text-xs sm:text-sm font-medium bg-surface-subtle hover:bg-surface-subtle/80 text-text-secondary hover:text-text-primary transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {cancelLabel}
                </motion.button>

                <motion.button
                  type="button"
                  disabled={isBusy}
                  onClick={onConfirm}
                  variants={reduceMotion ? undefined : tactileButtonVariants}
                  initial="rest"
                  animate="rest"
                  whileHover={isBusy || reduceMotion ? undefined : 'hover'}
                  whileTap={isBusy || reduceMotion ? undefined : 'tap'}
                  className={`flex-1 h-10 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-opacity cursor-pointer focus-visible:outline-none focus-visible:ring-2 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 shadow-subtle ${
                    variant === 'danger'
                      ? 'bg-danger hover:opacity-90 text-text-inverse focus-visible:ring-danger'
                      : variant === 'accent'
                      ? 'bg-accent hover:bg-accent-hover text-text-inverse focus-visible:ring-accent'
                      : 'bg-surface-subtle hover:bg-surface-subtle/80 text-text-primary focus-visible:ring-accent'
                  }`}
                >
                  {isBusy && (
                    <SpinnerGap
                      size={14}
                      weight="bold"
                      className={reduceMotion ? undefined : 'animate-spin'}
                    />
                  )}
                  <span>{confirmLabel}</span>
                </motion.button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
