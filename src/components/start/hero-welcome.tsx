'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { AppIcon } from '@/components/shared/app-icon';
import {
  staggerContainerVariants,
  unblurFadeInVariants,
} from '@/constants/animation';

export function HeroWelcome() {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={reduceMotion ? undefined : staggerContainerVariants}
      className="text-center max-w-xl mx-auto space-y-4"
    >
      <motion.div
        variants={reduceMotion ? undefined : unblurFadeInVariants}
        className="mx-auto flex items-center justify-center"
      >
        <AppIcon size={52} hoverAnimated className="shadow-subtle rounded-2xl" />
      </motion.div>

      <motion.h1
        variants={reduceMotion ? undefined : unblurFadeInVariants}
        className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary leading-tight"
      >
        What feels heavy right now?
      </motion.h1>

      <motion.p
        variants={reduceMotion ? undefined : unblurFadeInVariants}
        className="text-text-secondary text-sm sm:text-base leading-relaxed max-w-md mx-auto"
      >
        Brain-dump your thoughts. We&apos;ll make it tiny.
      </motion.p>
    </motion.div>
  );
}

