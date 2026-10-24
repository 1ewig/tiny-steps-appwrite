import { useEffect } from 'react';

interface ShortcutOptions {
  onNewSession?: () => void;
  onCompleteFocusStep?: () => void;
  onShrinkFocusStep?: () => void;
  isFocusTunnelActive?: boolean;
  onToggleHistory?: () => void;
  onCloseHistory?: () => void;
  isHistoryOpen?: boolean;
}

export function useKeyboardShortcuts({
  onNewSession,
  onCompleteFocusStep,
  onShrinkFocusStep,
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

      // Focus Tunnel Mode shortcuts
      if (isFocusTunnelActive) {
        const target = e.target as HTMLElement | null;
        const isInputField =
          target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA';
        const isButtonOrInteractive =
          isInputField ||
          target?.tagName === 'BUTTON' ||
          Boolean(target?.closest('button'));

        // Space or Enter: Advance/Complete
        if (!isButtonOrInteractive && (e.code === 'Space' || e.code === 'Enter')) {
          e.preventDefault();
          onCompleteFocusStep?.();
          return;
        }

        // S: Shrink current step if not typing in an input
        if (
          !isInputField &&
          (e.key === 's' || e.key === 'S') &&
          !e.ctrlKey &&
          !e.metaKey &&
          !e.altKey
        ) {
          e.preventDefault();
          onShrinkFocusStep?.();
          return;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    onNewSession,
    onCompleteFocusStep,
    onShrinkFocusStep,
    isFocusTunnelActive,
    onToggleHistory,
    onCloseHistory,
    isHistoryOpen,
  ]);
}
