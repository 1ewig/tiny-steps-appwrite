'use client';

import { motion } from 'framer-motion';
import { Sparkle, Check } from '@phosphor-icons/react';
import type { Step } from '@/types/task';

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
  if (!steps || steps.length === 0) return null;

  const activeIdx = steps.findIndex((s) => !s.completed);

  return (
    <div className="mt-4 pt-3 border-t border-border-subtle space-y-3">
      {/* Step List: Compact rows for inactive, Spotlight card for active */}
      <div className="space-y-1">
        {steps.map((st, idx) => {
          const isCompleted = st.completed;
          const isCurrent = idx === activeIdx;

          return (
            <motion.div
              key={st.id}
              layout
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className={
                isCurrent
                  ? 'my-2 rounded-xl p-3.5 bg-surface border border-accent shadow-subtle ring-1 ring-accent/15 transition-all'
                  : `rounded-lg px-2.5 py-1.5 transition-all ${isCompleted
                    ? 'opacity-50 hover:opacity-80'
                    : 'future-step-blur opacity-75'
                  }`
              }
            >
              <div className="flex items-start gap-2.5">
                {/* Checkbox Button */}
                <button
                  onClick={() => onToggleStep(st.id)}
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
                      onClick={() => !isCurrent && onToggleStep(st.id)}
                      className={`leading-snug select-none block ${isCompleted
                          ? 'text-xs line-through text-text-tertiary cursor-pointer'
                          : isCurrent
                            ? 'text-sm text-text-primary font-semibold'
                            : 'text-xs text-text-secondary cursor-pointer'
                        }`}
                    >
                      {st.text}
                    </span>
                  </div>

                  {/* Active Step Actions & Effort Badge */}
                  {isCurrent && (
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <span className="shrink-0 text-2xs text-text-tertiary font-medium">
                        {st.effort || '~1 min'}
                      </span>

                      <div className="flex items-center gap-1.5 ml-auto">
                        {st.canSplit && (
                          <button
                            onClick={() => onShrinkStep(idx)}
                            className="text-2xs px-2.5 py-1 rounded-md bg-surface-subtle hover:bg-surface-subtle/80 text-text-primary font-medium flex items-center gap-1.5 transition-all"
                          >
                            <Sparkle size={12} weight="duotone" className="text-accent" />
                            <span>Break down</span>
                          </button>
                        )}

                        <button
                          onClick={() => onToggleStep(st.id)}
                          className="text-2xs px-3 py-1 rounded-md bg-accent hover:bg-accent-hover text-text-inverse font-medium shadow-subtle transition-all active:scale-95 flex items-center gap-1"
                        >
                          <Check size={12} weight="bold" />
                          <span>Done</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}