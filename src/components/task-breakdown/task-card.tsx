'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sparkle, Check } from '@phosphor-icons/react';
import type { Step } from '@/types/task';
import {
  tactileButtonVariants,
  tactileIconVariants,
  tactileCheckboxVariants,
} from '@/constants/animation';

interface TaskCardProps {
  guidanceText?: string;
  steps: Step[];
  isAdjusting?: boolean;
  onToggleStep: (stepId: number) => void;
  onShrinkStep: (stepIndex: number) => void;
  onToggleSubStep?: (parentStepId: number, subStepId: number) => void;
}

export function TaskCard({
  guidanceText,
  steps,
  isAdjusting = false,
  onToggleStep,
  onShrinkStep,
  onToggleSubStep,
}: TaskCardProps) {
  const [selectedStepId, setSelectedStepId] = useState<number | null>(null);
  const [isLaterHidden, setIsLaterHidden] = useState(false);
  const reduceMotion = useReducedMotion();

  // Find incomplete and completed steps
  const incompleteSteps = steps.filter((s) => !s.completed);
  const completedSteps = steps.filter((s) => s.completed);

  // Now step: selected if still incomplete, otherwise first incomplete
  const nowStep =
    incompleteSteps.find((s) => s.id === selectedStepId) ??
    incompleteSteps[0] ??
    null;

  // Next steps: up to 3 upcoming incomplete steps after "Now"
  const nextSteps = incompleteSteps.filter((s) => s.id !== nowStep?.id).slice(0, 3);

  // Later steps: remaining incomplete steps beyond Next
  const laterSteps = incompleteSteps
    .filter((s) => s.id !== nowStep?.id)
    .slice(3);

  const nowStepIndex = nowStep ? steps.findIndex((s) => s.id === nowStep.id) : -1;

  const handleMarkNowDone = () => {
    if (!nowStep) return;
    onToggleStep(nowStep.id);
    // Auto-advance to the next incomplete step
    const nextInLine = incompleteSteps.find((s) => s.id !== nowStep.id);
    setSelectedStepId(nextInLine ? nextInLine.id : null);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Empathetic Guidance Banner */}
      {guidanceText && (
        <div className="text-center max-w-2xl mx-auto py-1">
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed font-normal">
            {guidanceText}
          </p>
        </div>
      )}

      {/* Adjusting Indicator */}
      {isAdjusting && (
        <div className="flex items-center justify-center gap-2 py-1 text-xs text-text-tertiary animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-accent dot-1" />
          <span className="w-1.5 h-1.5 rounded-full bg-accent dot-2" />
          <span className="w-1.5 h-1.5 rounded-full bg-accent dot-3" />
          <span>Adjusting your steps...</span>
        </div>
      )}

      {/* 3-Column Layout: Now, Next, Later */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* =================================================================
            COLUMN 1: NOW (Large Hero Card)
            ================================================================= */}
        <section className="lg:col-span-6 xl:col-span-5 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-accent px-1">
            Now
          </h2>

          <AnimatePresence mode="wait">
            {nowStep ? (
              <motion.article
                key={nowStep.id}
                initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="w-full bg-surface border-2 border-accent/40 rounded-3xl p-6 sm:p-8 shadow-card ring-1 ring-accent/15 space-y-5"
              >
                {/* Main Task Title & Time Estimate */}
                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight leading-snug">
                    {nowStep.text}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-medium text-text-secondary">
                      {nowStep.effort ? `About ${nowStep.effort.replace('~', '')}` : 'About 1 minute'}
                    </span>
                  </div>
                  {nowStep.hint && (
                    <p className="text-xs text-text-tertiary leading-relaxed pt-1">
                      {nowStep.hint}
                    </p>
                  )}
                </div>

                {/* Nested Broken-Down Micro-Steps (Father Task Container) */}
                {nowStep.subSteps && nowStep.subSteps.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3.5 sm:p-4 rounded-2xl bg-surface-subtle/70 border border-border-subtle space-y-2.5 my-3"
                  >
                    <p className="text-2xs font-semibold uppercase tracking-wider text-accent">
                      Micro-steps
                    </p>
                    <div className="space-y-2">
                      {nowStep.subSteps.map((sub) => (
                        <div
                          key={sub.id}
                          className="flex items-start gap-2.5 group cursor-pointer"
                          onClick={() => onToggleSubStep?.(nowStep.id, sub.id)}
                        >
                          <motion.button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleSubStep?.(nowStep.id, sub.id);
                            }}
                            variants={reduceMotion ? undefined : tactileCheckboxVariants}
                            initial="rest"
                            animate="rest"
                            whileHover={reduceMotion ? undefined : 'hover'}
                            whileTap={reduceMotion ? undefined : 'tap'}
                            aria-label={sub.completed ? 'Mark incomplete' : 'Mark complete'}
                            className={`mt-0.5 rounded-full flex items-center justify-center shrink-0 transition-colors duration-fast ${
                              sub.completed
                                ? 'w-4 h-4 bg-accent border border-accent text-text-inverse'
                                : 'w-4 h-4 border border-border-muted hover:border-accent'
                            }`}
                          >
                            {sub.completed && <Check size={10} weight="bold" />}
                          </motion.button>
                          <span
                            className={`text-xs leading-snug select-none flex-1 ${
                              sub.completed
                                ? 'line-through text-text-tertiary'
                                : 'text-text-primary'
                            }`}
                          >
                            {sub.text}
                          </span>
                          <span className="text-2xs text-text-tertiary font-mono shrink-0">
                            {sub.effort}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Primary Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center gap-2.5">
                  <motion.button
                    type="button"
                    onClick={handleMarkNowDone}
                    variants={reduceMotion ? undefined : tactileButtonVariants}
                    initial="rest"
                    animate="rest"
                    whileHover={reduceMotion ? undefined : 'hover'}
                    whileTap={reduceMotion ? undefined : 'tap'}
                    className="h-11 px-6 rounded-full bg-accent hover:bg-accent-hover text-text-inverse font-semibold text-sm shadow-subtle flex items-center gap-2 transition-colors duration-fast cursor-pointer"
                  >
                    <motion.span variants={reduceMotion ? undefined : tactileIconVariants}>
                      <Check size={16} weight="bold" />
                    </motion.span>
                    <span>Mark as done</span>
                  </motion.button>

                  {/* On-demand Breakdown Button inside Now Card */}
                  {!nowStep.subSteps && nowStep.canSplit && nowStepIndex !== -1 && (
                    <motion.button
                      type="button"
                      onClick={() => onShrinkStep(nowStepIndex)}
                      variants={reduceMotion ? undefined : tactileButtonVariants}
                      initial="rest"
                      animate="rest"
                      whileHover={reduceMotion ? undefined : 'hover'}
                      whileTap={reduceMotion ? undefined : 'tap'}
                      className="h-11 px-4 rounded-full bg-surface-subtle hover:bg-surface-subtle/80 text-text-primary font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-colors duration-fast cursor-pointer"
                    >
                      <motion.span
                        variants={reduceMotion ? undefined : tactileIconVariants}
                        className="text-accent"
                      >
                        <Sparkle size={14} weight="duotone" />
                      </motion.span>
                      <span>Break down</span>
                    </motion.button>
                  )}
                </div>
              </motion.article>
            ) : (
              <motion.article
                key="all-completed"
                initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full bg-surface border border-accent/30 rounded-3xl p-8 sm:p-10 shadow-card text-center space-y-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-accent-subtle text-accent flex items-center justify-center orb-pulse mx-auto">
                  <Sparkle size={26} weight="duotone" className="text-accent" />
                </div>
                <div className="space-y-1.5 max-w-sm mx-auto">
                  <h3 className="text-xl sm:text-2xl font-bold text-text-primary">
                    You made it through.
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    Take a breath and unclench your jaw. You turned something heavy into momentum.
                  </p>
                </div>
              </motion.article>
            )}
          </AnimatePresence>
        </section>

        {/* =================================================================
            COLUMN 2: NEXT (Upcoming Cards with Delayed Hover Reveal)
            ================================================================= */}
        <section className="lg:col-span-4 xl:col-span-4 space-y-3">
          <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary px-1">
            Next
          </h2>

          <div className="space-y-3">
            {nextSteps.length > 0 ? (
              nextSteps.map((st) => (
                <div
                  key={st.id}
                  onClick={() => setSelectedStepId(st.id)}
                  className="group rounded-2xl p-4 sm:p-5 bg-surface border border-border-subtle hover:border-accent/40 shadow-subtle hover:shadow-card cursor-pointer transition-all duration-fast future-step-blur"
                  title="Click to start this task now"
                >
                  <h4 className="text-sm sm:text-base font-semibold text-text-primary group-hover:text-accent transition-colors leading-snug">
                    {st.text}
                  </h4>
                  <div className="flex items-center justify-between text-2xs text-text-tertiary mt-2.5">
                    <span>{st.effort || '~1 min'} · tap to start now</span>
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity text-accent font-medium">
                      Start →
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl p-5 bg-surface-subtle/30 border border-dashed border-border-subtle text-center">
                <p className="text-xs text-text-tertiary">No upcoming steps left in line.</p>
              </div>
            )}
          </div>
        </section>

        {/* =================================================================
            COLUMN 3: LATER & COMPLETED (Option B Strikethrough)
            ================================================================= */}
        <section className="lg:col-span-2 xl:col-span-3 space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              Later
            </h2>
            <button
              type="button"
              onClick={() => setIsLaterHidden(!isLaterHidden)}
              className="text-2xs font-semibold text-accent hover:text-accent-hover transition-colors cursor-pointer"
            >
              {isLaterHidden ? 'Show' : 'Hide'}
            </button>
          </div>

          <AnimatePresence initial={false}>
            {!isLaterHidden && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4 overflow-hidden"
              >
                {/* Pending Later Tasks */}
                {laterSteps.length > 0 ? (
                  <ul className="space-y-2">
                    {laterSteps.map((st) => (
                      <li key={st.id}>
                        <button
                          type="button"
                          onClick={() => setSelectedStepId(st.id)}
                          className="w-full text-left text-xs text-text-secondary hover:text-text-primary transition-colors py-1 cursor-pointer truncate block"
                          title="Click to move to Now"
                        >
                          {st.text}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-2xs text-text-tertiary italic">No later tasks queued.</p>
                )}

                {/* Completed Tasks (Option B: Strikethrough List) */}
                {completedSteps.length > 0 && (
                  <div className="pt-3 border-t border-border-subtle space-y-2">
                    <p className="text-2xs uppercase tracking-wider font-semibold text-text-tertiary">
                      Completed ({completedSteps.length})
                    </p>
                    <ul className="space-y-1.5">
                      {completedSteps.map((st) => (
                        <li key={st.id}>
                          <button
                            type="button"
                            onClick={() => onToggleStep(st.id)}
                            className="w-full text-left text-xs line-through text-text-tertiary hover:text-text-secondary flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Click to restore"
                          >
                            <Check size={11} weight="bold" className="text-accent shrink-0" />
                            <span className="truncate">{st.text}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </div>
  );
}
