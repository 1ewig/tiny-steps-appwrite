'use client';

import {
  useState,
  useEffect,
  useRef,
  useMemo,
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent,
} from 'react';
import type { ChatSession } from '@/types/task';

export interface UseHistoryDrawerOptions {
  isOpen: boolean;
  sessions: ChatSession[];
  onClose: () => void;
  onDeleteSession: (sessionId: string) => void;
}

export function useHistoryDrawer({
  isOpen,
  sessions,
  onClose,
  onDeleteSession,
}: UseHistoryDrawerOptions) {
  const panelRef = useRef<HTMLElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Deletion confirmation state
  const [sessionToDelete, setSessionToDelete] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const activeSessionToDelete = isOpen ? sessionToDelete : null;

  // Memoize valid sessions with messages
  const validSessions = useMemo(
    () => sessions.filter((s) => s.messages && s.messages.length > 0),
    [sessions]
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
    if (activeSessionToDelete) return;

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

  const handleRequestDelete = (event: MouseEvent, session: ChatSession) => {
    event.stopPropagation();
    setSessionToDelete({
      id: session.id,
      title: session.title || 'Untitled task',
    });
  };

  const handleConfirmDelete = () => {
    if (!sessionToDelete) return;
    onDeleteSession(sessionToDelete.id);
    setSessionToDelete(null);
  };

  const handleCancelDelete = () => {
    setSessionToDelete(null);
  };

  const handleClose = () => {
    setSessionToDelete(null);
    onClose();
  };

  return {
    validSessions,
    sessionToDelete: activeSessionToDelete,
    panelRef,
    closeButtonRef,
    handlePanelKeyDown,
    handleRequestDelete,
    handleConfirmDelete,
    handleCancelDelete,
    handleClose,
  };
}
