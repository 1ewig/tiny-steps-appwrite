export type GranularityLevel = 1 | 2 | 3;

export interface Step {
  id: number;
  text: string;
  effort?: string;
  hint?: string;
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
  granularity: GranularityLevel;
  peekFuture: boolean;
  focusTunnelSessionId: string | null;
  isGeneratingTask: boolean;
  isHistoryOpen: boolean;
  theme: 'light' | 'dark';

  // Actions
  createNewSession: (title?: string) => string;
  setSessionTitle: (sessionId: string, title: string) => void;
  deleteSession: (sessionId: string) => void;
  setGranularity: (level: GranularityLevel) => void;
  togglePeek: () => void;
  openFocusTunnel: (sessionId: string) => void;
  closeFocusTunnel: () => void;
  setGeneratingTask: (isGenerating: boolean) => void;
  openHistory: () => void;
  closeHistory: () => void;
  toggleHistory: () => void;
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
}
