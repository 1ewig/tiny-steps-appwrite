'use client';

import { useState, useRef, useEffect } from 'react';
import type { GranularityLevel } from '@/types/task';

interface AppHeaderProps {
  sessionTitle: string;
  hasActiveSteps: boolean;
  granularity: GranularityLevel;
  onToggleSidebar: () => void;
  onOpenFocusTunnel: () => void;
  onSelectGranularity: (level: GranularityLevel) => void;
}

const GRANULARITY_CONFIG = {
  1: { icon: '🌱', label: 'A little stuck', desc: 'Clear, manageable ~2-5 min chunks' },
  2: { icon: '🌿', label: 'Overwhelmed', desc: 'Small, gentle ~1 min pieces with calm tone' },
  3: { icon: '🪴', label: 'Full paralysis', desc: 'Absurdly tiny 5-30 sec zero-guilt micro-actions' },
};

export function AppHeader({
  sessionTitle,
  hasActiveSteps,
  granularity,
  onToggleSidebar,
  onOpenFocusTunnel,
  onSelectGranularity,
}: AppHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const currentGran = GRANULARITY_CONFIG[granularity];

  return (
    <header className="h-14 border-b border-border-subtle px-4 sm:px-6 flex items-center justify-between shrink-0 bg-canvas/80 backdrop-blur-md z-header">
      <div className="flex items-center gap-3">
        {/* Sidebar Toggle */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-all"
          aria-label="Toggle chat sidebar"
          title="Toggle sidebar"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        {/* Current Title & Badge */}
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-semibold text-text-primary max-w-[180px] sm:max-w-xs md:max-w-md truncate">
            {sessionTitle || 'New session'}
          </span>
          {hasActiveSteps && (
            <span className="text-2xs px-2 py-0.5 rounded-full bg-accent-subtle text-accent-text font-medium">
              in progress
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Focus Tunnel Launcher Button */}
        {hasActiveSteps && (
          <button
            onClick={onOpenFocusTunnel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-accent hover:bg-accent-hover text-text-inverse shadow-subtle transition-all active:scale-95"
            title="Open distraction-free Focus Tunnel"
          >
            <span>◎</span>
            <span>Focus Tunnel</span>
          </button>
        )}

        {/* Sensitivity Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-surface-subtle hover:bg-surface-subtle/80 text-text-primary border border-border-subtle transition-all"
            aria-expanded={dropdownOpen}
            title="Select overwhelm sensitivity level"
          >
            <span>{currentGran.icon}</span>
            <span className="hidden sm:inline">{currentGran.label}</span>
            <svg
              className={`w-3 h-3 text-text-tertiary transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-64 rounded-xl bg-surface-elevated border border-border-subtle shadow-modal p-1.5 z-modal text-xs chat-enter">
              {([1, 2, 3] as GranularityLevel[]).map((lvl) => {
                const conf = GRANULARITY_CONFIG[lvl];
                const isSelected = lvl === granularity;
                return (
                  <button
                    key={lvl}
                    onClick={() => {
                      onSelectGranularity(lvl);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg flex items-start gap-2.5 transition-all ${
                      isSelected
                        ? 'bg-accent-subtle text-accent-text font-semibold'
                        : 'hover:bg-surface-subtle text-text-primary'
                    }`}
                  >
                    <span className="text-base">{conf.icon}</span>
                    <div>
                      <p className="font-semibold">{conf.label}</p>
                      <p className="text-2xs text-text-secondary leading-snug">{conf.desc}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
