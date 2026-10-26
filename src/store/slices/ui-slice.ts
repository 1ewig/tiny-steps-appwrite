import type { StateCreator } from 'zustand';
import type { TaskState, EnergyLevel } from '@/types/task';

export interface UISlice {
  granularity: EnergyLevel;
  peekFuture: boolean;
  focusTunnelTaskId: string | null;
  isGeneratingTask: boolean;
  generationNotice: string | null;
  isHistoryOpen: boolean;
  theme: 'light' | 'dark';
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
}

export const createUISlice: StateCreator<TaskState, [], [], UISlice> = (set) => ({
  granularity: 2,
  peekFuture: false,
  focusTunnelTaskId: null,
  isGeneratingTask: false,
  generationNotice: null,
  isHistoryOpen: false,
  theme: 'light',
  setGranularity: (level: EnergyLevel) => set({ granularity: level }),
  togglePeek: () => set((state) => ({ peekFuture: !state.peekFuture })),
  openFocusTunnel: (taskId: string) => set({ focusTunnelTaskId: taskId }),
  closeFocusTunnel: () => set({ focusTunnelTaskId: null }),
  setGeneratingTask: (isGenerating: boolean) => set({ isGeneratingTask: isGenerating }),
  setGenerationNotice: (notice: string | null) => set({ generationNotice: notice }),
  openHistory: () => set({ isHistoryOpen: true }),
  closeHistory: () => set({ isHistoryOpen: false }),
  toggleHistory: () => set((state) => ({ isHistoryOpen: !state.isHistoryOpen })),
  toggleTheme: () =>
    set((state) => ({
      theme: state.theme === 'light' ? 'dark' : 'light',
    })),
});
