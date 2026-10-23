import { useEffect } from 'react';

interface ShortcutOptions {
  onNewSession?: () => void;
  onCompleteFocusStep?: () => void;
  isFocusTunnelActive?: boolean;
  onToggleHistory?: () => void;
  onCloseHistory?: () => void;
  isHistoryOpen?: boolean;
}

export function useKeyboardShortcuts({
  onNewSession,
  onCompleteFocusStep,
  isFocusTunnelActive,
  onToggleHistory,
  onCloseHistory,
  isHistoryOpen,
}: ShortcutOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K: New Session
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onNewSession?.();
        return;
      }

      // Ctrl+H or Cmd+H: Toggle Task History
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        onToggleHistory?.();
        return;
      }

      // Escape: Close History Drawer if open
      if (e.key === 'Escape' && isHistoryOpen) {
        e.preventDefault();
        onCloseHistory?.();
        return;
      }

      // Space or Enter in Focus Tunnel Mode
      if (isFocusTunnelActive) {
        const target = e.target as HTMLElement | null;
        const isInput = target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA';
        if (!isInput && (e.code === 'Space' || e.code === 'Enter')) {
          e.preventDefault();
          onCompleteFocusStep?.();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    onNewSession,
    onCompleteFocusStep,
    isFocusTunnelActive,
    onToggleHistory,
    onCloseHistory,
    isHistoryOpen,
  ]);
}
