'use client';

import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Step } from '@/types/task';
import { useTaskCard } from '@/hooks/use-task-card';
import { taskWorkspaceStaggerVariants, unblurFadeInVariants } from '@/constants/animation';
import { NowCard } from './now-card';
import { NextCard } from './next-card';
import { LaterCard } from './later-card';

interface TaskCardProps {
  guidanceText?: string;
  steps: Step[];
  isAdjusting?: boolean;
  onToggleStep: (stepId: number) => void;
  onShrinkStep: (stepIndex: number) => Promise<void> | void;
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
  const reduceMotion = useReducedMotion();
  const nowSectionRef = useRef<HTMLElement | null>(null);
  const pendingScrollRef = useRef(false);
  const {
    nowStep,
    nextSteps,
    laterSteps,
    completedSteps,
    nowStepIndex,
    nowStepNumber,
    naturalFirstStepNumber,
    totalStepsCount,
    isOutOfOrder,
    showSubSteps,
    showCompleted,
    getStepNumber,
    selectStep,
    resetOrder,
    markNowDone,
    toggleSubSteps,
    expandSubSteps,
    toggleCompleted,
  } = useTaskCard({ steps, onToggleStep });

  useEffect(() => {
    if (!pendingScrollRef.current) return;
    pendingScrollRef.current = false;

    const section = nowSectionRef.current;
    if (!section) return;

    const frame = requestAnimationFrame(() => {
      section.scrollIntoView({
        behavior: reduceMotion ? 'auto' : 'smooth',
        block: 'start',
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [nowStep?.id, reduceMotion]);

  const handleSelectStep = (stepId: number) => {
    if (stepId === nowStep?.id) return;
    pendingScrollRef.current = true;
    selectStep(stepId);
  };

  return (
    <motion.div
      variants={reduceMotion ? undefined : taskWorkspaceStaggerVariants}
      initial="initial"
      animate="animate"
      className="w-full max-w-6xl mx-auto space-y-6"
    >
      {/* Empathetic Guidance Callout */}
      {guidanceText && (
        <motion.div
          variants={reduceMotion ? undefined : unblurFadeInVariants}
          className="max-w-2xl mx-auto text-center px-5 py-3.5 sm:py-4 rounded-2xl bg-surface/80 border border-border-subtle/60 shadow-subtle backdrop-blur-sm"
        >
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed font-normal">
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
        <NowCard
          nowStep={nowStep}
          nowStepIndex={nowStepIndex}
          nowStepNumber={nowStepNumber}
          totalStepsCount={totalStepsCount}
          isOutOfOrder={isOutOfOrder}
          naturalFirstStepNumber={naturalFirstStepNumber}
          onResetOrder={resetOrder}
          sectionRef={nowSectionRef}
          showSubSteps={showSubSteps}
          onToggleSubSteps={toggleSubSteps}
          onExpandSubSteps={expandSubSteps}
          onMarkDone={markNowDone}
          onShrinkStep={onShrinkStep}
          onToggleSubStep={onToggleSubStep}
        />

        <NextCard
          steps={nextSteps}
          getStepNumber={getStepNumber}
          onSelectStep={handleSelectStep}
        />

        <LaterCard
          laterSteps={laterSteps}
          completedSteps={completedSteps}
          showCompleted={showCompleted}
          getStepNumber={getStepNumber}
          onToggleCompleted={toggleCompleted}
          onSelectStep={handleSelectStep}
          onToggleStep={onToggleStep}
        />
      </div>
    </motion.div>
  );
}
