'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ArrowCounterClockwise } from '@phosphor-icons/react';
import { tactileButtonVariants, tactileIconVariants } from '@/constants/animation';

interface NowCardHeaderProps {
  nowStepNumber?: number | null;
  totalStepsCount?: number;
  isOutOfOrder?: boolean;
  naturalFirstStepNumber?: number | null;
  onResetOrder?: () => void;
  reduceMotion: boolean | null;
}

export function NowCardHeader({
  nowStepNumber,
  totalStepsCount,
  isOutOfOrder = false,
  naturalFirstStepNumber,
  onResetOrder,
  reduceMotion,
}: NowCardHeaderProps) {
  return (
    <div className="flex items-center justify-between gap-2 px-1 min-h-6">
      <div className="flex items-center gap-2 min-w-0">
        <h2 className="text-2xs font-semibold uppercase tracking-widest text-accent">
          Now
        </h2>
        {nowStepNumber && totalStepsCount && (
          <span className="text-2xs font-mono text-text-tertiary whitespace-nowrap">
            · Step {nowStepNumber} of {totalStepsCount}
          </span>
        )}
      </div>

      <AnimatePresence>
        {isOutOfOrder && naturalFirstStepNumber && onResetOrder && (
          <motion.div
            className="shrink-0"
            initial={reduceMotion ? false : { opacity: 0, x: 6 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduceMotion ? undefined : { opacity: 0, x: 6 }}
            transition={{ duration: 0.15 }}
          >
            <motion.button
              type="button"
              onClick={onResetOrder}
              variants={reduceMotion ? undefined : tactileButtonVariants}
              initial="rest"
              animate="rest"
              whileHover={reduceMotion ? undefined : 'hover'}
              whileTap={reduceMotion ? undefined : 'tap'}
              className="text-2xs font-medium text-text-tertiary hover:text-accent flex items-center gap-1.5 rounded-sm transition-colors cursor-pointer select-none whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              title={`Return to recommended Step ${naturalFirstStepNumber}`}
            >
              <motion.span
                variants={reduceMotion ? undefined : tactileIconVariants}
                className="inline-flex"
              >
                <ArrowCounterClockwise size={12} weight="bold" />
              </motion.span>
              <span>Back to step {naturalFirstStepNumber}</span>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
