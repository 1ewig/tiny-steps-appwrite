'use client';

import { useEffect, useRef, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { ChatSession } from '@/types/task';
import { getSessionSteps } from '@/lib/session-utils';
import { AppIcon } from '@/components/shared/app-icon';
import {
  ClockCounterClockwise,
  CheckCircle,
  ChatText,
  X,
  Trash,
} from '@phosphor-icons/react';
import {
  drawerSlideVariants,
  backdropVariants,
  tactileButtonVariants,
  tactileIconVariants,
} from '@/constants/animation';

interface HistoryDrawerProps {
  isOpen: boolean;
  sessions: ChatSession[];
  currentSessionId: string | null;
  onClose: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
}

export function HistoryDrawer({
  isOpen,
  sessions,
  currentSessionId,
  onClose,
  onSelectSession,
  onDeleteSession,
}: HistoryDrawerProps) {
  const reduceMotion = useReducedMotion();
  const panelRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const validSessions = sessions.filter(
    (s) => s.messages && s.messages.length > 0
  );

  useEffect(() => {
    if (!isOpen) return;

    const active = document.activeElement;
    previousFocusRef.current =
      active instanceof HTMLElement
        ? active
        : document.querySelector<HTMLElement>('[aria-label="Open task history"]');

    const frame = requestAnimationFrame(() => closeButtonRef.current?.focus());

    return () => {
      cancelAnimationFrame(frame);
      const target =
        previousFocusRef.current ??
        document.querySelector<HTMLElement>('[aria-label="Open task history"]');
      target?.focus();
      previousFocusRef.current = null;
    };
  }, [isOpen]);

  const handlePanelKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Tab') return;

    const panel = panelRef.current;
    if (!panel) return;

    const focusables = Array.from(
      panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => element.offsetParent !== null);

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
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Soft Dim & Blurred Backdrop */}
          <motion.div
            key="drawer-backdrop"
            variants={reduceMotion ? undefined : backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-scrim/50 backdrop-blur-sm z-backdrop cursor-pointer"
            aria-hidden="true"
          />

          {/* Right Slide Drawer */}
          <motion.aside
            ref={panelRef}
            key="drawer-panel"
            variants={reduceMotion ? undefined : drawerSlideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            tabIndex={-1}
            onKeyDown={handlePanelKeyDown}
            className="fixed inset-y-0 right-0 z-drawer w-full sm:w-1/3 min-w-[320px] sm:min-w-[380px] max-w-[calc(100vw-1.5rem)] bg-canvas-subtle flex flex-col justify-between shadow-modal font-sans focus:outline-none"
            role="dialog"
            aria-modal="true"
            aria-label="Task history"
          >
            {/* Top Bar: Title, Count Badge, Close */}
            <div className="p-4 sm:p-5 border-b border-border-subtle bg-canvas/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 flex items-center justify-center shrink-0">
                  <AppIcon size={26} className="rounded-lg shadow-subtle" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm tracking-tight text-text-primary">
                    Task history
                  </span>
                  {validSessions.length > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-2xs font-semibold bg-surface-subtle text-text-secondary">
                      {validSessions.length}
                    </span>
                  )}
                </div>
              </div>

              <motion.button
                ref={closeButtonRef}
                onClick={onClose}
                variants={reduceMotion ? undefined : tactileButtonVariants}
                initial="rest"
                animate="rest"
                whileHover={reduceMotion ? undefined : 'hover'}
                whileTap={reduceMotion ? undefined : 'tap'}
                className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-colors duration-fast cursor-pointer"
                aria-label="Close task history"
                title="Close (Esc)"
              >
                <motion.span
                  variants={reduceMotion ? undefined : tactileIconVariants}
                  className="flex items-center"
                >
                  <X size={18} weight="bold" />
                </motion.span>
              </motion.button>
            </div>

            {/* Middle: Saved Sessions List */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-2">
              {validSessions.length === 0 ? (
                <div className="py-12 px-4 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-surface-subtle text-text-tertiary flex items-center justify-center shadow-subtle">
                    <ClockCounterClockwise size={22} weight="regular" />
                  </div>
                  <div className="space-y-1 max-w-xs mx-auto">
                    <p className="text-xs font-semibold text-text-primary">
                      No saved tasks yet
                    </p>
                    <p className="text-2xs text-text-secondary leading-relaxed">
                      Whenever you break down a task, it stays saved here automatically on your device.
                    </p>
                  </div>
                </div>
              ) : (
                validSessions.map((sess) => {
                  const isCurrent = Boolean(
                    currentSessionId && sess.id === currentSessionId
                  );
                  const steps = getSessionSteps(sess);
                  const totalSteps = steps.length;
                  const completedSteps = steps.filter((s) => s.completed).length;

                  return (
                    <div key={sess.id} className="group relative">
                      <motion.button
                        type="button"
                        onClick={() => {
                          onSelectSession(sess.id);
                        }}
                        aria-current={isCurrent ? 'true' : undefined}
                        variants={reduceMotion ? undefined : tactileButtonVariants}
                        initial="rest"
                        animate="rest"
                        whileHover={reduceMotion ? undefined : 'hover'}
                        whileTap={reduceMotion ? undefined : 'tap'}
                        className={`w-full text-left p-3 pr-10 rounded-xl flex items-start gap-2.5 transition-colors duration-fast cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                          isCurrent
                            ? 'bg-accent-subtle/80 text-accent-text font-semibold shadow-subtle'
                            : 'bg-surface hover:bg-surface-subtle text-text-primary shadow-subtle'
                        }`}
                      >
                        <motion.div
                          variants={reduceMotion ? undefined : tactileIconVariants}
                          className="mt-0.5 shrink-0"
                        >
                          {totalSteps > 0 ? (
                            <CheckCircle
                              size={16}
                              weight={completedSteps === totalSteps ? 'fill' : 'regular'}
                              className={
                                completedSteps === totalSteps
                                  ? 'text-accent'
                                  : 'text-accent/80'
                              }
                            />
                          ) : (
                            <ChatText
                              size={16}
                              weight="regular"
                              className="text-text-tertiary"
                            />
                          )}
                        </motion.div>

                        <div className="min-w-0 flex-1 space-y-0.5">
                          <p className="text-xs font-medium text-text-primary truncate leading-snug">
                            {sess.title || 'Untitled task'}
                          </p>
                          <p className="text-2xs text-text-tertiary">
                            {totalSteps > 0
                              ? `${completedSteps} of ${totalSteps} done`
                              : `${sess.messages.length} message${
                                  sess.messages.length > 1 ? 's' : ''
                                }`}
                          </p>
                        </div>
                      </motion.button>

                      <motion.button
                        type="button"
                        onClick={() => onDeleteSession(sess.id)}
                        variants={reduceMotion ? undefined : tactileButtonVariants}
                        initial="rest"
                        animate="rest"
                        whileHover={reduceMotion ? undefined : 'hover'}
                        whileTap={reduceMotion ? undefined : 'tap'}
                        className="absolute top-2 right-2 z-10 p-1.5 rounded-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent hover:bg-danger-subtle text-text-tertiary hover:text-danger-text transition-opacity cursor-pointer"
                        title="Delete task"
                        aria-label={`Delete ${sess.title || 'task'}`}
                      >
                        <motion.span
                          variants={reduceMotion ? undefined : tactileIconVariants}
                          className="flex items-center"
                        >
                          <Trash size={14} weight="regular" />
                        </motion.span>
                      </motion.button>
                    </div>
                  );
                })
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
