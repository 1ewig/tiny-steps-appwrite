'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, X, Check } from '@phosphor-icons/react';
import { AppIcon } from '@/components/shared/app-icon';
import { useOnboardingModal } from '@/hooks/use-onboarding-modal';
import {
  tactileButtonVariants,
  tactileIconVariants,
  CALM_EASE,
} from '@/constants/animation';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  focusInputOnClose?: boolean;
}

interface OnboardingSlide {
  headline: React.ReactNode;
  description: string;
  buttonLabel: string;
}

const SLIDES: OnboardingSlide[] = [
  {
    headline: (
      <>
        <span className="block sm:inline">Messy thoughts in,</span>{' '}
        <span className="block sm:inline">clear steps out.</span>
      </>
    ),
    description:
      'Type whatever is stressing you out. You don’t need a clean plan—we turn the chaos into an easy starting point.',
    buttonLabel: 'Next',
  },
  {
    headline: (
      <>
        <span className="block sm:inline">Built for when</span>{' '}
        <span className="block sm:inline">motivation is zero.</span>
      </>
    ),
    description:
      'Traditional lists demand high energy. We adapt to your battery—breaking steps down until friction disappears.',
    buttonLabel: 'Let’s begin',
  },
];

export function OnboardingModal({
  isOpen,
  onClose,
  onComplete,
  focusInputOnClose,
}: OnboardingModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <OnboardingModalContent
          onClose={onClose}
          onComplete={onComplete}
          focusInputOnClose={focusInputOnClose}
        />
      )}
    </AnimatePresence>
  );
}

function OnboardingModalContent({
  onClose,
  onComplete,
  focusInputOnClose,
}: {
  onClose: () => void;
  onComplete: () => void;
  focusInputOnClose?: boolean;
}) {
  const {
    currentPage,
    setCurrentPage,
    isFirstPage,
    isLastPage,
    modalRef,
    reduceMotion,
    morphVariants,
    handleNext,
    handlePrev,
    handleSkip,
  } = useOnboardingModal({
    totalSlides: SLIDES.length,
    onClose,
    onComplete,
    focusInputOnClose,
  });

  const activeSlide = SLIDES[currentPage];

  return (
    <motion.div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome to Tiny Steps"
      tabIndex={-1}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-modal bg-canvas/95 backdrop-blur-md flex flex-col items-center justify-between p-3.5 sm:p-5 select-none overflow-y-auto focus:outline-none"
    >
      {/* Top Bar: Brand in corner, Progress Dots, Skip in corner */}
      <header className="w-full flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center gap-2">
          <AppIcon size={24} className="shadow-subtle rounded-md" />
          <span className="text-xs font-semibold text-text-primary tracking-tight">
            Tiny Steps
          </span>
        </div>

        {/* Stepper Dots */}
        <div
          className="flex items-center gap-1.5"
          role="group"
          aria-label="Onboarding progress"
        >
          {SLIDES.map((_, idx) => {
            const isActive = idx === currentPage;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentPage(idx)}
                aria-label={`Go to slide ${idx + 1}`}
                aria-current={isActive ? 'step' : undefined}
                className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                  isActive
                    ? 'w-6 bg-accent'
                    : 'w-2 bg-border-muted hover:bg-border-focus'
                }`}
              />
            );
          })}
        </div>

        {/* Skip / Close */}
        <motion.button
          type="button"
          onClick={handleSkip}
          variants={reduceMotion ? undefined : tactileButtonVariants}
          initial="rest"
          animate="rest"
          whileHover={reduceMotion ? undefined : 'hover'}
          whileTap={reduceMotion ? undefined : 'tap'}
          className="inline-flex items-center justify-center h-9 w-9 sm:h-auto sm:w-auto sm:px-2.5 sm:py-1 rounded-lg text-xs font-medium text-text-tertiary hover:text-text-primary hover:bg-surface-subtle transition-colors duration-fast cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          title="Skip guide (Esc)"
          aria-label="Skip guide"
        >
          <span className="hidden sm:inline">Skip</span>
          <motion.span
            variants={reduceMotion ? undefined : tactileIconVariants}
            className="sm:hidden flex items-center"
          >
            <X size={16} weight="bold" />
          </motion.span>
        </motion.button>
      </header>

      {/* Center Stage: Pure Spotlight Copy with Overlapping Optical Morph */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 py-4 max-w-4xl lg:max-w-5xl mx-auto w-full my-auto">
        <motion.div
          layout
          transition={{ layout: { duration: reduceMotion ? 0 : 0.35, ease: CALM_EASE } }}
          className="relative grid grid-cols-1 grid-rows-1 place-items-center w-full max-w-4xl mx-auto"
        >
          <AnimatePresence initial={false}>
            <motion.div
              layout
              key={`slide_${currentPage}`}
              variants={morphVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              aria-live="polite"
              aria-atomic="true"
              style={{ willChange: reduceMotion ? undefined : 'filter, opacity, transform' }}
              className="col-start-1 row-start-1 w-full flex flex-col items-center justify-center text-center px-2 space-y-3 sm:space-y-4"
            >
              {/* Big Headline */}
              <h1 className="w-full text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-text-primary leading-tight tracking-tight max-w-4xl mx-auto">
                {activeSlide.headline}
              </h1>

              {/* Supportive Body Copy */}
              <p className="w-full text-center text-sm sm:text-base md:text-lg text-text-secondary leading-relaxed max-w-xl mx-auto font-medium">
                {activeSlide.description}
              </p>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </main>

      {/* Footer Controls: Back, Next/Begin, Keyboard Hints */}
      <footer className="w-full flex flex-col items-center gap-2.5 pb-2 shrink-0">
        <div className="flex items-center gap-3">
          {!isFirstPage && (
            <motion.button
              type="button"
              onClick={handlePrev}
              variants={reduceMotion ? undefined : tactileButtonVariants}
              initial="rest"
              animate="rest"
              whileHover={reduceMotion ? undefined : 'hover'}
              whileTap={reduceMotion ? undefined : 'tap'}
              className="h-10 sm:h-11 px-4 sm:px-5 rounded-full border border-border-subtle bg-surface hover:bg-surface-subtle text-text-secondary font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-colors duration-fast cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <ArrowLeft size={14} weight="bold" />
              <span>Back</span>
            </motion.button>
          )}

          <motion.button
            type="button"
            onClick={handleNext}
            variants={reduceMotion ? undefined : tactileButtonVariants}
            initial="rest"
            animate="rest"
            whileHover={reduceMotion ? undefined : 'hover'}
            whileTap={reduceMotion ? undefined : 'tap'}
            className="h-10 sm:h-11 px-6 sm:px-7 rounded-full bg-accent hover:bg-accent-hover text-text-inverse font-medium text-xs sm:text-sm shadow-subtle flex items-center gap-2 transition-colors duration-fast cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span>{activeSlide.buttonLabel}</span>
            {isLastPage ? (
              <Check size={15} weight="bold" />
            ) : (
              <ArrowRight size={15} weight="bold" />
            )}
          </motion.button>
        </div>

        <div className="text-2xs text-text-tertiary opacity-70 flex items-center gap-2 select-none">
          <span>
            <kbd className="font-mono text-text-secondary">Space</kbd> or{' '}
            <kbd className="font-mono text-text-secondary">Enter</kbd> to continue
          </span>
          <span aria-hidden="true">·</span>
          <span>
            <kbd className="font-mono text-text-secondary">Esc</kbd> to skip
          </span>
        </div>
      </footer>
    </motion.div>
  );
}
