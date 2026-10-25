'use client';

import { motion } from 'framer-motion';
import { Sparkle } from '@phosphor-icons/react';

interface NowCompletedCardProps {
  reduceMotion: boolean | null;
}

export function NowCompletedCard({ reduceMotion }: NowCompletedCardProps) {
  return (
    <motion.article
      key="all-completed"
      initial={reduceMotion ? false : { opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full bg-surface rounded-3xl p-8 sm:p-10 shadow-card text-center space-y-4"
    >
      <div className="w-12 h-12 rounded-2xl bg-accent-subtle text-accent flex items-center justify-center orb-pulse mx-auto">
        <Sparkle size={26} weight="duotone" className="text-accent" />
      </div>
      <div className="space-y-1.5 max-w-sm mx-auto">
        <h3 className="text-xl sm:text-2xl font-bold text-text-primary">
          All steps complete.
        </h3>
        <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
          You turned initial friction into momentum.
        </p>
      </div>
    </motion.article>
  );
}
