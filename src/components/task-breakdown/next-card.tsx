'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { Step } from '@/types/task';
import { tactileButtonVariants, unblurFadeInVariants } from '@/constants/animation';

interface NextCardProps {
  steps: Step[];
  getStepNumber: (stepId: number) => number;
  onSelectStep: (stepId: number) => void;
}

export function NextCard({ steps, getStepNumber, onSelectStep }: NextCardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      variants={reduceMotion ? undefined : unblurFadeInVariants}
      className="lg:col-span-4 xl:col-span-4 space-y-2.5"
    >
      <div className="flex items-center justify-between px-1">
        <h2 className="text-2xs font-semibold uppercase tracking-widest text-text-tertiary">
          Next
        </h2>
      </div>

      <div className="space-y-2.5">
        {steps.length > 0 ? (
          steps.map((st, idx) => (
            <motion.button
              key={`${st.id}-${idx}`}
              type="button"
              onClick={() => onSelectStep(st.id)}
              aria-label={`Bring ${st.text} to Now`}
              variants={reduceMotion ? undefined : tactileButtonVariants}
              initial="rest"
              animate="rest"
              whileHover={reduceMotion ? undefined : 'hover'}
              whileTap={reduceMotion ? undefined : 'tap'}
              className="group relative w-full text-left rounded-2xl p-4 bg-surface shadow-subtle hover:shadow-card hover:z-10 cursor-pointer future-step-blur focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              title="Click to switch to this step"
            >
              <span className="flex items-start justify-between gap-3">
                <span className="flex items-start gap-2.5 min-w-0">
                  <span className="text-2xs font-mono text-text-tertiary/70 bg-surface-subtle px-1.5 py-0.5 rounded-md shrink-0 mt-0.5 select-none">
                    {getStepNumber(st.id)}
                  </span>
                  <span className="block text-xs sm:text-sm text-text-primary group-hover:text-accent transition-colors leading-snug">
                    <span className="block font-semibold">{st.title || st.text}</span>
                    {st.instruction && (
                      <span className="block text-2xs sm:text-xs text-text-secondary mt-0.5 font-normal">
                        {st.instruction}
                      </span>
                    )}
                  </span>
                </span>
              </span>
            </motion.button>
          ))
        ) : (
          <p className="text-xs text-text-tertiary px-1">
            You are on the final stretch.
          </p>
        )}
      </div>
    </motion.section>
  );
}
