'use client';

import { useState, useMemo } from 'react';
import type { Step } from '@/types/task';

interface UseTaskCardOptions {
  steps: Step[];
  onToggleStep: (stepId: number) => void;
}

export function useTaskCard({ steps, onToggleStep }: UseTaskCardOptions) {
  const [selectedStepId, setSelectedStepId] = useState<number | null>(null);
  const [showSubSteps, setShowSubSteps] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);

  const stepNumberMap = useMemo(() => {
    return new Map(steps.map((s, idx) => [s.id, idx + 1]));
  }, [steps]);

  const getStepNumber = (stepId: number) => stepNumberMap.get(stepId) ?? 0;

  const incompleteSteps = steps.filter((s) => !s.completed);
  const completedSteps = steps.filter((s) => s.completed);

  // Natural first step in recommended sequence
  const naturalFirstStep = incompleteSteps[0] ?? null;

  // Now step: selected if still incomplete, otherwise natural first incomplete
  const nowStep =
    incompleteSteps.find((s) => s.id === selectedStepId) ??
    naturalFirstStep;

  // Next steps: up to 3 upcoming incomplete steps after "Now"
  const nextSteps = incompleteSteps.filter((s) => s.id !== nowStep?.id).slice(0, 3);

  // Later steps: remaining incomplete steps beyond Next
  const laterSteps = incompleteSteps.filter((s) => s.id !== nowStep?.id).slice(3);

  const nowStepIndex = nowStep ? steps.findIndex((s) => s.id === nowStep.id) : -1;
  const nowStepNumber = nowStep ? getStepNumber(nowStep.id) : null;
  const naturalFirstStepNumber = naturalFirstStep ? getStepNumber(naturalFirstStep.id) : null;
  const totalStepsCount = steps.length;

  // Out of order when the current step differs from the first incomplete step
  const isOutOfOrder = Boolean(
    nowStep && naturalFirstStep && nowStep.id !== naturalFirstStep.id
  );

  const selectStep = (stepId: number) => setSelectedStepId(stepId);
  const resetOrder = () => setSelectedStepId(null);

  const markNowDone = () => {
    if (!nowStep) return;
    onToggleStep(nowStep.id);
    // Reset selection so the natural next incomplete step automatically becomes "Now"
    setSelectedStepId(null);
  };

  const toggleSubSteps = () => setShowSubSteps((prev) => !prev);
  const expandSubSteps = () => setShowSubSteps(true);
  const toggleCompleted = () => setShowCompleted((prev) => !prev);

  return {
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
  };
}
