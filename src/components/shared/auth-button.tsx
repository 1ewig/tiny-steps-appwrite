'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  SignOut,
  SignIn,
  ArrowsClockwise,
  CloudCheck,
  Check,
  SpinnerGap,
} from '@phosphor-icons/react';
import { useAuth } from '@/hooks/use-auth';
import { useTaskSync } from '@/hooks/use-task-sync';
import {
  tactileButtonVariants,
  tactileIconVariants,
  popoverVariants,
} from '@/constants/animation';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { AuthOverlay } from '@/components/shared/auth-overlay';

export function GoogleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.7034 7.91133C14.7554 7.02509 13.4903 6.54228 12.1813 6.56212C9.78605 6.56212 7.75176 8.14611 7.02642 10.279V10.2791C6.64183 11.3968 6.64183 12.6071 7.02642 13.7249H7.02979C7.75849 15.8545 9.78941 17.4385 12.1847 17.4385C13.4211 17.4385 14.4826 17.1285 15.3053 16.5809V16.5787C16.2735 15.9504 16.9348 14.9616 17.1406 13.8439H12.1813V10.3783H20.8414C20.9494 10.9802 21 11.5952 21 12.207C21 14.9443 20.002 17.2586 18.2655 18.826L18.2673 18.8274C16.7458 20.203 14.6576 21 12.1813 21C8.70985 21 5.53527 19.082 3.97666 16.043V16.043C2.67445 13.5 2.67445 10.5039 3.97666 7.96096H3.97668L3.97666 7.96094C5.53527 4.9186 8.70985 3.00061 12.1813 3.00061C14.4619 2.97415 16.6649 3.8141 18.3247 5.34188L15.7034 7.91133Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function AuthButton() {
  const reduceMotion = useReducedMotion();
  const {
    user,
    isAuthenticated,
    isSigningOut,
    logout,
  } = useAuth();
  const { isSyncing, lastSyncedAt, syncNow } = useTaskSync();
  const [isOpen, setIsOpen] = useState(false);
  const [isManualSyncing, setIsManualSyncing] = useState(false);
  const [justSynced, setJustSynced] = useState(false);
  const [isSignOutConfirmOpen, setIsSignOutConfirmOpen] = useState(false);
  const [isAuthOverlayOpen, setIsAuthOverlayOpen] = useState(false);
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

  const handleConfirmSignOut = async () => {
    try {
      await logout();
      setIsSignOutConfirmOpen(false);
    } catch (err) {
      console.warn('Sign out failed:', err);
    }
  };

  // 1. Unauthenticated State: Sign in trigger button (matches History button style)
  if (!isAuthenticated || !user) {
    return (
      <>
        <motion.button
          type="button"
          onClick={() => setIsAuthOverlayOpen(true)}
          variants={reduceMotion ? undefined : tactileButtonVariants}
          initial="rest"
          animate="rest"
          whileHover={reduceMotion ? undefined : 'hover'}
          whileTap={reduceMotion ? undefined : 'tap'}
          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md text-xs font-medium text-text-secondary hover:text-text-primary bg-surface-subtle/70 hover:bg-surface-subtle transition-colors duration-fast cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          title="Sign in for cloud backup"
          aria-label="Sign in"
        >
          <motion.span
            variants={reduceMotion ? undefined : tactileIconVariants}
            className="shrink-0 flex items-center"
          >
            <SignIn size={15} weight="regular" className="text-accent" />
          </motion.span>
          <span className="hidden sm:inline">Sign in</span>
        </motion.button>

        <AuthOverlay
          isOpen={isAuthOverlayOpen}
          onClose={() => setIsAuthOverlayOpen(false)}
        />
      </>
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
        className="inline-flex items-center gap-1.5 h-8 pl-1.5 pr-2.5 rounded-md text-xs font-medium text-text-primary bg-surface-subtle/70 hover:bg-surface-subtle transition-colors duration-fast cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        title={`${displayName} (Cloud synced)`}
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
              title="Synced with cloud"
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
            className="absolute right-0 mt-1.5 w-64 rounded-xl bg-surface shadow-modal z-drawer p-3 font-sans focus:outline-none"
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
                  Cloud Backup
                </span>
                <span className="text-text-tertiary">
                  {syncingActive
                    ? 'Syncing...'
                    : lastSyncedAt
                    ? 'Synced'
                    : 'Connected'}
                </span>
              </div>
              <p className="text-[11px] text-text-tertiary leading-relaxed">
                Your tasks and micro-steps are securely backed up in the cloud.
              </p>
            </div>

            {/* Actions: Sync & Sign Out on the same bottom row */}
            <div className="pt-2.5 flex items-center gap-2">
              <motion.button
                type="button"
                onClick={handleManualSync}
                disabled={syncingActive}
                variants={reduceMotion ? undefined : tactileButtonVariants}
                initial="rest"
                animate="rest"
                whileHover={syncingActive || reduceMotion ? undefined : 'hover'}
                whileTap={syncingActive || reduceMotion ? undefined : 'tap'}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-2xs font-medium text-text-secondary hover:text-text-primary bg-surface-subtle/80 hover:bg-surface-subtle transition-colors duration-fast cursor-pointer disabled:opacity-50"
                role="menuitem"
              >
                {justSynced ? (
                  <>
                    <motion.span
                      variants={reduceMotion ? undefined : tactileIconVariants}
                      className="flex items-center shrink-0"
                    >
                      <Check size={13} weight="bold" className="text-accent" />
                    </motion.span>
                    <span>Up to date</span>
                  </>
                ) : (
                  <>
                    <motion.span
                      variants={reduceMotion ? undefined : tactileIconVariants}
                      className="flex items-center shrink-0"
                    >
                      <ArrowsClockwise
                        size={13}
                        weight="bold"
                        className={syncingActive ? 'animate-spin text-accent' : ''}
                      />
                    </motion.span>
                    <span>{syncingActive ? 'Syncing...' : 'Sync now'}</span>
                  </>
                )}
              </motion.button>

              <motion.button
                type="button"
                disabled={isSigningOut}
                onClick={() => {
                  setIsOpen(false);
                  setIsSignOutConfirmOpen(true);
                }}
                variants={reduceMotion ? undefined : tactileButtonVariants}
                initial="rest"
                animate="rest"
                whileHover={isSigningOut || reduceMotion ? undefined : 'hover'}
                whileTap={isSigningOut || reduceMotion ? undefined : 'tap'}
                className="flex-1 inline-flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg text-2xs font-medium text-danger-text hover:bg-danger-subtle transition-colors duration-fast cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                role="menuitem"
              >
                <motion.span
                  variants={reduceMotion ? undefined : tactileIconVariants}
                  className="flex items-center shrink-0"
                >
                  {isSigningOut ? (
                    <SpinnerGap
                      size={13}
                      weight="bold"
                      className={reduceMotion ? undefined : 'animate-spin'}
                    />
                  ) : (
                    <SignOut size={13} weight="regular" />
                  )}
                </motion.span>
                <span>{isSigningOut ? 'Signing out...' : 'Sign out'}</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reusable ConfirmDialog wired to Sign Out */}
      <ConfirmDialog
        isOpen={isSignOutConfirmOpen}
        title="Sign out of Tiny Steps?"
        description={
          <span>
            Your tasks and progress are safely backed up in the cloud. You can sign back in anytime to pick up where you left off.
          </span>
        }
        confirmLabel={isSigningOut ? 'Signing out...' : 'Sign out'}
        cancelLabel="Stay signed in"
        variant="danger"
        isBusy={isSigningOut}
        icon={
          isSigningOut ? (
            <SpinnerGap
              size={20}
              weight="bold"
              className={`text-danger-text ${reduceMotion ? '' : 'animate-spin'}`}
            />
          ) : (
            <SignOut size={20} weight="duotone" className="text-danger-text" />
          )
        }
        onConfirm={handleConfirmSignOut}
        onClose={() => {
          if (!isSigningOut) {
            setIsSignOutConfirmOpen(false);
          }
        }}
      />
    </div>
  );
}
