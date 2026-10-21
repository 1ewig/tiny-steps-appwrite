'use client';

import {
  decomposeTask,
  generateMicroSteps,
  interpretUserIntent,
  type BreakdownResult,
  type AssistantIntent,
} from '@/lib/assistant-engine';

export { decomposeTask, generateMicroSteps, interpretUserIntent };
export type { BreakdownResult, AssistantIntent };

export function useOfflineAssistant() {
  return {
    decomposeTask,
    generateMicroSteps,
    interpretUserIntent,
  };
}
