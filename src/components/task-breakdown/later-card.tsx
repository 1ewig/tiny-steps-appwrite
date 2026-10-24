'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Check } from '@phosphor-icons/react';
import type { Step } from '@/types/task';
import {
  tactileButtonVariants,
  tactileIconVariants,
  unblurFadeInVariants,
} from '@/constants/animation';

interface LaterCardProps {
  laterSteps: Step[];
  completedSteps: Step[];
  showCompleted: boolean;
  getStepNumber: (stepId: number) => number;
  onToggleCompleted: () => void;
  onSelectStep: (stepId: number) => void;
  onToggleStep: (stepId: number) => void;
}

export function LaterCard({
  laterSteps,
  completedSteps,
  showCompleted,
  getStepNumber,
  onToggleCompleted,
  onSelectStep,
  onToggleStep,
}: LaterCardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      variants={reduceMotion ? undefined : unblurFadeInVariants}
      className="lg:col-span-2 xl:col-span-3 space-y-2.5"
    >
      <div className="flex items-center justify-between px-1">
        <h2 className="text-2xs font-semibold uppercase tracking-widest text-text-tertiary">
          Later
        </h2>
      </div>

      <div className="space-y-4">
        {/* Pending Later Tasks */}
        {laterSteps.length > 0 ? (
          <ul className="space-y-1.5">
            {laterSteps.map((st) => (
              <li key={st.id}>
                <motion.button
                  type="button"
                  onClick={() => onSelectStep(st.id)}
                  variants={reduceMotion ? undefined : tactileButtonVariants}
                  initial="rest"
                  animate="rest"
                  whileHover={reduceMotion ? undefined : 'hover'}
                  whileTap={reduceMotion ? undefined : 'tap'}
                  className="relative w-full text-left text-xs text-text-tertiary hover:text-text-primary hover:z-10 flex items-center transition-colors py-1 cursor-pointer truncate"
                  title="Click to bring this to Now"
                >
                  <span className="text-2xs font-mono text-text-tertiary/70 mr-1.5 shrink-0 select-none">
                    {getStepNumber(st.id)}.
                  </span>
                  <span className="truncate">{st.text}</span>
                </motion.button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-2xs text-text-tertiary/70 italic px-1">Nothing further out.</p>
        )}

        {/* Completed Tasks — Collapsed Pill Summary */}
        {completedSteps.length > 0 && (
          <div className="pt-3 border-t border-border-subtle/60 space-y-2">
            <motion.button
              type="button"
              onClick={onToggleCompleted}
              variants={reduceMotion ? undefined : tactileButtonVariants}
              initial="rest"
              animate="rest"
              whileHover={reduceMotion ? undefined : 'hover'}
              whileTap={reduceMotion ? undefined : 'tap'}
              className="relative text-2xs font-medium text-text-tertiary hover:text-text-secondary flex items-center gap-1.5 hover:z-10 transition-colors cursor-pointer select-none"
            >
              <motion.span
                variants={reduceMotion ? undefined : tactileIconVariants}
                className="inline-flex shrink-0"
              >
                <Check size={11} weight="bold" className="text-accent" />
              </motion.span>
              <span>{completedSteps.length} finished</span>
              <span className="text-2xs opacity-60">({showCompleted ? 'hide' : 'view'})</span>
            </motion.button>

            <AnimatePresence>
              {showCompleted && (
                <motion.ul
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-1.5 px-1 pt-1 pb-1 overflow-hidden"
                >
                  {completedSteps.map((st) => (
                    <li key={st.id}>
                      <motion.button
                        type="button"
                        onClick={() => onToggleStep(st.id)}
                        variants={reduceMotion ? undefined : tactileButtonVariants}
                        initial="rest"
                        animate="rest"
                        whileHover={reduceMotion ? undefined : 'hover'}
                        whileTap={reduceMotion ? undefined : 'tap'}
                        className="relative w-full text-left text-xs line-through text-text-tertiary hover:text-text-secondary hover:z-10 flex items-center gap-1.5 transition-colors cursor-pointer truncate"
                        title="Click to restore"
                      >
                        <motion.span
                          variants={reduceMotion ? undefined : tactileIconVariants}
                          className="inline-flex shrink-0"
                        >
                          <Check size={10} weight="bold" className="text-accent/60" />
                        </motion.span>
                        <span className="text-2xs font-mono text-text-tertiary/60 shrink-0 select-none">
                          {getStepNumber(st.id)}.
                        </span>
                        <span className="truncate">{st.text}</span>
                      </motion.button>
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </motion.section>
  );
}
