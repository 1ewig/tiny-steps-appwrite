'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { CALM_EASE } from '@/constants/animation';

const LOADING_LINES = [
  'Making this smaller…',
  'Finding your start…',
  'Softening the steps…',
  'Getting things ready…',
];

export function FocusLoader({ isVisible }: { isVisible: boolean }) {
  const reduceMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {isVisible && <FocusLoaderContent reduceMotion={Boolean(reduceMotion)} />}
    </AnimatePresence>
  );
}

function FocusLoaderContent({ reduceMotion }: { reduceMotion: boolean }) {
  const [showText, setShowText] = useState(reduceMotion);
  const [lineIndex, setLineIndex] = useState(0);

  // Overlay covers screen first (~0.2s) before loading text begins
  useEffect(() => {
    if (reduceMotion) return;

    const overlayTimer = setTimeout(() => {
      setShowText(true);
    }, 200);

    return () => clearTimeout(overlayTimer);
  }, [reduceMotion]);

  // Once text begins: 0.3s entrance + 1.5s hold = 1800ms until exit begins (0.3s exit)
  useEffect(() => {
    if (reduceMotion || !showText) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const scheduleNext = (delayMs: number) => {
      timeoutId = setTimeout(() => {
        setLineIndex((prev) => {
          if (prev >= LOADING_LINES.length - 1) return prev;
          const next = prev + 1;
          // Subsequent lines: 300ms exit + 300ms entrance + 1500ms hold = 2100ms
          scheduleNext(2100);
          return next;
        });
      }, delayMs);
    };

    // First line starts its exit after 0.3s entrance + 1.5s hold = 1800ms
    scheduleNext(1800);

    return () => clearTimeout(timeoutId);
  }, [showText, reduceMotion]);

  const overlayVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: reduceMotion ? 0 : 0.2,
        ease: CALM_EASE,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: reduceMotion ? 0 : 0.4,
        ease: CALM_EASE,
      },
    },
  };

  const lineVariants = {
    initial: {
      opacity: 0,
      filter: reduceMotion ? 'none' : 'blur(4px)',
    },
    animate: {
      opacity: 1,
      filter: 'blur(0px)',
      transition: {
        duration: reduceMotion ? 0 : 0.3,
        ease: CALM_EASE,
      },
    },
    exit: {
      opacity: 0,
      filter: reduceMotion ? 'none' : 'blur(4px)',
      transition: {
        duration: reduceMotion ? 0 : 0.3,
        ease: CALM_EASE,
      },
    },
  };

  return (
    <motion.div
      variants={overlayVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="focus-loader fixed inset-0 bg-canvas flex items-center justify-center px-6 select-none"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Preparing your tiny steps.</span>

      <div
        aria-hidden="true"
        className="relative w-full max-w-2xl min-h-24 sm:min-h-32 md:min-h-40 flex items-center justify-center"
      >
        <AnimatePresence mode="wait">
          {showText && (
            <motion.p
              key={reduceMotion ? 'static' : lineIndex}
              variants={lineVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              style={{ willChange: 'filter, opacity' }}
              className="absolute inset-0 flex items-center justify-center text-2xl sm:text-4xl md:text-5xl font-bold text-text-primary leading-snug sm:leading-tight tracking-tight text-center max-w-2xl mx-auto"
            >
              {reduceMotion ? LOADING_LINES[0] : LOADING_LINES[lineIndex]}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
