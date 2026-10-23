'use client';

import type { ComponentType } from 'react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import type { IconProps } from '@phosphor-icons/react';
import { Plant, Leaf, PottedPlant } from '@phosphor-icons/react';
import type { GranularityLevel } from '@/types/task';
import {
  tactileButtonVariants,
  tactileIconVariants,
  fadeInScaleVariants,
} from '@/constants/animation';

interface AppHeaderProps {
  sessionTitle: string;
  hasActiveSteps: boolean;
  granularity: GranularityLevel;
  onOpenFocusTunnel?: () => void;
  onSelectGranularity?: (level: GranularityLevel) => void;
  onToggleSidebar?: () => void;
  showNewTaskButton?: boolean;
  onNewTask?: () => void;
}

interface GranularityItem {
  icon: ComponentType<IconProps>;
  label: string;
  desc: string;
}

const GRANULARITY_CONFIG: Record<GranularityLevel, GranularityItem> = {
  1: { icon: Plant, label: 'A little stuck', desc: 'Clear, manageable ~2-5 min chunks' },
  2: { icon: Leaf, label: 'Overwhelmed', desc: 'Small, gentle ~1 min pieces with calm tone' },
  3: { icon: PottedPlant, label: 'Full paralysis', desc: 'Absurdly tiny 5-30 sec zero-guilt micro-actions' },
};

export function AppHeader({
  sessionTitle,
  hasActiveSteps,
  granularity,
  onOpenFocusTunnel,
  onSelectGranularity,
  onToggleSidebar,
  showNewTaskButton = false,
  onNewTask,
}: AppHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();

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
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Mobile Sidebar Hamburger Toggle */}
        {onToggleSidebar && (
          <motion.button
            onClick={onToggleSidebar}
            variants={reduceMotion ? undefined : tactileButtonVariants}
            initial="rest"
            animate="rest"
            whileHover={reduceMotion ? undefined : 'hover'}
            whileTap={reduceMotion ? undefined : 'tap'}
            className="lg:hidden p-1.5 -ml-1 rounded-md text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-colors duration-fast"
            aria-label="Open task history sidebar"
            title="Open task history"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </motion.button>
        )}

        {/* Current Title */}
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs sm:text-sm font-semibold text-text-primary max-w-[150px] sm:max-w-xs md:max-w-md truncate">
            {sessionTitle || 'New gentle task'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Optional New Task Button */}
        {showNewTaskButton && onNewTask && (
          <motion.button
            onClick={onNewTask}
            variants={reduceMotion ? undefined : tactileButtonVariants}
            initial="rest"
            animate="rest"
            whileHover={reduceMotion ? undefined : 'hover'}
            whileTap={reduceMotion ? undefined : 'tap'}
            className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-colors duration-fast"
            title="Start another gentle task"
          >
            <motion.span
              variants={reduceMotion ? undefined : tactileIconVariants}
              className="text-accent font-bold"
            >
              +
            </motion.span>
            <span>New task</span>
          </motion.button>
        )}

        {/* Focus Tunnel Launcher Button */}
        {hasActiveSteps && onOpenFocusTunnel && (
          <motion.button
            onClick={onOpenFocusTunnel}
            variants={reduceMotion ? undefined : tactileButtonVariants}
            initial="rest"
            animate="rest"
            whileHover={reduceMotion ? undefined : 'hover'}
            whileTap={reduceMotion ? undefined : 'tap'}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-accent hover:bg-accent-hover text-text-inverse shadow-subtle transition-colors duration-fast"
            title="Open distraction-free Focus Tunnel"
          >
            <motion.span variants={reduceMotion ? undefined : tactileIconVariants}>
              ◎
            </motion.span>
            <span>Focus Tunnel</span>
          </motion.button>
        )}

        {/* Sensitivity Dropdown */}
        {onSelectGranularity && (
          <div className="relative" ref={dropdownRef}>
            <motion.button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              variants={reduceMotion ? undefined : tactileButtonVariants}
              initial="rest"
              animate="rest"
              whileHover={reduceMotion ? undefined : 'hover'}
              whileTap={reduceMotion ? undefined : 'tap'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-surface-subtle hover:bg-surface-subtle/80 text-text-primary border border-border-subtle transition-colors duration-fast"
              aria-expanded={dropdownOpen}
              title="Select overwhelm sensitivity level"
            >
              {(() => {
                const CurrentIcon = currentGran.icon;
                return (
                  <motion.span
                    variants={reduceMotion ? undefined : tactileIconVariants}
                    className="shrink-0 flex items-center"
                  >
                    <CurrentIcon size={14} weight="fill" className="text-accent" />
                  </motion.span>
                );
              })()}
              <span className="hidden sm:inline">{currentGran.label}</span>
              <svg
                className={`w-3 h-3 text-text-tertiary transition-transform duration-fast ${dropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </motion.button>

            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  variants={reduceMotion ? undefined : fadeInScaleVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="absolute right-0 mt-1.5 w-64 rounded-xl bg-surface-elevated border border-border-subtle shadow-modal p-1.5 z-modal text-xs"
                >
                  {([1, 2, 3] as GranularityLevel[]).map((lvl) => {
                    const conf = GRANULARITY_CONFIG[lvl];
                    const ConfIcon = conf.icon;
                    const isSelected = lvl === granularity;
                    return (
                      <motion.button
                        key={lvl}
                        onClick={() => {
                          onSelectGranularity(lvl);
                          setDropdownOpen(false);
                        }}
                        whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                        className={`w-full text-left p-2.5 rounded-lg flex items-start gap-2.5 transition-colors duration-fast ${
                          isSelected
                            ? 'bg-accent-subtle text-accent-text font-semibold'
                            : 'hover:bg-surface-subtle text-text-primary'
                        }`}
                      >
                        <ConfIcon
                          size={16}
                          weight={isSelected ? 'fill' : 'regular'}
                          className={`mt-0.5 shrink-0 ${isSelected ? 'text-accent' : 'text-text-tertiary'}`}
                        />
                        <div>
                          <p className="font-semibold">{conf.label}</p>
                          <p className="text-2xs text-text-secondary leading-snug">{conf.desc}</p>
                        </div>
                      </motion.button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>
    </header>
  );
}
