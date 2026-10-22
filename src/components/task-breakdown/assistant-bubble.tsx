import type { ChatMessage } from '@/types/task';
import { StepsChecklist } from './steps-checklist';

interface AssistantBubbleProps {
  message: ChatMessage;
  onToggleStep: (stepId: number) => void;
  onShrinkStep: (stepIndex: number) => void;
  onSkipStep: (stepIndex: number) => void;
  onOpenFocusTunnel: () => void;
}

export function AssistantBubble({
  message,
  onToggleStep,
  onShrinkStep,
  onSkipStep,
  onOpenFocusTunnel,
}: AssistantBubbleProps) {
  return (
    <div className="w-full bg-surface border border-border-subtle rounded-2xl p-4 sm:p-6 shadow-subtle chat-enter">
      <div className="text-sm sm:text-base text-text-primary leading-relaxed whitespace-pre-wrap">
        {message.text}
      </div>

      {message.steps && message.steps.length > 0 && (
        <StepsChecklist
          steps={message.steps}
          onToggleStep={onToggleStep}
          onShrinkStep={onShrinkStep}
          onSkipStep={onSkipStep}
          onOpenFocusTunnel={onOpenFocusTunnel}
        />
      )}
    </div>
  );
}
