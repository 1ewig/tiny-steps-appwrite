'use client';

import { useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { X, CloudCheck, SpinnerGap } from '@phosphor-icons/react';
import { useAuth } from '@/hooks/use-auth';
import { useFocusTrap } from '@/hooks/use-focus-trap';
import { AppIcon } from '@/components/shared/app-icon';
import { GoogleIcon } from '@/components/shared/auth-button';
import {
  CALM_EASE,
  tactileButtonVariants,
  tactileIconVariants,
} from '@/constants/animation';

interface AuthOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AuthOverlay({ isOpen, onClose }: AuthOverlayProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { isSigningIn, signInWithGoogle } = useAuth();

  useFocusTrap({
    isOpen,
    containerRef: overlayRef,
    isBusy: isSigningIn,
    onClose,
    useCapture: true,
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={overlayRef}
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          aria-label="Sign in to Tiny Steps"
          initial={{ opacity: 0 }}
          animate={{
            opacity: 1,
            transition: {
              duration: reduceMotion ? 0 : 0.22,
              ease: CALM_EASE,
            },
          }}
          exit={{
            opacity: 0,
            transition: {
              duration: reduceMotion ? 0 : 0.18,
              ease: CALM_EASE,
            },
          }}
          className="fixed inset-0 z-modal bg-canvas/95 backdrop-blur-md flex flex-col justify-between p-4 sm:p-6 select-none focus:outline-none overflow-y-auto"
        >
          {/* Header: App Brand + Close Button */}
          <header className="w-full flex items-center justify-between z-10 shrink-0">
            <div className="flex items-center gap-2.5">
              <AppIcon size={28} className="rounded-xl shadow-subtle" />
              <span className="text-xs font-semibold tracking-tight text-text-primary">
                Tiny Steps
              </span>
            </div>

            <motion.button
              type="button"
              onClick={onClose}
              disabled={isSigningIn}
              variants={reduceMotion ? undefined : tactileButtonVariants}
              initial="rest"
              animate="rest"
              whileHover={isSigningIn || reduceMotion ? undefined : 'hover'}
              whileTap={isSigningIn || reduceMotion ? undefined : 'tap'}
              className="p-2 rounded-xl text-text-secondary hover:text-text-primary hover:bg-surface-subtle transition-colors duration-fast cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Close overlay"
              title={isSigningIn ? 'Connecting...' : 'Close (Esc)'}
            >
              <motion.span
                variants={reduceMotion ? undefined : tactileIconVariants}
                className="flex items-center"
              >
                <X size={18} weight="bold" />
              </motion.span>
            </motion.button>
          </header>

          {/* Main Stage: Centered Peaceful Typography + Google Sign-In Action */}
          <main className="flex-1 flex flex-col items-center justify-center text-center px-4 sm:px-6 py-8 max-w-2xl mx-auto w-full my-auto space-y-7">
            {/* Soft Icon Badge */}
            <div className="w-14 h-14 rounded-2xl bg-accent-subtle text-accent-text flex items-center justify-center shadow-subtle">
              <CloudCheck size={28} weight="fill" className="text-accent" />
            </div>

            {/* Reassuring, Zero-Guilt Messaging */}
            <div className="space-y-3 max-w-xl mx-auto">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-text-primary leading-snug sm:leading-tight tracking-tight">
                Save your steps across devices
              </h1>
              <p className="text-sm sm:text-base text-text-secondary leading-relaxed max-w-lg mx-auto font-medium">
                Sign in with Google to sync your micro-steps and tasks.
                Signing in is completely optional — Tiny Steps always works offline right here with zero pressure.
              </p>
            </div>

            {/* Actions: Sign in with Google (Primary) */}
            <div className="flex flex-col items-center gap-3 w-full max-w-xs sm:max-w-sm mx-auto pt-2">
              <motion.button
                type="button"
                onClick={() => signInWithGoogle()}
                disabled={isSigningIn}
                aria-busy={isSigningIn}
                variants={reduceMotion ? undefined : tactileButtonVariants}
                initial="rest"
                animate="rest"
                whileHover={isSigningIn || reduceMotion ? undefined : 'hover'}
                whileTap={isSigningIn || reduceMotion ? undefined : 'tap'}
                className="w-full inline-flex items-center justify-center gap-3 h-12 px-6 rounded-2xl text-sm font-semibold text-text-primary bg-surface hover:bg-surface-elevated border border-border-subtle hover:border-border-muted shadow-subtle hover:shadow-card transition-all duration-fast cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                title={isSigningIn ? 'Connecting to Google...' : 'Sign in with Google'}
              >
                {isSigningIn ? (
                  <SpinnerGap
                    size={20}
                    weight="bold"
                    className={`shrink-0 text-accent ${reduceMotion ? '' : 'animate-spin'}`}
                    aria-hidden="true"
                  />
                ) : (
                  <GoogleIcon className="w-5 h-5 shrink-0 text-text-secondary" />
                )}
                <span>{isSigningIn ? 'Connecting to Google...' : 'Sign in with Google'}</span>
              </motion.button>
            </div>
          </main>

          {/* Footer: Quiet shortcut indicator */}
          <footer className="w-full flex items-center justify-center pb-2 shrink-0">
            <div className="text-2xs text-text-tertiary opacity-70 flex items-center gap-2 select-none">
              <span>
                <kbd className="font-mono text-text-secondary">Esc</kbd> return to workspace
              </span>
              <span aria-hidden="true">·</span>
              <span>Your data stays on this device</span>
            </div>
          </footer>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
