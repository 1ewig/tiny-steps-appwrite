'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  SignOut,
  ArrowsClockwise,
  CloudCheck,
  Check,
} from '@phosphor-icons/react';
import { useAuth } from '@/hooks/use-auth';
import { useTaskSync } from '@/hooks/use-task-sync';
import {
  tactileButtonVariants,
  popoverVariants,
} from '@/constants/animation';

export function GoogleIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
      />
    </svg>
  );
}

export function AuthButton() {
  const reduceMotion = useReducedMotion();
  const { user, isAuthenticated, isLoading, signInWithGoogle, logout } = useAuth();
  const { isSyncing, lastSyncedAt, syncNow } = useTaskSync();
  const [isOpen, setIsOpen] = useState(false);
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [justSynced, setJustSynced] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleManualSync = async () => {
    setIsManualSyncing(true);
    setJustSynced(false);
    try {
      await syncNow();
      setJustSynced(true);
      setTimeout(() => setJustSynced(false), 2000);
    } catch (err) {
      console.warn('Manual sync failed:', err);
    } finally {
      setIsManualSyncing(false);
    }
  };

  // 1. Loading State
  if (isLoading) {
    return (
      <div
        className="h-8 w-20 rounded-md bg-surface-subtle/50 animate-pulse"
        aria-hidden="true"
      />
    );
  }

  // 2. Unauthenticated State: Sign in with Google
  if (!isAuthenticated || !user) {
    return (
      <motion.button
        type="button"
        onClick={() => signInWithGoogle('/tasks')}
        variants={reduceMotion ? undefined : tactileButtonVariants}
        initial="rest"
        animate="rest"
        whileHover={reduceMotion ? undefined : 'hover'}
        whileTap={reduceMotion ? undefined : 'tap'}
        className="inline-flex items-center gap-1.5 h-8 px-2.5 sm:px-3 rounded-md text-xs font-medium text-text-primary bg-surface-subtle/70 hover:bg-surface-subtle border border-border-subtle transition-colors duration-fast cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        title="Sign in with Google to sync tasks"
      >
        <GoogleIcon className="w-3.5 h-3.5 shrink-0" />
        <span className="hidden sm:inline">Sign in</span>
      </motion.button>
    );
  }

  // 3. Authenticated State: User Avatar & Menu
  const initial = (user.name || user.email || 'U').charAt(0).toUpperCase();
  const displayName = user.name || user.email.split('@')[0];
  const syncingActive = isSyncing || isManualSyncing;

  return (
    <div className="relative" ref={menuRef}>
      <motion.button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        variants={reduceMotion ? undefined : tactileButtonVariants}
        initial="rest"
        animate="rest"
        whileHover={reduceMotion ? undefined : 'hover'}
        whileTap={reduceMotion ? undefined : 'tap'}
        className="inline-flex items-center gap-1.5 h-8 pl-1.5 pr-2.5 rounded-md text-xs font-medium text-text-primary bg-surface-subtle/70 hover:bg-surface-subtle border border-border-subtle transition-colors duration-fast cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        title={`${displayName} (Appwrite TablesDB synced)`}
      >
        <span className="w-5 h-5 rounded-full bg-accent text-text-inverse flex items-center justify-center text-[10px] font-bold shrink-0">
          {initial}
        </span>
        <span className="max-w-[70px] sm:max-w-[90px] truncate hidden xs:inline">
          {displayName}
        </span>
        {/* Sync Status Indicator Icon */}
        <span className="shrink-0 flex items-center text-text-tertiary">
          {syncingActive ? (
            <ArrowsClockwise
              size={12}
              weight="bold"
              className="text-accent animate-spin"
            />
          ) : (
            <span
              className="w-1.5 h-1.5 rounded-full bg-accent"
              title="Synced with TablesDB"
            />
          )}
        </span>
      </motion.button>

      {/* Popover Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            variants={reduceMotion ? undefined : popoverVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute right-0 mt-1.5 w-60 rounded-xl bg-surface border border-border-subtle shadow-modal z-drawer p-3 font-sans focus:outline-none"
            role="menu"
          >
            {/* User Profile Header */}
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-border-subtle">
              <div className="w-8 h-8 rounded-full bg-accent text-text-inverse flex items-center justify-center text-xs font-bold shrink-0">
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-text-primary truncate">
                  {displayName}
                </p>
                <p className="text-[11px] text-text-tertiary truncate">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Cloud Sync Status Section */}
            <div className="py-2.5 border-b border-border-subtle">
              <div className="flex items-center justify-between text-2xs mb-1">
                <span className="text-text-secondary flex items-center gap-1 font-medium">
                  <CloudCheck size={14} className="text-accent" weight="fill" />
                  Appwrite TablesDB
                </span>
                <span className="text-text-tertiary">
                  {syncingActive
                    ? 'Syncing...'
                    : lastSyncedAt
                    ? 'Synced'
                    : 'Connected'}
                </span>
              </div>
              <p className="text-[11px] text-text-tertiary leading-relaxed mb-2">
                Your tasks and micro-steps are persisted to Appwrite TablesDB.
              </p>

              <button
                type="button"
                onClick={handleManualSync}
                disabled={syncingActive}
                className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-2xs font-medium text-text-secondary hover:text-text-primary bg-surface-subtle/80 hover:bg-surface-subtle border border-border-subtle transition-colors duration-fast cursor-pointer disabled:opacity-50"
              >
                {justSynced ? (
                  <>
                    <Check size={13} weight="bold" className="text-accent" />
                    <span>Up to date</span>
                  </>
                ) : (
                  <>
                    <ArrowsClockwise
                      size={13}
                      weight="bold"
                      className={syncingActive ? 'animate-spin text-accent' : ''}
                    />
                    <span>{syncingActive ? 'Syncing...' : 'Sync now'}</span>
                  </>
                )}
              </button>
            </div>

            {/* Sign Out Action */}
            <div className="pt-2">
              <button
                type="button"
                onClick={async () => {
                  setIsOpen(false);
                  await logout();
                }}
                className="w-full inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-danger-text hover:bg-danger-subtle transition-colors duration-fast cursor-pointer"
                role="menuitem"
              >
                <SignOut size={14} weight="regular" />
                <span>Sign out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
