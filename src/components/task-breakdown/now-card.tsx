'use client';

import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { RefObject } from 'react';
import { Sparkle, Check, SpinnerGap } from '@phosphor-icons/react';
import type { Step } from '@/types/task';
import { useShrinkStep } from '@/hooks/use-shrink-step';
import {
  tactileButtonVariants,
  tactileIconVariants,
  unblurFadeInVariants,
} from '@/constants/animation';
import {
  NowCardHeader,
  NowCompletedCard,
  StepVisibilityToggle,
  NowMicroSteps,
} from './now-components';

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
  onShrinkStep: (stepIndex: number) => Promise<void> | void;
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
      <NowCardHeader
        nowStepNumber={nowStepNumber}
        totalStepsCount={totalStepsCount}
        isOutOfOrder={isOutOfOrder}
        naturalFirstStepNumber={naturalFirstStepNumber}
        onResetOrder={onResetOrder}
        reduceMotion={reduceMotion}
      />

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
          <NowCompletedCard reduceMotion={reduceMotion} />
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
  onShrinkStep: (stepIndex: number) => Promise<void> | void;
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
  const { isShrinking, trigger: triggerBreakDown } = useShrinkStep(async () => {
    onExpandSubSteps();
    await onShrinkStep(stepIndex);
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

      <NowMicroSteps
        step={step}
        expanded={showSubSteps}
        reduceMotion={reduceMotion}
        onToggleSubStep={onToggleSubStep}
      />
    </>
  );
}
