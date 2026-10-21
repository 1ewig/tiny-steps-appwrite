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
    <div className="flex items-start gap-3 chat-enter">
      {/* AI Avatar */}
      <div className="w-8 h-8 rounded-xl bg-accent-subtle text-accent-text flex items-center justify-center shrink-0 text-sm mt-0.5">
        🌱
      </div>

      {/* Dialogue & Embedded Steps Card */}
      <div className="flex-1 bg-surface border border-border-subtle rounded-2xl rounded-tl-xs p-4 sm:p-5 shadow-subtle">
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
    </div>
  );
}
