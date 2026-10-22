'use client';

import type { ChatSession } from '@/types/task';
import { Plant, CheckCircle, ChatText } from '@phosphor-icons/react';

interface SidebarProps {
  isOpen: boolean;
  sessions: ChatSession[];
  currentSessionId: string | null;
  theme: 'light' | 'dark';
  onClose: () => void;
  onNewSession: () => void;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onToggleTheme: () => void;
}

export function Sidebar({
  isOpen,
  sessions,
  currentSessionId,
  theme,
  onClose,
  onNewSession,
  onSelectSession,
  onDeleteSession,
  onToggleTheme,
}: SidebarProps) {
  const isNewTaskActive = !currentSessionId;
  const validSessions = sessions.filter((s) => s.messages && s.messages.length > 0);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-stone-900/40 backdrop-blur-xs z-backdrop lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-sidebar w-72 bg-canvas-subtle border-r border-border-subtle flex flex-col justify-between transition-transform duration-300 ease-calm shadow-card lg:shadow-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top: Logo & New Session */}
        <div className="p-4 space-y-3 border-b border-border-subtle">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-accent-subtle text-accent-text flex items-center justify-center font-bold text-sm">
                <Plant size={18} weight="duotone" className="text-accent" />
              </div>
              <div>
                <span className="font-bold text-sm tracking-tight text-text-primary block leading-none">
                  tiny steps
                </span>
                <span className="text-2xs text-text-tertiary font-medium">calm AI companion</span>
              </div>
            </div>

            {/* Close button for mobile */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-md text-text-secondary hover:text-text-primary"
              aria-label="Close sidebar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* New Task Button */}
          <button
            onClick={() => {
              onNewSession();
              onClose();
            }}
            className={`w-full py-2.5 px-3.5 rounded-lg text-xs font-semibold flex items-center justify-between border transition-all ${
              isNewTaskActive
                ? 'bg-accent-subtle text-accent-text border-accent/40 shadow-subtle'
                : 'bg-surface hover:bg-surface-subtle text-text-primary border-border-subtle shadow-subtle group'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg
                className={`w-3.5 h-3.5 ${isNewTaskActive ? 'text-accent-text' : 'text-accent group-hover:rotate-90'} transition-transform`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              <span>New gentle task</span>
            </span>
            <kbd className={`hidden sm:inline-block px-1.5 py-0.5 text-2xs font-mono rounded border ${
              isNewTaskActive
                ? 'bg-accent-subtle text-accent-text border-accent/30'
                : 'bg-canvas-subtle text-text-tertiary border-border-subtle'
            }`}>
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Middle: Saved Sessions */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {validSessions.length === 0 ? (
            <div className="p-4 text-center text-xs text-text-tertiary">No saved tasks yet.</div>
          ) : (
            validSessions.map((sess) => {
              const isCurrent = Boolean(currentSessionId && sess.id === currentSessionId);
              const hasSteps = sess.messages.some((m) => m.steps && m.steps.length > 0);

              return (
                <div
                  key={sess.id}
                  onClick={() => {
                    onSelectSession(sess.id);
                    onClose();
                  }}
                  className={`group flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-all ${
                    isCurrent
                      ? 'bg-accent-subtle text-accent-text font-semibold border border-accent/20'
                      : 'text-text-secondary hover:bg-surface-subtle hover:text-text-primary'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {hasSteps ? (
                      <CheckCircle size={14} weight="regular" className="text-accent shrink-0" />
                    ) : (
                      <ChatText size={14} weight="regular" className="text-text-tertiary shrink-0" />
                    )}
                    <span className="truncate">{sess.title}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteSession(sess.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-danger-subtle text-text-tertiary hover:text-danger-text transition-opacity"
                    title="Delete session"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom: Theme Toggle */}
        <div className="p-3 border-t border-border-subtle bg-canvas/40">
          <button
            onClick={onToggleTheme}
            className="w-full flex items-center justify-between text-xs text-text-secondary hover:text-text-primary p-2 rounded-md hover:bg-surface-subtle transition-all"
            title="Toggle sensory light/dim mode"
          >
            <span className="flex items-center gap-2">
              {theme === 'dark' ? (
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
              <span className="font-medium">{theme === 'dark' ? 'Light mode' : 'Dim mode'}</span>
            </span>
            <span className="text-2xs text-text-tertiary">
              {theme === 'dark' ? 'Sensory light' : 'Sensory dim'}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
