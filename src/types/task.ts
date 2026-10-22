export type GranularityLevel = 1 | 2 | 3;

export interface Step {
  id: number;
  text: string;
  effort?: string;
  completed: boolean;
  canSplit: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: number;
  steps?: Step[];
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: number;
  messages: ChatMessage[];
}

export interface TaskState {
  // State
  sessions: ChatSession[];
  currentSessionId: string | null;
  granularity: GranularityLevel;
  peekFuture: boolean;
  focusTunnelOpen: boolean;
  theme: 'light' | 'dark';

  // Actions
  createNewSession: (switchImmediately?: boolean) => string;
  switchSession: (sessionId: string | null) => void;
  deleteSession: (sessionId: string) => void;
  clearAllSessions: () => void;
  setGranularity: (level: GranularityLevel) => void;
  togglePeek: () => void;
  setFocusTunnel: (open: boolean) => void;
  toggleTheme: () => void;

  // Chat & Step Actions
  addMessage: (sessionId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  updateAssistantMessage: (
    sessionId: string,
    messageId: string,
    updates: { text?: string; steps?: Step[] }
  ) => void;
  toggleStepCompletion: (sessionId: string, messageId: string, stepId: number) => void;
  shrinkStep: (sessionId: string, messageId: string, stepIndex: number, subSteps?: Step[]) => void;
  skipStep: (sessionId: string, messageId: string, stepIndex: number) => void;
}
