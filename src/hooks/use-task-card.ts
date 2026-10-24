'use client';

import { useState } from 'react';
import type { Step } from '@/types/task';

interface UseTaskCardOptions {
  steps: Step[];
  onToggleStep: (stepId: number) => void;
}

export function useTaskCard({ steps, onToggleStep }: UseTaskCardOptions) {
  const [selectedStepId, setSelectedStepId] = useState<number | null>(null);
  const [showSubSteps, setShowSubSteps] = useState(true);
  const [showCompleted, setShowCompleted] = useState(false);

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
  const laterSteps = incompleteSteps.filter((s) => s.id !== nowStep?.id).slice(3);

  const nowStepIndex = nowStep ? steps.findIndex((s) => s.id === nowStep.id) : -1;

  const selectStep = (stepId: number) => setSelectedStepId(stepId);

  const markNowDone = () => {
    if (!nowStep) return;
    onToggleStep(nowStep.id);
    // Auto-advance to the next incomplete step
    const nextInLine = incompleteSteps.find((s) => s.id !== nowStep.id);
    setSelectedStepId(nextInLine ? nextInLine.id : null);
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
    showSubSteps,
    showCompleted,
    selectStep,
    markNowDone,
    toggleSubSteps,
    expandSubSteps,
    toggleCompleted,
  };
}
