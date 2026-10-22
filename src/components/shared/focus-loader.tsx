'use client';

import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const EASE_CALM = [0.2, 0.9, 0.3, 1] as const;
const ROTATE_MS = 1500;

const LOADING_LINES = [
  'Making this smaller…',
  'Finding the gentlest place to start…',
  'Breaking it into tiny steps…',
  'Almost there…',
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
  const [lineIndex, setLineIndex] = useState(0);

  useEffect(() => {
    if (reduceMotion) return;

    const interval = setInterval(() => {
      setLineIndex((current) =>
        current < LOADING_LINES.length - 1 ? current + 1 : current
      );
    }, ROTATE_MS);

    return () => clearInterval(interval);
  }, [reduceMotion]);

  const lineTransition = reduceMotion
    ? { duration: 0 }
    : { duration: 0.18, ease: EASE_CALM };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={
        reduceMotion ? { duration: 0 } : { duration: 0.22, ease: EASE_CALM }
      }
      className="focus-loader fixed inset-0 bg-canvas flex items-center justify-center px-6 select-none"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Preparing your tiny steps.</span>

      <div
        aria-hidden="true"
        className="relative w-full max-w-2xl min-h-24 sm:min-h-32 md:min-h-40 flex items-center justify-center"
      >
        <AnimatePresence initial={false}>
          <motion.p
            key={reduceMotion ? 'static' : lineIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={lineTransition}
            className="absolute inset-0 flex items-center justify-center text-2xl sm:text-4xl md:text-5xl font-bold text-text-primary leading-snug sm:leading-tight tracking-tight text-center max-w-2xl mx-auto"
          >
            {reduceMotion ? LOADING_LINES[0] : LOADING_LINES[lineIndex]}
          </motion.p>
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
