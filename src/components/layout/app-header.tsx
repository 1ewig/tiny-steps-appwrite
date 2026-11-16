'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { House, ClockCounterClockwise, Question, Eye, EyeSlash } from '@phosphor-icons/react';
import { AuthButton } from '@/components/shared/auth-button';
import {
  tactileButtonVariants,
  tactileIconVariants,
} from '@/constants/animation';

interface AppHeaderProps {
  hasActiveSteps: boolean;
  isPeekEnabled?: boolean;
  onTogglePeek?: () => void;
  onToggleHistory?: () => void;
  showHomeButton?: boolean;
  onHome?: () => void;
  hasBorder?: boolean;
  onOpenOnboarding?: () => void;
}

export function AppHeader({
  hasActiveSteps,
  isPeekEnabled = false,
  onTogglePeek,
  onToggleHistory,
  showHomeButton = false,
  onHome,
  onOpenOnboarding,
  hasBorder = true,
}: AppHeaderProps) {
  const reduceMotion = useReducedMotion();

  return (
    <header
      className={`h-14 px-4 sm:px-6 flex items-center justify-between shrink-0 z-header transition-colors duration-fast ${
        hasBorder
          ? 'border-b border-border-subtle bg-canvas/80 backdrop-blur-md'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Home Button (Far Left) */}
        {showHomeButton && onHome && (
          <motion.button
            onClick={onHome}
            variants={reduceMotion ? undefined : tactileButtonVariants}
            initial="rest"
            animate="rest"
            whileHover={reduceMotion ? undefined : 'hover'}
            whileTap={reduceMotion ? undefined : 'tap'}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium text-text-secondary hover:text-text-primary bg-surface-subtle/70 hover:bg-surface-subtle transition-colors duration-fast cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            title="Return home"
          >
            <motion.span
              variants={reduceMotion ? undefined : tactileIconVariants}
              className="shrink-0 flex items-center"
            >
              <House size={15} weight="regular" className="text-accent" />
            </motion.span>
            <span className="hidden sm:inline">Home</span>
          </motion.button>
        )}
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Future Steps Blur / Peek Toggle Button */}
        {hasActiveSteps && onTogglePeek && (
          <motion.button
            type="button"
            onClick={onTogglePeek}
            variants={reduceMotion ? undefined : tactileButtonVariants}
            initial="rest"
            animate="rest"
            whileHover={reduceMotion ? undefined : 'hover'}
            whileTap={reduceMotion ? undefined : 'tap'}
            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-medium text-text-secondary hover:text-text-primary bg-surface-subtle/70 hover:bg-surface-subtle transition-colors duration-fast cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            title={
              isPeekEnabled
                ? 'Future steps unblurred (click to blur)'
                : 'Future steps blurred (click to unblur)'
            }
            aria-label={isPeekEnabled ? 'Blur future steps' : 'Unblur future steps'}
          >
            <motion.span
              variants={reduceMotion ? undefined : tactileIconVariants}
              className="shrink-0 flex items-center"
            >
              {isPeekEnabled ? (
                <Eye size={15} weight="bold" className="text-accent" />
              ) : (
                <EyeSlash size={15} weight="regular" className="text-text-secondary" />
              )}
            </motion.span>
            <span className="hidden sm:inline">
              {isPeekEnabled ? 'Unblurred' : 'Blur'}
            </span>
          </motion.button>
        )}

        {/* Google OAuth & Cloud Sync Pill */}
        <AuthButton />

        {/* Onboarding / Guide Trigger Button */}
        {onOpenOnboarding && (
          <motion.button
            onClick={onOpenOnboarding}
            variants={reduceMotion ? undefined : tactileButtonVariants}
            initial="rest"
            animate="rest"
            whileHover={reduceMotion ? undefined : 'hover'}
            whileTap={reduceMotion ? undefined : 'tap'}
            className="inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-xs font-medium text-text-secondary hover:text-text-primary bg-surface-subtle/70 hover:bg-surface-subtle transition-colors duration-fast cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            title="How Tiny Steps works"
            aria-label="How Tiny Steps works"
          >
            <motion.span
              variants={reduceMotion ? undefined : tactileIconVariants}
              className="shrink-0 flex items-center"
            >
              <Question size={15} weight="bold" className="text-accent" />
            </motion.span>
            <span className="hidden sm:inline">Guide</span>
          </motion.button>
        )}

        {/* History Drawer Trigger Button (Far Right) */}
        {onToggleHistory && (
          <motion.button
            onClick={onToggleHistory}
            variants={reduceMotion ? undefined : tactileButtonVariants}
            initial="rest"
            animate="rest"
            whileHover={reduceMotion ? undefined : 'hover'}
            whileTap={reduceMotion ? undefined : 'tap'}
            className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium text-text-secondary hover:text-text-primary bg-surface-subtle/70 hover:bg-surface-subtle transition-colors duration-fast cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            title="Task history (Ctrl+H)"
            aria-label="Open task history"
          >
            <motion.span
              variants={reduceMotion ? undefined : tactileIconVariants}
              className="shrink-0 flex items-center"
            >
              <ClockCounterClockwise size={15} weight="regular" className="text-accent" />
            </motion.span>
            <span className="hidden sm:inline">History</span>
          </motion.button>
        )}
      </div>
    </header>
  );
}
