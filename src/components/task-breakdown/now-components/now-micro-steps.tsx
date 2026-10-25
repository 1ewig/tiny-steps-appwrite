'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check } from '@phosphor-icons/react';
import type { Step } from '@/types/task';
import {
  tactileButtonVariants,
  tactileCheckboxVariants,
  subStepsAccordionVariants,
  subStepItemVariants,
} from '@/constants/animation';

interface NowMicroStepsProps {
  step: Step;
  expanded: boolean;
  reduceMotion: boolean | null;
  onToggleSubStep?: (parentStepId: number, subStepId: number) => void;
}

export function NowMicroSteps({
  step,
  expanded,
  reduceMotion,
  onToggleSubStep,
}: NowMicroStepsProps) {
  const subSteps = step.subSteps ?? [];
  const hasSubSteps = subSteps.length > 0;

  return (
    <AnimatePresence initial={false}>
      {hasSubSteps && expanded && (
        <motion.div
          key="micro-steps-accordion"
          variants={reduceMotion ? undefined : subStepsAccordionVariants}
          initial={reduceMotion ? { height: 0, opacity: 0 } : 'collapsed'}
          animate={
            reduceMotion
              ? { height: 'auto', opacity: 1, transition: { duration: 0 } }
              : 'expanded'
          }
          exit={
            reduceMotion
              ? { height: 0, opacity: 0, transition: { duration: 0 } }
              : 'collapsed'
          }
          className="overflow-hidden"
        >
          {/* Spacing lives inside the animated height so nothing outside it changes at mount/unmount */}
          <div className="pt-5 pb-1">
            <div className="pt-4 border-t border-border-subtle space-y-3">
              <motion.div
                variants={reduceMotion ? undefined : subStepItemVariants}
                className="flex items-center justify-between"
              >
                <p className="text-2xs font-medium text-text-tertiary">
                  {subSteps.filter((s) => s.completed).length} of {subSteps.length} micro-steps
                  done
                </p>
              </motion.div>

              <div className="space-y-1.5">
                {subSteps.map((sub) => (
                  <motion.div
                    key={sub.id}
                    variants={reduceMotion ? undefined : subStepItemVariants}
                  >
                    <motion.div
                      variants={reduceMotion ? undefined : tactileButtonVariants}
                      initial="rest"
                      animate="rest"
                      whileHover={reduceMotion ? undefined : 'hover'}
                      whileTap={reduceMotion ? undefined : 'tap'}
                      className="relative flex items-center justify-between gap-3 p-1.5 rounded-xl hover:z-10 transition-colors group cursor-pointer"
                      onClick={() => onToggleSubStep?.(step.id, sub.id)}
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <motion.button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleSubStep?.(step.id, sub.id);
                          }}
                          variants={reduceMotion ? undefined : tactileCheckboxVariants}
                          initial="rest"
                          animate="rest"
                          whileHover={reduceMotion ? undefined : 'hover'}
                          whileTap={reduceMotion ? undefined : 'tap'}
                          aria-label={sub.completed ? 'Mark incomplete' : 'Mark complete'}
                          className={`w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0 transition-colors duration-fast ${
                            sub.completed
                              ? 'bg-accent border border-accent text-text-inverse'
                              : 'border border-border-muted group-hover:border-accent'
                          }`}
                        >
                          <AnimatePresence initial={false}>
                            {sub.completed && (
                              <motion.span
                                key="check"
                                initial={reduceMotion ? false : { scale: 0.4, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={reduceMotion ? undefined : { scale: 0.4, opacity: 0 }}
                                transition={{ type: 'spring', stiffness: 500, damping: 28 }}
                                className="flex items-center justify-center"
                              >
                                <Check size={10} weight="bold" />
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </motion.button>
                        <span
                          className={`text-xs leading-snug select-none break-words transition-colors duration-fast ${
                            sub.completed
                              ? 'line-through text-text-tertiary'
                              : 'text-text-primary'
                          }`}
                        >
                          <span className="font-medium">{sub.title || sub.text}</span>
                          {sub.instruction && (
                            <span className="block text-2xs text-text-secondary font-normal mt-0.5">
                              {sub.instruction}
                            </span>
                          )}
                        </span>
                      </div>
                      {sub.effort && (
                        <span className="text-2xs text-text-tertiary font-mono shrink-0">
                          {sub.effort}
                        </span>
                      )}
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
