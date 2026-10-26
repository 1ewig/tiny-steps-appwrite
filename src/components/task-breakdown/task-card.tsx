'use client';

import { useEffect, useRef } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Step, EnergyLevel } from '@/types/task';
import { useTaskCard } from '@/hooks/use-task-card';
import { taskWorkspaceStaggerVariants, unblurFadeInVariants } from '@/constants/animation';
import { isCrisisGuidance } from '@/lib/task-utils';
import { NowCard } from './now-card';
import { NextCard } from './next-card';
import { LaterCard } from './later-card';

interface TaskCardProps {
  taskTitle?: string;
  guidanceText?: string;
  steps: Step[];
  energyLevel?: EnergyLevel;
  onToggleStep: (stepId: number) => void;
  onShrinkStep: (stepIndex: number) => Promise<void> | void;
  onToggleSubStep?: (parentStepId: number, subStepId: number) => void;
}

export function TaskCard({
  taskTitle,
  guidanceText,
  steps,
  energyLevel,
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
  } = useTaskCard({ steps, energyLevel, onToggleStep });

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
      {/* Task Mission Header: Bold Centered Title + Empathetic Guidance Callout */}
      {(taskTitle || guidanceText) && (
        <motion.div
          variants={reduceMotion ? undefined : unblurFadeInVariants}
          className="max-w-3xl mx-auto text-center px-4 space-y-2.5"
        >
          {taskTitle && (
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-text-primary leading-tight">
              {taskTitle}
            </h1>
          )}
          {guidanceText && (
            isCrisisGuidance(guidanceText) ? (
              <div className="p-4 rounded-2xl bg-surface border border-accent/30 shadow-subtle text-left space-y-2 mt-3">
                <p className="text-sm sm:text-base text-text-primary leading-relaxed font-medium">
                  {guidanceText}
                </p>
                <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-text-secondary">
                  <span className="font-semibold text-accent">Lifeline: 988</span>
                  <span>·</span>
                  <span className="font-semibold text-accent">Crisis Text Line: 741741</span>
                  <span>·</span>
                  <span>Free, confidential, 24/7</span>
                </div>
              </div>
            ) : (
              <p className="text-xs sm:text-sm md:text-base text-text-secondary leading-relaxed font-normal max-w-xl mx-auto">
                {guidanceText}
              </p>
            )
          )}
        </motion.div>
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
