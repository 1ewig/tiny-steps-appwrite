'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { Step } from '@/types/task';
import { tactileButtonVariants, unblurFadeInVariants } from '@/constants/animation';

interface NextCardProps {
  steps: Step[];
  onSelectStep: (stepId: number) => void;
}

export function NextCard({ steps, onSelectStep }: NextCardProps) {
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
        {steps.length > 0 && (
          <span className="text-3xs text-text-tertiary">{steps.length} queued</span>
        )}
      </div>

      <div className="space-y-2.5">
        {steps.length > 0 ? (
          steps.map((st) => (
            <motion.div
              key={st.id}
              onClick={() => onSelectStep(st.id)}
              variants={reduceMotion ? undefined : tactileButtonVariants}
              initial="rest"
              animate="rest"
              whileHover={reduceMotion ? undefined : 'hover'}
              whileTap={reduceMotion ? undefined : 'tap'}
              className="group relative rounded-2xl p-4 bg-surface shadow-subtle hover:shadow-card hover:z-10 cursor-pointer transition-shadow duration-fast future-step-blur"
              title="Click to switch to this step"
            >
              <div className="flex items-start justify-between gap-3">
                <h4 className="text-xs sm:text-sm font-medium text-text-primary group-hover:text-accent transition-colors leading-snug">
                  {st.text}
                </h4>
                {st.effort && (
                  <span className="text-3xs font-mono text-text-tertiary shrink-0 mt-0.5">
                    {st.effort}
                  </span>
                )}
              </div>
            </motion.div>
          ))
        ) : (
          <div className="p-4 rounded-2xl border border-dashed border-border-subtle/60 text-center">
            <p className="text-xs text-text-tertiary">You are on the final stretch.</p>
          </div>
        )}
      </div>
    </motion.section>
  );
}
