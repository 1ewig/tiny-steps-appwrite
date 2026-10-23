'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { ChatSession } from '@/types/task';
import { AppIcon } from '@/components/shared/app-icon';
import {
  ClockCounterClockwise,
  CheckCircle,
  ChatText,
  X,
  Plus,
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
  onNewSession: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onClearAllSessions?: () => void;
}

export function HistoryDrawer({
  isOpen,
  sessions,
  currentSessionId,
  onClose,
  onNewSession,
  onSelectSession,
  onDeleteSession,
  onClearAllSessions,
}: HistoryDrawerProps) {
  const reduceMotion = useReducedMotion();
  const [confirmClear, setConfirmClear] = useState(false);

  const validSessions = sessions.filter(
    (s) => s.messages && s.messages.length > 0
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Soft Dim Backdrop */}
          <motion.div
            key="drawer-backdrop"
            variants={reduceMotion ? undefined : backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-backdrop cursor-pointer"
            aria-hidden="true"
          />

          {/* Right Slide Drawer */}
          <motion.aside
            key="drawer-panel"
            variants={reduceMotion ? undefined : drawerSlideVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="fixed inset-y-0 right-0 z-sidebar w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] bg-canvas-subtle border-l border-border-subtle flex flex-col justify-between shadow-modal font-sans"
            role="dialog"
            aria-modal="true"
            aria-label="Task history"
          >
            {/* Top Bar: Title, Count Badge, Close */}
            <div className="p-4 sm:p-5 border-b border-border-subtle space-y-3.5 bg-canvas/60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 flex items-center justify-center shrink-0">
                    <AppIcon size={26} className="rounded-lg shadow-subtle" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm tracking-tight text-text-primary">
                      Task history
                    </span>
                    {validSessions.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-2xs font-semibold bg-surface border border-border-subtle text-text-secondary">
                        {validSessions.length}
                      </span>
                    )}
                  </div>
                </div>

                <motion.button
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

              {/* New Task Button */}
              <motion.button
                onClick={() => {
                  onNewSession();
                  onClose();
                }}
                variants={reduceMotion ? undefined : tactileButtonVariants}
                initial="rest"
                animate="rest"
                whileHover={reduceMotion ? undefined : 'hover'}
                whileTap={reduceMotion ? undefined : 'tap'}
                className="w-full py-2.5 px-3.5 rounded-xl text-xs font-semibold flex items-center justify-between border bg-surface hover:bg-surface-subtle text-text-primary border-border-subtle shadow-subtle transition-colors duration-fast group cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <motion.span
                    variants={reduceMotion ? undefined : tactileIconVariants}
                    className="flex items-center text-accent"
                  >
                    <Plus size={15} weight="bold" />
                  </motion.span>
                  <span>New gentle task</span>
                </span>
                <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-2xs font-mono rounded border bg-canvas-subtle text-text-tertiary border-border-subtle">
                  Ctrl+K
                </kbd>
              </motion.button>
            </div>

            {/* Middle: Saved Sessions List */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-2">
              {validSessions.length === 0 ? (
                <div className="py-12 px-4 text-center space-y-3">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-surface border border-border-subtle text-text-tertiary flex items-center justify-center shadow-subtle">
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
                  const latestMsg = [...sess.messages]
                    .reverse()
                    .find((m) => m.steps && m.steps.length > 0);
                  const steps = latestMsg?.steps || [];
                  const totalSteps = steps.length;
                  const completedSteps = steps.filter((s) => s.completed).length;

                  return (
                    <div
                      key={sess.id}
                      onClick={() => {
                        onSelectSession(sess.id);
                        onClose();
                      }}
                      className={`group p-3 rounded-xl border flex items-start justify-between gap-2.5 transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-accent-subtle/80 text-accent-text border-accent/40 font-semibold shadow-2xs'
                          : 'bg-surface hover:bg-surface-subtle text-text-primary border-border-subtle hover:border-border-muted shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0 flex-1">
                        <div className="mt-0.5 shrink-0">
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
                        </div>

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
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteSession(sess.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-md hover:bg-danger-subtle text-text-tertiary hover:text-danger-text transition-opacity cursor-pointer shrink-0"
                        title="Delete task"
                        aria-label="Delete task"
                      >
                        <Trash size={14} weight="regular" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Footer: Privacy reassurance & Clear All */}
            <div className="p-3.5 sm:p-4 border-t border-border-subtle bg-canvas/40 flex items-center justify-between text-2xs text-text-tertiary">
              <span>Saved locally on your device</span>

              {validSessions.length > 0 && onClearAllSessions && (
                confirmClear ? (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        onClearAllSessions();
                        setConfirmClear(false);
                      }}
                      className="px-2 py-0.5 rounded text-danger-text font-semibold hover:bg-danger-subtle transition-colors"
                    >
                      Confirm clear
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmClear(false)}
                      className="px-1.5 py-0.5 rounded hover:bg-surface-subtle text-text-tertiary"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmClear(true)}
                    className="hover:text-danger-text transition-colors cursor-pointer"
                  >
                    Clear all
                  </button>
                )
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
