export type EnergyLevel = 1 | 2 | 3;
export type GranularityLevel = EnergyLevel; // Backward-compatibility alias

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

export type MicroStep = Step;

export interface Task {
  id: string;
  title: string;
  prompt: string;
  guidance: string;
  energyLevel: EnergyLevel;
  createdAt: number;
  updatedAt: number;
  steps: Step[];
}

// Backward-compatibility aliases during transition
export type ChatSession = Task;

export interface TaskState {
  // State
  tasks: Task[];
  granularity: EnergyLevel;
  peekFuture: boolean;
  focusTunnelTaskId: string | null;
  isGeneratingTask: boolean;
  isHistoryOpen: boolean;
  theme: 'light' | 'dark';

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
  setGranularity: (level: EnergyLevel) => void;
  togglePeek: () => void;
  openFocusTunnel: (taskId: string) => void;
  closeFocusTunnel: () => void;
  setGeneratingTask: (isGenerating: boolean) => void;
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
  shrinkStep: (taskId: string, stepIndex: number, subSteps?: Step[]) => void;

  // Compatibility aliases
  sessions?: Task[];
  focusTunnelSessionId?: string | null;
  deleteSession?: (sessionId: string) => void;
}
