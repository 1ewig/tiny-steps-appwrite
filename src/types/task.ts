export type EnergyLevel = 1 | 2 | 3;
export type GranularityLevel = EnergyLevel; // Backward-compatibility alias

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  isAnonymous?: boolean;
}

export interface Step {
  id: number;
  text: string;
  title?: string;
  instruction?: string;
  effort?: string;
  hint?: string;
  completed: boolean;
  completedAt?: number;
  canSplit: boolean;
  subSteps?: Step[];
}

export interface Task {
  id: string;
  title: string;
  prompt: string;
  guidance: string;
  energyLevel: EnergyLevel;
  createdAt: number;
  updatedAt: number;
  steps: Step[];
  introSeen?: boolean;
  userId?: string | null;
}

export interface BreakdownResult {
  acknowledgment: string;
  dialogue?: string;
  title: string;
  steps: Step[];
  isRefused?: boolean;
  refusalCategory?: string;
  refusalReason?: string;
}

export type AssistantIntent =
  | {
      type: 'complete_step';
      targetStepId: number;
      acknowledgment: string;
      dialogue?: string;
    }
  | {
      type: 'modify_step';
      targetStepId: number;
      targetSubStepId?: number;
      title: string;
      instruction?: string;
      acknowledgment: string;
      dialogue?: string;
    }
  | {
      type: 'modify_substep';
      targetStepId: number;
      targetSubStepId: number;
      title: string;
      instruction?: string;
      acknowledgment: string;
      dialogue?: string;
    }
  | {
      type: 'reroute_constraint';
      targetStepId: number;
      targetSubStepId?: number;
      title: string;
      instruction?: string;
      acknowledgment: string;
      dialogue?: string;
    }
  | {
      type: 'remove_step';
      targetStepId: number;
      targetSubStepId?: number;
      acknowledgment: string;
      dialogue?: string;
    }
  | {
      type: 'insert_step';
      afterStepId?: number;
      title: string;
      instruction?: string;
      acknowledgment: string;
      dialogue?: string;
    }
  | {
      type: 'shrink_step';
      targetStepIndex: number;
      microSteps: Step[];
      acknowledgment: string;
      dialogue?: string;
    }
  | {
      type: 'all_complete';
      acknowledgment: string;
      dialogue?: string;
    }
  | {
      type: 'new_task';
      title: string;
      acknowledgment: string;
      dialogue?: string;
      steps: Step[];
    }
  | {
      type: 'tweak_steps';
      title?: string;
      acknowledgment: string;
      dialogue?: string;
      steps: Step[];
    }
  | {
      type: 'encouragement';
      acknowledgment: string;
      dialogue?: string;
    }
  | {
      type: 'off_topic';
      acknowledgment: string;
      dialogue?: string;
    }
  | {
      type: 'crisis';
      acknowledgment: string;
      dialogue?: string;
    };

export interface TaskState {
  // State
  tasks: Task[];
  granularity: EnergyLevel;
  peekFuture: boolean;
  focusTunnelTaskId: string | null;
  isGeneratingTask: boolean;
  generationNotice: string | null;
  isHistoryOpen: boolean;
  theme: 'light' | 'dark';

  // Auth & Sync State
  user: AuthUser | null;
  isAuthLoading: boolean;
  isSyncing: boolean;
  lastSyncedAt: number | null;
  setUser: (user: AuthUser | null) => void;
  setAuthLoading: (loading: boolean) => void;
  setIsSyncing: (isSyncing: boolean) => void;
  setLastSyncedAt: (timestamp: number | null) => void;
  setTasks: (tasks: Task[]) => void;

  // Task Actions
  createTask: (params: {
    title?: string;
    prompt: string;
    guidance?: string;
    steps?: Step[];
    energyLevel?: EnergyLevel;
  }) => string;
  setTaskTitle: (taskId: string, title: string) => void;
  updateTask: (
    taskId: string,
    updates: { title?: string; guidance?: string; steps?: Step[] }
  ) => void;
  deleteTask: (taskId: string) => void;
  markIntroSeen: (taskId: string) => void;
  setGranularity: (level: EnergyLevel) => void;
  togglePeek: () => void;
  openFocusTunnel: (taskId: string) => void;
  closeFocusTunnel: () => void;
  setGeneratingTask: (isGenerating: boolean) => void;
  setGenerationNotice: (notice: string | null) => void;
  openHistory: () => void;
  closeHistory: () => void;
  toggleHistory: () => void;
  toggleTheme: () => void;

  // Step Actions (Clean 2-level addressing: taskId + stepId)
  toggleStepCompletion: (taskId: string, stepId: number) => void;
  toggleSubStepCompletion: (
    taskId: string,
    parentStepId: number,
    subStepId: number
  ) => void;
  shrinkStep: (taskId: string, stepIndex: number, subSteps: Step[]) => void;
  modifyStep: (
    taskId: string,
    stepId: number,
    updates: { title?: string; instruction?: string; text?: string }
  ) => void;
  modifySubStep: (
    taskId: string,
    parentStepId: number,
    subStepId: number,
    updates: { title?: string; instruction?: string; text?: string }
  ) => void;
  removeStep: (taskId: string, stepId: number) => void;
  removeSubStep: (taskId: string, parentStepId: number, subStepId: number) => void;
  insertStep: (
    taskId: string,
    afterStepId: number | null,
    step: { title: string; instruction?: string }
  ) => void;
  applyAssistantIntent: (taskId: string, intent: AssistantIntent) => void;
}
