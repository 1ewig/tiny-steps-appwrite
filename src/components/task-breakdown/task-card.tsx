'use client';

import type { Step } from '@/types/task';
import { StepsChecklist } from './steps-checklist';

interface TaskCardProps {
  guidanceText?: string;
  steps: Step[];
  isAdjusting?: boolean;
  onToggleStep: (stepId: number) => void;
  onShrinkStep: (stepIndex: number) => void;
}

export function TaskCard({
  guidanceText,
  steps,
  isAdjusting = false,
  onToggleStep,
  onShrinkStep,
}: TaskCardProps) {
  return (
    <article className="w-full bg-surface border border-border-subtle rounded-2xl p-4 sm:p-6 shadow-subtle chat-enter transition-opacity duration-fast">
      {guidanceText && (
        <div className="text-sm sm:text-base text-text-primary leading-relaxed whitespace-pre-wrap">
          {guidanceText}
        </div>
      )}

      {isAdjusting && (
        <div className="flex items-center gap-2 pt-3 text-xs text-text-tertiary">
          <span className="w-1.5 h-1.5 rounded-full bg-accent dot-1" />
          <span className="w-1.5 h-1.5 rounded-full bg-accent dot-2" />
          <span className="w-1.5 h-1.5 rounded-full bg-accent dot-3" />
          <span>Adjusting your steps...</span>
        </div>
      )}

      {steps.length > 0 && (
        <StepsChecklist
          steps={steps}
          onToggleStep={onToggleStep}
          onShrinkStep={onShrinkStep}
        />
      )}
    </article>
  );
}
