'use client';

import { useEffect, useRef, type RefObject } from 'react';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

interface UseFocusTrapOptions {
  isOpen: boolean;
  containerRef: RefObject<HTMLElement | null>;
  initialFocusRef?: RefObject<HTMLElement | null>;
  isBusy?: boolean;
  onClose?: () => void;
  onKeyDown?: (event: KeyboardEvent) => void;
  useCapture?: boolean;
}

/**
 * Custom hook providing accessible focus management, tab trapping,
 * initial focus targeting, and escape key dismissal for modal dialogs.
 */
export function useFocusTrap({
  isOpen,
  containerRef,
  initialFocusRef,
  isBusy = false,
  onClose,
  onKeyDown,
  useCapture = false,
}: UseFocusTrapOptions) {
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // Preserve and restore previously focused element
  useEffect(() => {
    if (!isOpen) return;

    previousActiveElementRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;

    if (initialFocusRef) {
      const frame = requestAnimationFrame(() => {
        initialFocusRef.current?.focus();
      });
      return () => {
        cancelAnimationFrame(frame);
        previousActiveElementRef.current?.focus();
        previousActiveElementRef.current = null;
      };
    }

    const timer = setTimeout(() => {
      containerRef.current?.focus({ preventScroll: true });
    }, 50);

    return () => {
      clearTimeout(timer);
      previousActiveElementRef.current?.focus();
      previousActiveElementRef.current = null;
    };
  }, [isOpen, containerRef, initialFocusRef]);

  // Tab trapping and Escape handling
  useEffect(() => {
    if (!isOpen || isBusy) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (onKeyDown) {
        onKeyDown(event);
        if (event.defaultPrevented) return;
      }

      if (event.key === 'Escape' && onClose) {
        event.preventDefault();
        if (useCapture) {
          event.stopPropagation();
        }
        onClose();
        return;
      }

      if (event.key === 'Tab' && containerRef.current) {
        const focusables = Array.from(
          containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        ).filter((el) => el.offsetParent !== null || el.getClientRects().length > 0);

        if (focusables.length === 0) return;

        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (document.activeElement === containerRef.current) {
          event.preventDefault();
          (event.shiftKey ? last : first).focus();
          return;
        }

        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown, { capture: useCapture });
    return () => {
      window.removeEventListener('keydown', handleKeyDown, { capture: useCapture });
    };
  }, [isOpen, isBusy, onClose, onKeyDown, useCapture, containerRef]);
}
