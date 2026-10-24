'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Sun, Moon } from '@phosphor-icons/react';
import { tactileButtonVariants, tactileIconVariants } from '@/constants/animation';

interface ThemeToggleFabProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
  className?: string;
}

export function ThemeToggleFab({
  theme,
  onToggle,
  className = '',
}: ThemeToggleFabProps) {
  const reduceMotion = useReducedMotion();
  const isDark = theme === 'dark';

  return (
    <motion.button
      type="button"
      onClick={onToggle}
      variants={reduceMotion ? undefined : tactileButtonVariants}
      initial="rest"
      animate="rest"
      whileHover={reduceMotion ? undefined : 'hover'}
      whileTap={reduceMotion ? undefined : 'tap'}
      aria-label={isDark ? 'Switch to sensory light mode' : 'Switch to sensory dim mode'}
      title={isDark ? 'Sensory light mode' : 'Sensory dim mode'}
      className={`fixed bottom-5 left-4 sm:left-6 z-20 w-11 h-11 rounded-full flex items-center justify-center shadow-card backdrop-blur-md transition-colors duration-fast group cursor-pointer bg-surface/90 hover:bg-surface text-text-secondary hover:text-text-primary shadow-subtle focus:outline-none focus-visible:outline-none ${className}`}
    >
      <motion.span
        variants={reduceMotion ? undefined : tactileIconVariants}
        className="flex items-center justify-center shrink-0"
      >
        {isDark ? (
          <Sun size={19} weight="regular" className="text-accent" />
        ) : (
          <Moon size={19} weight="regular" className="text-text-secondary group-hover:text-text-primary" />
        )}
      </motion.span>
    </motion.button>
  );
}
