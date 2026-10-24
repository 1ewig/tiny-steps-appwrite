'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { RefObject } from 'react';
import { Sparkle, Check, CaretDown, ArrowCounterClockwise, SpinnerGap } from '@phosphor-icons/react';
import type { Step } from '@/types/task';
import { useDelayedShrink } from '@/hooks/use-delayed-shrink';
import {
  tactileButtonVariants,
  tactileIconVariants,
  tactileCheckboxVariants,
  unblurFadeInVariants,
  subStepsAccordionVariants,
  subStepItemVariants,
} from '@/constants/animation';

interface NowCardProps {
  nowStep: Step | null;
  nowStepIndex: number;
  nowStepNumber?: number | null;
  totalStepsCount?: number;
  isOutOfOrder?: boolean;
  naturalFirstStepNumber?: number | null;
  onResetOrder?: () => void;
  sectionRef: RefObject<HTMLElement | null>;
  showSubSteps: boolean;
  onToggleSubSteps: () => void;
  onExpandSubSteps: () => void;
  onMarkDone: () => void;
  onShrinkStep: (stepIndex: number) => void;
  onToggleSubStep?: (parentStepId: number, subStepId: number) => void;
}

export function NowCard({
  nowStep,
  nowStepIndex,
  nowStepNumber,
  totalStepsCount,
  isOutOfOrder = false,
  naturalFirstStepNumber,
  onResetOrder,
  sectionRef,
  showSubSteps,
  onToggleSubSteps,
  onExpandSubSteps,
  onMarkDone,
  onShrinkStep,
  onToggleSubStep,
}: NowCardProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.section
      ref={sectionRef}
      variants={reduceMotion ? undefined : unblurFadeInVariants}
      className="lg:col-span-6 xl:col-span-5 space-y-2.5 scroll-mt-6"
    >
      <div className="flex items-center justify-between gap-2 px-1 min-h-6">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="text-2xs font-semibold uppercase tracking-widest text-accent">
            Now
          </h2>
          {nowStepNumber && totalStepsCount && (
            <span className="text-2xs font-mono text-text-tertiary whitespace-nowrap">
              · Step {nowStepNumber} of {totalStepsCount}
            </span>
          )}
        </div>

        <AnimatePresence>
          {isOutOfOrder && naturalFirstStepNumber && onResetOrder && (
            <motion.div
              className="shrink-0"
              initial={reduceMotion ? false : { opacity: 0, x: 6 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, x: 6 }}
              transition={{ duration: 0.15 }}
            >
              <motion.button
                type="button"
                onClick={onResetOrder}
                variants={reduceMotion ? undefined : tactileButtonVariants}
                initial="rest"
                animate="rest"
                whileHover={reduceMotion ? undefined : 'hover'}
                whileTap={reduceMotion ? undefined : 'tap'}
                className="text-2xs font-medium text-text-tertiary hover:text-accent flex items-center gap-1.5 rounded-sm transition-colors cursor-pointer select-none whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                title={`Return to recommended Step ${naturalFirstStepNumber}`}
              >
                <motion.span
                  variants={reduceMotion ? undefined : tactileIconVariants}
                  className="inline-flex"
                >
                  <ArrowCounterClockwise size={12} weight="bold" />
                </motion.span>
                <span>Back to step {naturalFirstStepNumber}</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {nowStep ? (
          <motion.article
            key={nowStep.id}
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="w-full bg-surface rounded-3xl p-6 sm:p-8 shadow-card"
          >
            <NowCardBody
              step={nowStep}
              stepIndex={nowStepIndex}
              showSubSteps={showSubSteps}
              reduceMotion={reduceMotion}
              onToggleSubSteps={onToggleSubSteps}
              onExpandSubSteps={onExpandSubSteps}
              onMarkDone={onMarkDone}
              onShrinkStep={onShrinkStep}
              onToggleSubStep={onToggleSubStep}
            />
          </motion.article>
        ) : (
          <motion.article
            key="all-completed"
            initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full bg-surface rounded-3xl p-8 sm:p-10 shadow-card text-center space-y-4"
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
  );
}

interface NowCardBodyProps {
  step: Step;
  stepIndex: number;
  showSubSteps: boolean;
  reduceMotion: boolean | null;
  onToggleSubSteps: () => void;
  onExpandSubSteps: () => void;
  onMarkDone: () => void;
  onShrinkStep: (stepIndex: number) => void;
  onToggleSubStep?: (parentStepId: number, subStepId: number) => void;
}

function NowCardBody({
  step,
  stepIndex,
  showSubSteps,
  reduceMotion,
  onToggleSubSteps,
  onExpandSubSteps,
  onMarkDone,
  onShrinkStep,
  onToggleSubStep,
}: NowCardBodyProps) {
  const subSteps = step.subSteps ?? [];
  const hasSubSteps = subSteps.length > 0;
  const canBreakDown = step.canSplit && stepIndex !== -1;
  const { isShrinking, trigger: triggerBreakDown } = useDelayedShrink(() => {
    onExpandSubSteps();
    onShrinkStep(stepIndex);
  });

  return (
    <>
      <div className="space-y-2">
        <h3 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight leading-snug">
          {step.text}
        </h3>
        {step.hint ? (
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            {step.hint}
          </p>
        ) : step.effort ? (
          <p className="text-xs text-text-tertiary">
            Takes about {step.effort.replace('~', '')}
          </p>
        ) : null}
      </div>

      <div className="mt-5 flex items-center gap-4 pt-1">
        <motion.button
          type="button"
          onClick={onMarkDone}
          disabled={isShrinking}
          variants={reduceMotion ? undefined : tactileButtonVariants}
          initial="rest"
          animate="rest"
          whileHover={isShrinking || reduceMotion ? undefined : 'hover'}
          whileTap={isShrinking || reduceMotion ? undefined : 'tap'}
          className="h-10 px-6 rounded-full bg-accent hover:bg-accent-hover text-text-inverse font-semibold text-xs sm:text-sm shadow-subtle flex items-center gap-2 transition-colors duration-fast cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <motion.span variants={reduceMotion ? undefined : tactileIconVariants}>
            <Check size={14} weight="bold" />
          </motion.span>
          <span>Mark as done</span>
        </motion.button>

        {hasSubSteps ? (
          <StepVisibilityToggle
            count={subSteps.length}
            expanded={showSubSteps}
            reduceMotion={reduceMotion}
            onToggle={onToggleSubSteps}
          />
        ) : canBreakDown ? (
          <motion.button
            type="button"
            onClick={triggerBreakDown}
            disabled={isShrinking}
            aria-busy={isShrinking}
            variants={reduceMotion ? undefined : tactileButtonVariants}
            initial="rest"
            animate="rest"
            whileHover={isShrinking || reduceMotion ? undefined : 'hover'}
            whileTap={isShrinking || reduceMotion ? undefined : 'tap'}
            className="text-xs font-medium text-text-tertiary hover:text-accent transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <motion.span
              variants={reduceMotion ? undefined : tactileIconVariants}
              className="inline-flex"
            >
              {isShrinking ? (
                <SpinnerGap
                  size={13}
                  weight="bold"
                  className={reduceMotion ? undefined : 'animate-spin'}
                />
              ) : (
                <Sparkle size={13} weight="duotone" className="text-accent" />
              )}
            </motion.span>
            <span aria-live="polite">
              {isShrinking ? 'Breaking it down…' : 'Still too big? Break it down'}
            </span>
          </motion.button>
        ) : null}
      </div>

      <MicroStepsPanel
        step={step}
        expanded={showSubSteps}
        reduceMotion={reduceMotion}
        onToggleSubStep={onToggleSubStep}
      />
    </>
  );
}

interface StepVisibilityToggleProps {
  count: number;
  expanded: boolean;
  reduceMotion: boolean | null;
  onToggle: () => void;
}

function StepVisibilityToggle({
  count,
  expanded,
  reduceMotion,
  onToggle,
}: StepVisibilityToggleProps) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      variants={reduceMotion ? undefined : tactileButtonVariants}
      initial="rest"
      animate="rest"
      whileHover={reduceMotion ? undefined : 'hover'}
      whileTap={reduceMotion ? undefined : 'tap'}
      className="group text-xs font-medium text-text-tertiary hover:text-text-primary transition-colors cursor-pointer inline-flex items-center gap-1.5 select-none"
    >
      <span className="relative inline-grid">
        <motion.span
          aria-hidden={!expanded}
          initial={false}
          animate={
            reduceMotion
              ? { opacity: expanded ? 1 : 0 }
              : { opacity: expanded ? 1 : 0, y: expanded ? 0 : 3 }
          }
          transition={{ duration: 0.14, ease: 'easeOut' }}
          className="[grid-area:1/1] whitespace-nowrap"
        >
          Hide steps
        </motion.span>
        <motion.span
          aria-hidden={expanded}
          initial={false}
          animate={
            reduceMotion
              ? { opacity: expanded ? 0 : 1 }
              : { opacity: expanded ? 0 : 1, y: expanded ? -3 : 0 }
          }
          transition={{ duration: 0.14, ease: 'easeOut' }}
          className="[grid-area:1/1] whitespace-nowrap"
        >
          {`Show ${count} smaller steps`}
        </motion.span>
      </span>
      <motion.span
        variants={reduceMotion ? undefined : tactileIconVariants}
        className="inline-flex text-text-tertiary group-hover:text-text-primary transition-colors"
      >
        <motion.span
          animate={reduceMotion ? undefined : { rotate: expanded ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 360, damping: 26 }}
          className="inline-flex"
        >
          <CaretDown size={12} weight="bold" />
        </motion.span>
      </motion.span>
    </motion.button>
  );
}

interface MicroStepsPanelProps {
  step: Step;
  expanded: boolean;
  reduceMotion: boolean | null;
  onToggleSubStep?: (parentStepId: number, subStepId: number) => void;
}

function MicroStepsPanel({
  step,
  expanded,
  reduceMotion,
  onToggleSubStep,
}: MicroStepsPanelProps) {
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
                          {sub.text}
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
