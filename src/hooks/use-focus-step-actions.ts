'use client';

import { useCallback } from 'react';
import { useTaskStore } from '@/store/task-store';
import { shrinkStepWithAI } from '@/lib/ai/client';
import type { Task, Step } from '@/types/task';

export function useFocusStepActions() {
  const shrinkStep = useTaskStore((s) => s.shrinkStep);
  const toggleStepCompletion = useTaskStore((s) => s.toggleStepCompletion);
  const toggleSubStepCompletion = useTaskStore((s) => s.toggleSubStepCompletion);

  const completeStepOrSubStep = useCallback(
    (task: Task, step: Step) => {
      const subSteps = step.subSteps ?? [];
      const incompleteSubSteps = subSteps.filter((s) => !s.completed);

      if (incompleteSubSteps.length > 0) {
        const currentSubStep = incompleteSubSteps[0];
        const isLast = incompleteSubSteps.length === 1;
        toggleSubStepCompletion(task.id, step.id, currentSubStep.id);
        if (isLast) {
          toggleStepCompletion(task.id, step.id);
        }
      } else {
        toggleStepCompletion(task.id, step.id);
      }
    },
    [toggleStepCompletion, toggleSubStepCompletion]
  );

  const completeWholeStep = useCallback(
    (taskId: string, stepId: number) => {
      toggleStepCompletion(taskId, stepId);
    },
    [toggleStepCompletion]
  );

  const shrinkStepAction = useCallback(
    async (
      taskTitle: string,
      taskId: string,
      stepIndex: number,
      steps: Step[],
      onError?: (err: unknown) => void
    ) => {
      try {
        const { microSteps } = await shrinkStepWithAI(taskTitle, steps, stepIndex);
        shrinkStep(taskId, stepIndex, microSteps);
        return true;
      } catch (err) {
        onError?.(err);
        return false;
      }
    },
    [shrinkStep]
  );

  return {
    completeStepOrSubStep,
    completeWholeStep,
    shrinkStepAction,
  };
}
