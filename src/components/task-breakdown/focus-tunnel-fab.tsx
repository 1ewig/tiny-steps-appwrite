'use client';

import { motion, useReducedMotion } from 'framer-motion';
import {
  tactileButtonVariants,
  tactileIconVariants,
} from '@/constants/animation';

interface FocusTunnelFabProps {
  onOpen: () => void;
  className?: string;
}

export function FocusTunnelFab({ onOpen, className = '' }: FocusTunnelFabProps) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      onClick={onOpen}
      variants={reduceMotion ? undefined : tactileButtonVariants}
      initial="rest"
      animate="rest"
      whileHover={reduceMotion ? undefined : 'hover'}
      whileTap={reduceMotion ? undefined : 'tap'}
      aria-label="Open distraction-free Focus Tunnel"
      title="Open distraction-free Focus Tunnel"
      className={`fixed sm:absolute bottom-5 right-4 sm:right-6 z-20 h-11 px-3.5 sm:px-4 rounded-full flex items-center gap-2 shadow-card backdrop-blur-md bg-accent hover:bg-accent-hover text-text-inverse font-medium text-xs transition-colors duration-fast cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${className}`}
    >
      <motion.span
        variants={reduceMotion ? undefined : tactileIconVariants}
        className="text-sm font-bold flex items-center justify-center shrink-0"
      >
        ◎
      </motion.span>
      <span className="font-semibold tracking-wide hidden xs:inline">
        Focus Tunnel
      </span>
    </motion.button>
  );
}
