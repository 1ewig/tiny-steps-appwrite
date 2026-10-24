'use client';

import { motion } from 'framer-motion';
import { CaretDown } from '@phosphor-icons/react';
import { tactileButtonVariants, tactileIconVariants } from '@/constants/animation';

interface StepVisibilityToggleProps {
  count: number;
  expanded: boolean;
  reduceMotion: boolean | null;
  onToggle: () => void;
}

export function StepVisibilityToggle({
  count,
  expanded,
  reduceMotion,
  onToggle,
}: StepVisibilityToggleProps) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      variants={reduceMotion ? undefined : tactileButtonVariants}
      initial="rest"
      animate="rest"
      whileHover={reduceMotion ? undefined : 'hover'}
      whileTap={reduceMotion ? undefined : 'tap'}
      className="group text-xs font-medium text-text-tertiary hover:text-text-primary transition-colors cursor-pointer inline-flex items-center gap-1.5 select-none"
    >
      <span className="relative inline-grid">
        <motion.span
          aria-hidden={!expanded}
          initial={false}
          animate={
            reduceMotion
              ? { opacity: expanded ? 1 : 0 }
              : { opacity: expanded ? 1 : 0, y: expanded ? 0 : 3 }
          }
          transition={{ duration: 0.14, ease: 'easeOut' }}
          className="[grid-area:1/1] whitespace-nowrap"
        >
          Hide steps
        </motion.span>
        <motion.span
          aria-hidden={expanded}
          initial={false}
          animate={
            reduceMotion
              ? { opacity: expanded ? 0 : 1 }
              : { opacity: expanded ? 0 : 1, y: expanded ? -3 : 0 }
          }
          transition={{ duration: 0.14, ease: 'easeOut' }}
          className="[grid-area:1/1] whitespace-nowrap"
        >
          {`Show ${count} smaller steps`}
        </motion.span>
      </span>
      <motion.span
        variants={reduceMotion ? undefined : tactileIconVariants}
        className="inline-flex text-text-tertiary group-hover:text-text-primary transition-colors"
      >
        <motion.span
          animate={reduceMotion ? undefined : { rotate: expanded ? 180 : 0 }}
          transition={{ type: 'spring', stiffness: 360, damping: 26 }}
          className="inline-flex"
        >
          <CaretDown size={12} weight="bold" />
        </motion.span>
      </motion.span>
    </motion.button>
  );
}
