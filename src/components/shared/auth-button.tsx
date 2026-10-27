'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  SignOut,
  SignIn,
  ArrowsClockwise,
  CloudCheck,
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
import { GoogleIcon } from '@/components/shared/google-icon';

export { GoogleIcon };

export function AuthButton() {
  const reduceMotion = useReducedMotion();
  const {
    user,
    isAuthenticated,
    isSigningOut,
    logout,
  } = useAuth();
  const { isSyncing } = useTaskSync();
  const [isOpen, setIsOpen] = useState(false);
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
        title={`${displayName} (Signed in)`}
      >
        <span className="w-5 h-5 rounded-full bg-accent text-text-inverse flex items-center justify-center text-2xs font-bold shrink-0">
          {initial}
        </span>
        <span className="max-w-[70px] sm:max-w-[90px] truncate hidden xs:inline">
          {displayName}
        </span>
        {/* Sync Status Indicator Icon */}
        <span className="shrink-0 flex items-center text-text-tertiary">
          {isSyncing ? (
            <ArrowsClockwise
              size={12}
              weight="bold"
              className="text-accent animate-spin"
            />
          ) : (
            <span
              className="w-1.5 h-1.5 rounded-full bg-accent/80"
              title="Saved"
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
                <p className="text-2xs text-text-tertiary truncate">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Cloud Backup Status Section */}
            <div className="py-2.5 border-b border-border-subtle">
              <div className="flex items-center justify-between text-2xs mb-1">
                <span className="text-text-secondary flex items-center gap-1.5 font-medium">
                  <CloudCheck size={14} className="text-accent" weight="fill" />
                  Cloud backup
                </span>
                <span className="text-text-tertiary">
                  {isSyncing ? 'Saving...' : 'Saved'}
                </span>
              </div>
              <p className="text-2xs text-text-tertiary leading-relaxed">
                Your tasks and steps are automatically saved to your account.
              </p>
            </div>

            {/* Actions: Sign Out (Full-Width Clean Action) */}
            <div className="pt-2.5 flex items-center">
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
                className="w-full inline-flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg text-2xs font-medium text-danger-text hover:bg-danger-subtle transition-colors duration-fast cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
