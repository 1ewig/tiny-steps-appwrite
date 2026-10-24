'use client';

import {
  useState,
  useEffect,
  useRef,
  useMemo,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent,
} from 'react';
import type { Task } from '@/types/task';

export interface UseHistoryDrawerOptions {
  isOpen: boolean;
  tasks: Task[];
  onClose: () => void;
  onDeleteTask: (taskId: string) => void;
}

export function useHistoryDrawer({
  isOpen,
  tasks,
  onClose,
  onDeleteTask,
}: UseHistoryDrawerOptions) {
  const panelRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Deletion confirmation state
  const [taskToDelete, setTaskToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const activeTaskToDelete = isOpen ? taskToDelete : null;

  // Memoize valid tasks that have steps
  const validTasks = useMemo(
    () => tasks.filter((t) => t.steps && t.steps.length > 0),
    [tasks]
  );

  // Focus management: capture previous focus & focus close button on open
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

  // Tab trapping keyboard navigation
  const handlePanelKeyDown = (event: ReactKeyboardEvent<HTMLElement>) => {
    // If confirmation dialog is open, let ConfirmDialog manage focus
    if (activeTaskToDelete) return;

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

  const handleRequestDelete = (event: MouseEvent, task: Task) => {
    event.stopPropagation();
    setTaskToDelete({
      id: task.id,
      title: task.title || 'Untitled task',
    });
  };

  const handleConfirmDelete = () => {
    if (!taskToDelete) return;
    onDeleteTask(taskToDelete.id);
    setTaskToDelete(null);
  };

  const handleCancelDelete = () => {
    setTaskToDelete(null);
  };

  const handleClose = () => {
    setTaskToDelete(null);
    onClose();
  };

  return {
    validTasks,
    taskToDelete: activeTaskToDelete,
    panelRef,
    closeButtonRef,
    handlePanelKeyDown,
    handleRequestDelete,
    handleConfirmDelete,
    handleCancelDelete,
    handleClose,
  };
}
