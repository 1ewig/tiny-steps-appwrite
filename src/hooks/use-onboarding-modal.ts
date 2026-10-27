'use client';

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type Dispatch,
  type RefObject,
  type SetStateAction,
} from 'react';
import { useReducedMotion, type Variants } from 'framer-motion';
import { useFocusTrap } from '@/hooks/use-focus-trap';
import { opticalMorphVariants } from '@/constants/animation';

const INTERACTIVE_SELECTOR =
  'button, a, input, textarea, select, summary, [role="button"], [role="tab"], [contenteditable="true"]';

export interface UseOnboardingModalOptions {
  totalSlides: number;
  onClose: () => void;
  onComplete: () => void;
  focusInputOnClose?: boolean;
}

export interface UseOnboardingModalReturn {
  currentPage: number;
  setCurrentPage: Dispatch<SetStateAction<number>>;
  isFirstPage: boolean;
  isLastPage: boolean;
  modalRef: RefObject<HTMLDivElement | null>;
  reduceMotion: boolean;
  morphVariants: Variants;
  handleNext: () => void;
  handlePrev: () => void;
  handleComplete: () => void;
  handleSkip: () => void;
}

export function useOnboardingModal({
  totalSlides,
  onClose,
  onComplete,
  focusInputOnClose = false,
}: UseOnboardingModalOptions): UseOnboardingModalReturn {
  const [currentPage, setCurrentPage] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const reduceMotion = Boolean(useReducedMotion());

  const morphVariants: Variants = useMemo(
    () =>
      reduceMotion
        ? {
            initial: { opacity: 0 },
            animate: { opacity: 1, transition: { duration: 0.15 } },
            exit: { opacity: 0, transition: { duration: 0.15 } },
          }
        : opticalMorphVariants,
    [reduceMotion]
  );

  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === totalSlides - 1;

  const dismiss = useCallback(
    (action: () => void) => {
      action();
      if (!focusInputOnClose) return;

      requestAnimationFrame(() => {
        const textarea = document.querySelector('textarea');
        if (textarea instanceof HTMLTextAreaElement) {
          textarea.focus();
        }
      });
    },
    [focusInputOnClose]
  );

  const handleComplete = useCallback(() => {
    dismiss(onComplete);
  }, [dismiss, onComplete]);

  const handleSkip = useCallback(() => {
    dismiss(onClose);
  }, [dismiss, onClose]);

  const handleNext = useCallback(() => {
    if (isLastPage) {
      handleComplete();
    } else {
      setCurrentPage((prev) => Math.min(prev + 1, totalSlides - 1));
    }
  }, [handleComplete, isLastPage, totalSlides]);

  const handlePrev = useCallback(() => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.closest(INTERACTIVE_SELECTOR)) return;

      if (event.key === 'ArrowRight') {
        event.preventDefault();
        handleNext();
      } else if (event.key === 'ArrowLeft') {
        event.preventDefault();
        handlePrev();
      } else if (event.code === 'Space' || event.key === 'Enter') {
        event.preventDefault();
        handleNext();
      }
    },
    [handleNext, handlePrev]
  );

  useFocusTrap({
    isOpen: true,
    containerRef: modalRef,
    isBusy: false,
    onClose: handleSkip,
    onKeyDown: handleKeyDown,
  });

  return {
    currentPage,
    setCurrentPage,
    isFirstPage,
    isLastPage,
    modalRef,
    reduceMotion,
    morphVariants,
    handleNext,
    handlePrev,
    handleComplete,
    handleSkip,
  };
}
