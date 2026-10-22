'use client';

import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { Sparkle, Check } from '@phosphor-icons/react';
import type { Step } from '@/types/task';

const EASE_CALM = [0.2, 0.9, 0.3, 1] as const;

interface StepsChecklistProps {
  steps: Step[];
  onToggleStep: (stepId: number) => void;
  onShrinkStep: (stepIndex: number) => void;
}

export function StepsChecklist({
  steps,
  onToggleStep,
  onShrinkStep,
}: StepsChecklistProps) {
  const [openStepId, setOpenStepId] = useState<number | null>(null);
  const reduceMotion = useReducedMotion();

  if (!steps || steps.length === 0) return null;

  const expandTransition = reduceMotion
    ? { duration: 0 }
    : {
        height: { duration: 0.26, ease: EASE_CALM },
        opacity: { duration: 0.18, ease: EASE_CALM },
      };

  const firstIncomplete = steps.find((s) => !s.completed);
  const openStep =
    steps.find((s) => s.id === openStepId && !s.completed) ?? firstIncomplete;
  const openIdx = openStep ? steps.findIndex((s) => s.id === openStep.id) : -1;

  const handleToggle = (step: Step, idx: number) => {
    const willComplete = !step.completed;
    onToggleStep(step.id);

    if (!willComplete) {
      setOpenStepId(step.id);
      return;
    }

    const next =
      steps.slice(idx + 1).find((s) => !s.completed) ??
      steps.find((s) => s.id !== step.id && !s.completed);
    setOpenStepId(next ? next.id : null);
  };

  return (
    <div className="mt-4 pt-3 border-t border-border-subtle space-y-3">
      {/* Step List: Compact rows for inactive, Spotlight card for active */}
      <div className="space-y-1">
        {steps.map((st, idx) => {
          const isCompleted = st.completed;
          const isCurrent = idx === openIdx;

          return (
            <div
              key={st.id}
              onClick={() => {
                if (!isCompleted) setOpenStepId(st.id);
              }}
              className={
                isCurrent
                  ? 'my-2 rounded-xl p-3.5 bg-surface border border-accent shadow-subtle ring-1 ring-accent/15 transition-all'
                  : `rounded-lg px-2.5 py-1.5 transition-all ${isCompleted
                    ? 'opacity-50 hover:opacity-80'
                    : 'future-step-blur opacity-75 cursor-pointer'
                  }`
              }
            >
              <div className="flex items-start gap-2.5">
                {/* Checkbox Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggle(st, idx);
                  }}
                  aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                  className={`mt-0.5 rounded-full flex items-center justify-center shrink-0 transition-all ${isCompleted
                      ? 'w-4 h-4 bg-accent border border-accent text-text-inverse'
                      : isCurrent
                        ? 'w-5 h-5 border-2 border-accent hover:bg-accent-subtle'
                        : 'w-4 h-4 border border-border-muted hover:border-text-tertiary'
                    }`}
                >
                  {isCompleted && <Check size={10} weight="bold" />}
                </button>

                {/* Step Content */}
                <div className="flex-1 min-w-0">
                  <div>
                    <span
                      className={`leading-snug select-none block ${isCompleted
                          ? 'text-xs line-through text-text-tertiary'
                          : isCurrent
                            ? 'text-sm text-text-primary font-semibold'
                            : 'text-xs text-text-secondary'
                        }`}
                    >
                      {st.text}
                    </span>
                  </div>

                  {/* Active Step Actions & Effort Badge */}
                  <AnimatePresence initial={false}>
                    {isCurrent && (
                      <motion.div
                        key="actions"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={expandTransition}
                        className="overflow-hidden"
                      >
                        <div className="pt-3 flex items-center justify-between gap-2">
                          <span className="shrink-0 text-2xs text-text-tertiary font-medium">
                            {st.effort || '~1 min'}
                          </span>

                          <div className="flex items-center gap-1.5 ml-auto">
                            {st.canSplit && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onShrinkStep(idx);
                                }}
                                className="text-2xs px-2.5 py-1 rounded-md bg-surface-subtle hover:bg-surface-subtle/80 text-text-primary font-medium flex items-center gap-1.5 transition-all"
                              >
                                <Sparkle size={12} weight="duotone" className="text-accent" />
                                <span>Break down</span>
                              </button>
                            )}

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggle(st, idx);
                              }}
                              className="text-2xs px-3 py-1 rounded-md bg-accent hover:bg-accent-hover text-text-inverse font-medium shadow-subtle transition-all active:scale-95 flex items-center gap-1"
                            >
                              <Check size={12} weight="bold" />
                              <span>Done</span>
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}