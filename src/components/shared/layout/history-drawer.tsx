'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { Task } from '@/types/task';
import { formatTaskDate } from '@/lib/task-utils';
import { useHistoryDrawer } from '@/hooks/use-history-drawer';
import { AppIcon } from '@/components/shared/app-icon';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
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
  CALM_EASE,
} from '@/constants/animation';

interface HistoryDrawerProps {
  isOpen: boolean;
  tasks: Task[];
  currentTaskId: string | null;
  onClose: () => void;
  onSelectTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export function HistoryDrawer({
  isOpen,
  tasks,
  currentTaskId,
  onClose,
  onSelectTask,
  onDeleteTask,
}: HistoryDrawerProps) {
  const reduceMotion = useReducedMotion();

  const {
    validTasks,
    taskToDelete,
    panelRef,
    closeButtonRef,
    handlePanelKeyDown,
    handleRequestDelete,
    handleConfirmDelete,
    handleCancelDelete,
    handleClose,
  } = useHistoryDrawer({
    isOpen,
    tasks,
    onClose,
    onDeleteTask,
  });

  return (
    <>
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
              onClick={handleClose}
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
              className="fixed inset-y-0 right-0 z-drawer w-full sm:w-1/3 min-w-[320px] sm:min-w-[390px] max-w-[calc(100vw-1.5rem)] bg-canvas-subtle flex flex-col justify-between shadow-modal font-sans focus:outline-none"
              role="dialog"
              aria-modal="true"
              aria-label="Task history"
            >
              {/* Top Bar: Title, Count Badge, Close */}
              <div className="p-4 sm:p-5 border-b border-border-subtle bg-canvas/70 backdrop-blur-xs flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 flex items-center justify-center shrink-0">
                    <AppIcon size={26} className="rounded-lg shadow-subtle" />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm tracking-tight text-text-primary">
                      Task history
                    </span>
                    {validTasks.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-2xs font-semibold bg-surface-subtle text-text-secondary border border-border-subtle">
                        {validTasks.length}
                      </span>
                    )}
                  </div>
                </div>

                <motion.button
                  ref={closeButtonRef}
                  onClick={handleClose}
                  variants={reduceMotion ? undefined : tactileButtonVariants}
                  initial="rest"
                  animate="rest"
                  whileHover={reduceMotion ? undefined : 'hover'}
                  whileTap={reduceMotion ? undefined : 'tap'}
                  className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-colors duration-fast cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
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

              {/* Middle: Saved Tasks List */}
              <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-2.5">
                {validTasks.length === 0 ? (
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
                  <AnimatePresence initial={false}>
                    {validTasks.map((task) => {
                      const isCurrent = Boolean(
                        currentTaskId && task.id === currentTaskId
                      );
                      const steps = task.steps;
                      const totalSteps = steps.length;
                      const completedSteps = steps.filter((s) => s.completed).length;
                      const allCompleted =
                        totalSteps > 0 && completedSteps === totalSteps;
                      const progressPct =
                        totalSteps > 0
                          ? Math.round((completedSteps / totalSteps) * 100)
                          : 0;
                      const dateLabel = formatTaskDate(task.createdAt);

                      return (
                        <motion.div
                          key={task.id}
                          layout
                          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={
                            reduceMotion
                              ? undefined
                              : {
                                  opacity: 0,
                                  scale: 0.95,
                                  transition: { duration: 0.16, ease: CALM_EASE },
                                }
                          }
                          whileHover={reduceMotion ? undefined : { y: -1 }}
                          className={`w-full rounded-xl transition-colors duration-fast select-none border shadow-subtle flex items-center justify-between p-3 sm:p-3.5 gap-2.5 ${
                            isCurrent
                              ? 'bg-accent-subtle/80 text-accent-text border-accent/25'
                              : 'bg-surface hover:bg-surface-subtle/90 text-text-primary border-border-subtle hover:border-border-muted'
                          }`}
                        >
                          {/* Main interactive area for selecting the task */}
                          <button
                            type="button"
                            onClick={() => onSelectTask(task.id)}
                            aria-current={isCurrent ? 'true' : undefined}
                            className="min-w-0 flex-1 text-left flex items-start gap-2.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg"
                          >
                            {/* Step Status Icon */}
                            <div className="mt-0.5 shrink-0 text-text-tertiary">
                              {totalSteps > 0 ? (
                                <CheckCircle
                                  size={17}
                                  weight={allCompleted ? 'fill' : 'regular'}
                                  className={
                                    allCompleted
                                      ? 'text-accent'
                                      : 'text-accent/80'
                                  }
                                />
                              ) : (
                                <ChatText
                                  size={17}
                                  weight="regular"
                                />
                              )}
                            </div>

                            {/* Task Title & Details */}
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center gap-1.5 justify-between pr-1">
                                <p className="text-xs font-semibold text-text-primary truncate leading-snug">
                                  {task.title || 'Untitled task'}
                                </p>
                                {isCurrent && (
                                  <span className="shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-accent text-text-inverse tracking-wide uppercase shadow-subtle">
                                    Active
                                  </span>
                                )}
                              </div>

                              {/* Progress & Timestamp Meta */}
                              <div className="flex items-center gap-2 text-2xs text-text-tertiary">
                                <span>
                                  {totalSteps > 0
                                    ? allCompleted
                                      ? 'All steps done'
                                      : `${completedSteps} of ${totalSteps} done`
                                    : 'No steps yet'}
                                </span>

                                {dateLabel && (
                                  <>
                                    <span aria-hidden="true" className="opacity-60">·</span>
                                    <span>{dateLabel}</span>
                                  </>
                                )}
                              </div>

                              {/* Micro Progress Bar (Non-intrusive momentum tracker) */}
                              {totalSteps > 0 && (
                                <div className="w-full h-1 bg-border-subtle/80 rounded-full overflow-hidden mt-1.5">
                                  <div
                                    className="h-full bg-accent rounded-full transition-all duration-300"
                                    style={{ width: `${progressPct}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          </button>

                          {/* Delete Task Button: Native part of task card, tactile tap feedback preserved */}
                          <motion.button
                            type="button"
                            onClick={(e) => handleRequestDelete(e, task)}
                            whileTap={reduceMotion ? undefined : { scale: 0.88 }}
                            className="shrink-0 p-1.5 rounded-lg text-text-tertiary hover:text-danger-text hover:bg-danger-subtle transition-colors duration-fast cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-danger"
                            title={`Delete "${task.title || 'task'}"`}
                            aria-label={`Delete "${task.title || 'task'}"`}
                          >
                            <Trash size={15} weight="regular" />
                          </motion.button>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                )}
              </div>

              {/* Bottom Drawer Footer */}
              <div className="p-3.5 sm:p-4 border-t border-border-subtle bg-canvas/50 flex items-center justify-between text-2xs text-text-tertiary select-none">
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent/70 shrink-0" />
                  <span>100% offline & saved locally</span>
                </span>
                <span className="flex items-center gap-1 text-text-secondary">
                  <kbd className="font-mono text-2xs px-1.5 py-0.5 rounded bg-surface border border-border-subtle shadow-subtle">
                    Esc
                  </kbd>
                  <span className="text-text-tertiary">to close</span>
                </span>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Reusable ConfirmDialog wired to Task Deletion */}
      <ConfirmDialog
        isOpen={Boolean(taskToDelete)}
        title="Delete this task?"
        description={
          taskToDelete ? (
            <span>
              Are you sure you want to delete{' '}
              <strong className="text-text-primary font-semibold">
                “{taskToDelete.title}”
              </strong>
              ? Its step breakdown and progress will be permanently removed from this device.
            </span>
          ) : undefined
        }
        confirmLabel="Delete task"
        cancelLabel="Keep task"
        variant="danger"
        onConfirm={handleConfirmDelete}
        onClose={handleCancelDelete}
      />
    </>
  );
}
