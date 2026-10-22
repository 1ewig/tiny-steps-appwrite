'use client';

import { motion } from 'framer-motion';
import { Sparkle, Check } from '@phosphor-icons/react';
import type { Step } from '@/types/task';

interface StepsChecklistProps {
  steps: Step[];
  onToggleStep: (stepId: number) => void;
  onShrinkStep: (stepIndex: number) => void;
  onSkipStep: (stepIndex: number) => void;
  onOpenFocusTunnel: () => void;
}

export function StepsChecklist({
  steps,
  onToggleStep,
  onShrinkStep,
  onSkipStep,
  onOpenFocusTunnel,
}: StepsChecklistProps) {
  if (!steps || steps.length === 0) return null;

  const activeIdx = steps.findIndex((s) => !s.completed);
  const total = steps.length;
  const completedCount = steps.filter((s) => s.completed).length;

  return (
    <div className="mt-4 pt-3 border-t border-border-subtle space-y-2.5">
      {/* Status & Focus Mode Switcher */}
      <div className="flex items-center justify-between text-xs text-text-secondary px-1">
        <span>
          {completedCount} of {total} micro-steps done
        </span>
        <button
          onClick={onOpenFocusTunnel}
          className="text-accent font-semibold hover:underline flex items-center gap-1 transition-all"
        >
          <span>Focus Mode</span>
          <span>→</span>
        </button>
      </div>

      {/* Step Cards List */}
      <div className="space-y-2">
        {steps.map((st, idx) => {
          const isCompleted = st.completed;
          const isCurrent = idx === activeIdx;

          return (
            <motion.div
              key={st.id}
              layout
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`rounded-xl p-3.5 sm:p-4 border transition-all ${
                isCompleted
                  ? 'bg-canvas/50 border-border-subtle opacity-60'
                  : isCurrent
                  ? 'bg-surface border-accent shadow-subtle ring-1 ring-accent/20'
                  : 'bg-surface/50 border-border-subtle future-step-blur'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Checkbox Button */}
                <button
                  onClick={() => onToggleStep(st.id)}
                  aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
                  className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 border transition-all ${
                    isCompleted
                      ? 'bg-accent border-accent text-text-inverse'
                      : isCurrent
                      ? 'border-2 border-accent hover:bg-accent-subtle'
                      : 'border-border-muted'
                  }`}
                >
                  {isCompleted && (
                    <motion.svg
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-3 h-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </motion.svg>
                  )}
                </button>

                {/* Text & Effort Badge */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-xs sm:text-sm ${
                        isCompleted
                          ? 'line-through text-text-tertiary'
                          : isCurrent
                          ? 'text-text-primary font-semibold'
                          : 'text-text-secondary'
                      }`}
                    >
                      {st.text}
                    </span>

                    <span
                      className={`shrink-0 text-2xs px-2 py-0.5 rounded-full ${
                        isCurrent ? 'bg-accent-subtle text-accent-text font-medium' : 'text-text-tertiary'
                      }`}
                    >
                      {st.effort || '~1 min'}
                    </span>
                  </div>

                  {/* Active Step Supportive Actions */}
                  {isCurrent && (
                    <div className="mt-2.5 pt-2 border-t border-border-subtle flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        {st.canSplit ? (
                          <button
                            onClick={() => onShrinkStep(idx)}
                            className="text-2xs px-2.5 py-1 rounded-md bg-surface-subtle hover:bg-surface-subtle/80 text-text-primary font-medium flex items-center gap-1.5 transition-all"
                          >
                            <Sparkle size={12} weight="duotone" className="text-accent" />
                            <span>Shrink this step</span>
                          </button>
                        ) : (
                          <span className="text-2xs text-text-tertiary">Micro-step active</span>
                        )}

                        <button
                          onClick={() => onSkipStep(idx)}
                          className="text-2xs px-2 py-1 rounded-md hover:bg-surface-subtle text-text-tertiary hover:text-text-secondary transition-all"
                          title="Move to the end without guilt"
                        >
                          Skip
                        </button>
                      </div>

                      <button
                        onClick={() => onToggleStep(st.id)}
                        className="text-2xs px-3 py-1 rounded-md bg-accent hover:bg-accent-hover text-text-inverse font-medium shadow-subtle transition-all active:scale-95 flex items-center gap-1"
                      >
                        <Check size={12} weight="bold" />
                        <span>Done</span>
                      </button>
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
