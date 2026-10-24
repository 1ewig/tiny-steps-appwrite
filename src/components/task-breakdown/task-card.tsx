'use client';

import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sparkle, Check, CaretDown } from '@phosphor-icons/react';
import type { Step } from '@/types/task';
import {
  tactileButtonVariants,
  tactileIconVariants,
  tactileCheckboxVariants,
  staggerContainerVariants,
  unblurFadeInVariants,
  subStepsAccordionVariants,
  subStepItemVariants,
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
  const [showSubSteps, setShowSubSteps] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);
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
    <motion.div
      variants={reduceMotion ? undefined : staggerContainerVariants}
      initial="initial"
      animate="animate"
      className="w-full max-w-6xl mx-auto space-y-6"
    >
      {/* Empathetic Guidance Whisper */}
      {guidanceText && (
        <motion.div
          variants={reduceMotion ? undefined : unblurFadeInVariants}
          className="text-center max-w-xl mx-auto py-1"
        >
          <p className="text-xs sm:text-sm text-text-tertiary leading-relaxed font-normal">
            {guidanceText}
          </p>
        </motion.div>
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
            COLUMN 1: NOW (Focused Hero Card)
            ================================================================= */}
        <motion.section
          variants={reduceMotion ? undefined : unblurFadeInVariants}
          className="lg:col-span-6 xl:col-span-5 space-y-2.5"
        >
          <h2 className="text-2xs font-semibold uppercase tracking-widest text-accent px-1">
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
                className="w-full bg-surface border border-border-subtle rounded-3xl p-6 sm:p-8 shadow-card"
              >
                {/* Main Task Title & Hint */}
                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight leading-snug">
                    {nowStep.text}
                  </h3>
                  {nowStep.hint ? (
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                      {nowStep.hint}
                    </p>
                  ) : nowStep.effort ? (
                    <p className="text-xs text-text-tertiary">
                      Takes about {nowStep.effort.replace('~', '')}
                    </p>
                  ) : null}
                </div>

                {/* Primary Action Row */}
                <div className="mt-5 flex items-center gap-4 pt-1">
                  <motion.button
                    type="button"
                    onClick={handleMarkNowDone}
                    variants={reduceMotion ? undefined : tactileButtonVariants}
                    initial="rest"
                    animate="rest"
                    whileHover={reduceMotion ? undefined : 'hover'}
                    whileTap={reduceMotion ? undefined : 'tap'}
                    className="h-10 px-6 rounded-full bg-accent hover:bg-accent-hover text-text-inverse font-semibold text-xs sm:text-sm shadow-subtle flex items-center gap-2 transition-colors duration-fast cursor-pointer"
                  >
                    <motion.span variants={reduceMotion ? undefined : tactileIconVariants}>
                      <Check size={14} weight="bold" />
                    </motion.span>
                    <span>Mark as done</span>
                  </motion.button>

                  {/* Toggle Sub-steps or Break Down text link */}
                  {nowStep.subSteps && nowStep.subSteps.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setShowSubSteps((prev) => !prev)}
                      aria-expanded={showSubSteps}
                      className="group text-xs font-medium text-text-tertiary hover:text-text-primary transition-colors cursor-pointer inline-flex items-center gap-1.5 py-1.5 px-2 -mx-2 rounded-lg hover:bg-surface-subtle/50 select-none"
                    >
                      <span className="relative inline-grid">
                        <motion.span
                          aria-hidden={!showSubSteps}
                          initial={false}
                          animate={
                            reduceMotion
                              ? { opacity: showSubSteps ? 1 : 0 }
                              : { opacity: showSubSteps ? 1 : 0, y: showSubSteps ? 0 : 3 }
                          }
                          transition={{ duration: 0.14, ease: 'easeOut' }}
                          className="[grid-area:1/1] whitespace-nowrap"
                        >
                          Hide steps
                        </motion.span>
                        <motion.span
                          aria-hidden={showSubSteps}
                          initial={false}
                          animate={
                            reduceMotion
                              ? { opacity: showSubSteps ? 0 : 1 }
                              : { opacity: showSubSteps ? 0 : 1, y: showSubSteps ? -3 : 0 }
                          }
                          transition={{ duration: 0.14, ease: 'easeOut' }}
                          className="[grid-area:1/1] whitespace-nowrap"
                        >
                          {`Show ${nowStep.subSteps.length} smaller steps`}
                        </motion.span>
                      </span>
                      <motion.span
                        animate={{ rotate: showSubSteps ? 180 : 0 }}
                        transition={{ type: 'spring', stiffness: 360, damping: 26 }}
                        className="inline-flex text-text-tertiary group-hover:text-text-primary transition-colors"
                      >
                        <CaretDown size={12} weight="bold" />
                      </motion.span>
                    </button>
                  ) : nowStep.canSplit && nowStepIndex !== -1 ? (
                    <button
                      type="button"
                      onClick={() => {
                        setShowSubSteps(true);
                        onShrinkStep(nowStepIndex);
                      }}
                      className="text-xs font-medium text-text-tertiary hover:text-accent transition-colors cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkle size={13} weight="duotone" className="text-accent" />
                      <span>Still too big? Break it down</span>
                    </button>
                  ) : null}
                </div>

                {/* Unboxed Micro-Steps Section */}
                <AnimatePresence initial={false}>
                  {nowStep.subSteps && nowStep.subSteps.length > 0 && showSubSteps && (
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
                      <div className="pt-5">
                        <div className="pt-4 border-t border-border-subtle space-y-3">
                          <motion.div
                            variants={reduceMotion ? undefined : subStepItemVariants}
                            className="flex items-center justify-between"
                          >
                            <p className="text-2xs font-medium text-text-tertiary">
                              {nowStep.subSteps.filter((s) => s.completed).length} of{' '}
                              {nowStep.subSteps.length} micro-steps done
                            </p>
                          </motion.div>

                          <div className="space-y-1.5">
                            {nowStep.subSteps.map((sub) => (
                              <motion.div
                                key={sub.id}
                                variants={reduceMotion ? undefined : subStepItemVariants}
                                className="flex items-center justify-between gap-3 p-1.5 rounded-xl hover:bg-surface-subtle/50 transition-colors group cursor-pointer"
                                onClick={() => onToggleSubStep?.(nowStep.id, sub.id)}
                              >
                                <div className="flex items-center gap-2.5 min-w-0 flex-1">
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
                                    {sub.text}
                                  </span>
                                </div>
                                {sub.effort && (
                                  <span className="text-2xs text-text-tertiary font-mono shrink-0">
                                    {sub.effort}
                                  </span>
                                )}
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
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
        </motion.section>

        {/* =================================================================
            COLUMN 2: NEXT (Gentle Uncluttered Cards with Future Blur)
            ================================================================= */}
        <motion.section
          variants={reduceMotion ? undefined : unblurFadeInVariants}
          className="lg:col-span-4 xl:col-span-4 space-y-2.5"
        >
          <div className="flex items-center justify-between px-1">
            <h2 className="text-2xs font-semibold uppercase tracking-widest text-text-tertiary">
              Next
            </h2>
            {nextSteps.length > 0 && (
              <span className="text-3xs text-text-tertiary">
                {nextSteps.length} queued
              </span>
            )}
          </div>

          <div className="space-y-2.5">
            {nextSteps.length > 0 ? (
              nextSteps.map((st) => (
                <div
                  key={st.id}
                  onClick={() => setSelectedStepId(st.id)}
                  className="group rounded-2xl p-4 bg-surface border border-border-subtle/80 hover:border-accent/40 shadow-subtle hover:shadow-card cursor-pointer transition-all duration-fast future-step-blur"
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
                </div>
              ))
            ) : (
              <div className="p-4 rounded-2xl border border-dashed border-border-subtle/60 text-center">
                <p className="text-xs text-text-tertiary">You are on the final stretch.</p>
              </div>
            )}
          </div>
        </motion.section>

        {/* =================================================================
            COLUMN 3: LATER & COMPLETED (Quiet Whisper & Collapsed Summary)
            ================================================================= */}
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
                    <button
                      type="button"
                      onClick={() => setSelectedStepId(st.id)}
                      className="w-full text-left text-xs text-text-tertiary hover:text-text-primary transition-colors py-1 cursor-pointer truncate block"
                      title="Click to bring this to Now"
                    >
                      · {st.text}
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-2xs text-text-tertiary/70 italic px-1">Nothing further out.</p>
            )}

            {/* Completed Tasks — Collapsed Pill Summary */}
            {completedSteps.length > 0 && (
              <div className="pt-3 border-t border-border-subtle/60 space-y-2">
                <button
                  type="button"
                  onClick={() => setShowCompleted(!showCompleted)}
                  className="text-2xs font-medium text-text-tertiary hover:text-text-secondary flex items-center gap-1.5 transition-colors cursor-pointer select-none"
                >
                  <Check size={11} weight="bold" className="text-accent shrink-0" />
                  <span>{completedSteps.length} finished</span>
                  <span className="text-3xs opacity-60">({showCompleted ? 'hide' : 'view'})</span>
                </button>

                <AnimatePresence>
                  {showCompleted && (
                    <motion.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-1.5 pt-1 overflow-hidden"
                    >
                      {completedSteps.map((st) => (
                        <li key={st.id}>
                          <button
                            type="button"
                            onClick={() => onToggleStep(st.id)}
                            className="w-full text-left text-xs line-through text-text-tertiary hover:text-text-secondary flex items-center gap-1.5 transition-colors cursor-pointer truncate"
                            title="Click to restore"
                          >
                            <Check size={10} weight="bold" className="text-accent/60 shrink-0" />
                            <span className="truncate">{st.text}</span>
                          </button>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
}
