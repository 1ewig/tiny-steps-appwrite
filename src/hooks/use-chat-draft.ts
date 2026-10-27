'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  readChatDraft,
  removeChatDraft,
  writeChatDraft,
} from '@/lib/chat-drafts';

const WRITE_DEBOUNCE_MS = 250;

interface UseChatDraftOptions {
  storageKey?: string;
  initialText?: string;
}

interface UseChatDraftReturn {
  text: string;
  setText: (value: string) => void;
  clearDraft: () => void;
  preserveForSubmit: (submittedText: string) => void;
  releaseSubmit: () => void;
}

/**
 * Keeps the chat textarea draft in localStorage so a refresh does not lose
 * unsent words. When no `storageKey` is provided it behaves like local state.
 */
export function useChatDraft({
  storageKey,
  initialText = '',
}: UseChatDraftOptions): UseChatDraftReturn {
  const [text, setTextState] = useState(() => {
    if (initialText) return initialText;
    return storageKey ? readChatDraft(storageKey) : '';
  });

  const textRef = useRef(text);
  const pendingSubmitRef = useRef<string | null>(null);

  const setText = useCallback((value: string) => {
    textRef.current = value;
    setTextState(value);
  }, []);

  // Debounced persistence while typing. Empty text removes the draft unless a
  // submit is in flight (the sent text must survive a refresh mid-generation).
  useEffect(() => {
    if (!storageKey) return;
    if (!text.trim()) {
      if (pendingSubmitRef.current === null) {
        removeChatDraft(storageKey);
      }
      return;
    }

    const timer = setTimeout(() => {
      writeChatDraft(storageKey, text);
    }, WRITE_DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [text, storageKey]);

  // Flush the latest draft when the page is hidden or refreshed before the
  // debounce has fired.
  useEffect(() => {
    if (!storageKey) return;

    const flush = () => {
      writeChatDraft(
        storageKey,
        pendingSubmitRef.current ?? textRef.current
      );
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') flush();
    };

    window.addEventListener('pagehide', flush);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('pagehide', flush);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [storageKey]);

  // Flush pending typing when the component unmounts for in-app navigation.
  // A submit in flight owns its own draft lifecycle, so it is skipped here.
  useEffect(() => {
    if (!storageKey) return;
    return () => {
      if (pendingSubmitRef.current !== null) return;
      writeChatDraft(storageKey, textRef.current);
    };
  }, [storageKey]);

  const preserveForSubmit = useCallback(
    (submittedText: string) => {
      pendingSubmitRef.current = submittedText;
      textRef.current = submittedText;
      if (storageKey) writeChatDraft(storageKey, submittedText);
    },
    [storageKey]
  );

  const releaseSubmit = useCallback(() => {
    pendingSubmitRef.current = null;
  }, []);

  const clearDraft = useCallback(() => {
    pendingSubmitRef.current = null;
    if (storageKey) removeChatDraft(storageKey);
  }, [storageKey]);

  return {
    text,
    setText,
    clearDraft,
    preserveForSubmit,
    releaseSubmit,
  };
}
