'use client';

import { useState, useRef, type RefObject } from 'react';
import { useReducedMotion, type Variants } from 'framer-motion';
import { useFocusTrap } from '@/hooks/use-focus-trap';
import { opticalMorphVariants } from '@/constants/animation';

export interface UseOnboardingModalOptions {
  totalSlides: number;
  onClose: () => void;
  onComplete: () => void;
}

export interface UseOnboardingModalReturn {
  currentPage: number;
  setCurrentPage: (page: number) => void;
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
}: UseOnboardingModalOptions): UseOnboardingModalReturn {
  const [currentPage, setCurrentPage] = useState(0);
  const modalRef = useRef<HTMLDivElement>(null);
  const reduceMotion = Boolean(useReducedMotion());

  const morphVariants: Variants = reduceMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1, transition: { duration: 0.15 } },
        exit: { opacity: 0, transition: { duration: 0.15 } },
      }
    : opticalMorphVariants;

  const isFirstPage = currentPage === 0;
  const isLastPage = currentPage === totalSlides - 1;

  const handleComplete = () => {
    onComplete();
    requestAnimationFrame(() => {
      const textarea = document.querySelector('textarea');
      if (textarea instanceof HTMLTextAreaElement) {
        textarea.focus();
      }
    });
  };

  const handleSkip = () => {
    onClose();
    requestAnimationFrame(() => {
      const textarea = document.querySelector('textarea');
      if (textarea instanceof HTMLTextAreaElement) {
        textarea.focus();
      }
    });
  };

  const handleNext = () => {
    if (isLastPage) {
      handleComplete();
    } else {
      setCurrentPage((prev) => Math.min(prev + 1, totalSlides - 1));
    }
  };

  const handlePrev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 0));
  };

  useFocusTrap({
    isOpen: true,
    containerRef: modalRef,
    isBusy: false,
    onClose: handleSkip,
    onKeyDown: (e) => {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        handleNext();
      }
    },
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
