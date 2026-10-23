import type { Variants, Transition } from 'framer-motion';

/**
 * Common Calm & Sensory-Friendly Physics Transitions
 * Damped curves aligned with Tiny Steps design tokens (--ease-calm)
 */
export const CALM_EASE = [0.2, 0.9, 0.3, 1] as const;

export const CALM_SPRING: Transition = {
  type: 'spring',
  stiffness: 350,
  damping: 28,
};

export const CUSHION_TAP_SPRING: Transition = {
  type: 'spring',
  stiffness: 450,
  damping: 30,
};

export const GENTLE_SLIDE_SPRING: Transition = {
  type: 'spring',
  stiffness: 380,
  damping: 32,
};

/**
 * Energy Level Selector Animations
 * Designed for ADHD/sensory calm:
 * - Subtle micro-lift on hover (y: -1.5px, scale: 1.015)
 * - Soft tactile cushion press on tap (scale: 0.97)
 * - Fluid gliding active indicator via layoutId
 * - Delicate micro-tilt on the leaf/plant icon
 * - Gentle crossfade for the empathetic subtitle
 */
export const energyPillVariants: Variants = {
  rest: {
    y: 0,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: CALM_EASE,
    },
  },
  hover: {
    y: -1.5,
    scale: 1.015,
    transition: CALM_SPRING,
  },
  tap: {
    scale: 0.97,
    y: 0,
    transition: CUSHION_TAP_SPRING,
  },
};

export const energyIconVariants: Variants = {
  rest: {
    rotate: 0,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: CALM_EASE,
    },
  },
  hover: {
    rotate: -4,
    scale: 1.06,
    transition: {
      duration: 0.24,
      ease: CALM_EASE,
    },
  },
  tap: {
    scale: 0.94,
    rotate: 0,
    transition: CUSHION_TAP_SPRING,
  },
};

export const energyActiveIndicatorTransition: Transition = {
  type: 'spring',
  stiffness: 380,
  damping: 32,
};

export const energyDescriptionVariants: Variants = {
  initial: {
    opacity: 0,
    y: 3,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.22,
      ease: CALM_EASE,
    },
  },
  exit: {
    opacity: 0,
    y: -3,
    transition: {
      duration: 0.16,
      ease: CALM_EASE,
    },
  },
};

/**
 * Reusable App Animations for Future Components
 */
export const fadeInUpVariants: Variants = {
  initial: {
    opacity: 0,
    y: 8,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.28,
      ease: CALM_EASE,
    },
  },
  exit: {
    opacity: 0,
    y: -6,
    transition: {
      duration: 0.2,
      ease: CALM_EASE,
    },
  },
};

export const fadeInScaleVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.97,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.24,
      ease: CALM_EASE,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: {
      duration: 0.18,
      ease: CALM_EASE,
    },
  },
};

export const staggerContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.02,
    },
  },
};
