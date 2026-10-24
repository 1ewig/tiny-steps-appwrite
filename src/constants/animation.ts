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
 * Universal Tactile Button & Pill Animations
 * Designed for ADHD/sensory calm across all interactive controls:
 * - Subtle micro-lift on hover (y: -1.5px, scale: 1.02)
 * - Soft tactile cushion press on tap (scale: 0.96)
 * - Rest: returns smoothly with calm easing
 */
export const tactileButtonVariants: Variants = {
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
    scale: 1.02,
    transition: CALM_SPRING,
  },
  tap: {
    scale: 0.96,
    y: 0,
    transition: CUSHION_TAP_SPRING,
  },
};

/**
 * Universal Tactile Icon Animations
 * Subtle micro-tilt and breath reaction on hover/tap
 */
export const tactileIconVariants: Variants = {
  rest: {
    rotate: 0,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: CALM_EASE,
    },
  },
  hover: {
    rotate: -3,
    scale: 1.06,
    y: -0.5,
    transition: {
      duration: 0.22,
      ease: CALM_EASE,
    },
  },
  tap: {
    scale: 0.94,
    rotate: 0,
    y: 0,
    transition: CUSHION_TAP_SPRING,
  },
};

/**
 * Tactile Checkbox Variants
 * Optimized for step checklist checkboxes (16-20px)
 */
export const tactileCheckboxVariants: Variants = {
  rest: {
    scale: 1,
    y: 0,
    transition: {
      duration: 0.2,
      ease: CALM_EASE,
    },
  },
  hover: {
    scale: 1.08,
    y: -0.5,
    transition: CALM_SPRING,
  },
  tap: {
    scale: 0.88,
    y: 0,
    transition: CUSHION_TAP_SPRING,
  },
};

// Semantic backwards-compatible aliases
export const energyPillVariants = tactileButtonVariants;
export const energyIconVariants = tactileIconVariants;
export const sendButtonVariants = tactileButtonVariants;
export const sendIconVariants = tactileIconVariants;

/**
 * Empathetic Subtitle Crossfade
 */
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

/**
 * Universal Sensory Entrance Variants
 * Combines opacity fade, gentle slide up (14px), and soft focus unblur (6px -> 0px)
 * Aligned with Tiny Steps calm curve (--ease-calm)
 */
export const unblurFadeInVariants: Variants = {
  initial: {
    opacity: 0,
    y: 14,
    filter: 'blur(6px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      duration: 0.42,
      ease: CALM_EASE,
    },
  },
};

/**
 * Universal Stagger Container Variants
 * Standard / Balanced (0.08s): Ideal for card groups, column blocks, and content sections
 */
export const staggerContainerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.02,
    },
  },
};

/**
 * Relaxed / Page-Level Stagger Variants (0.12s)
 * Ideal for full-page waterfall entrances
 */
export const staggerRelaxedVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.12,
    },
  },
};

// Semantic backwards-compatible aliases
export const heroItemEntranceVariants = unblurFadeInVariants;
export const heroStaggerContainerVariants = staggerContainerVariants;
export const taskWorkspaceStaggerVariants: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};
export const startScreenStaggerVariants = staggerRelaxedVariants;

/**
 * Now Card Micro-Steps Accordion
 * Animates height/opacity without margin or padding on the animated element,
 * so the collapse interpolates cleanly from 0 with no layout snap.
 * Children stagger in on expand and reverse-stagger out on collapse.
 */
export const subStepsAccordionVariants: Variants = {
  collapsed: {
    height: 0,
    opacity: 0,
    transition: {
      height: { duration: 0.28, ease: [0.32, 0.72, 0, 1] },
      opacity: { duration: 0.18, ease: 'easeOut' },
      staggerChildren: 0.02,
      staggerDirection: -1,
    },
  },
  expanded: {
    height: 'auto',
    opacity: 1,
    transition: {
      height: { duration: 0.36, ease: [0.32, 0.72, 0, 1] },
      opacity: { duration: 0.24, ease: 'easeOut', delay: 0.04 },
      staggerChildren: 0.045,
      delayChildren: 0.06,
    },
  },
};

export const subStepItemVariants: Variants = {
  collapsed: {
    opacity: 0,
    y: -6,
    filter: 'blur(4px)',
    transition: {
      duration: 0.16,
      ease: 'easeIn',
    },
  },
  expanded: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 420,
      damping: 30,
      mass: 0.7,
    },
  },
};

/**
 * Slide-over Drawer Variants (Right Side)
 */
export const drawerSlideVariants: Variants = {
  initial: {
    x: '100%',
    opacity: 0.8,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: GENTLE_SLIDE_SPRING,
  },
  exit: {
    x: '100%',
    opacity: 0.8,
    transition: {
      duration: 0.22,
      ease: CALM_EASE,
    },
  },
};

/**
 * Soft Backdrop Overlay Variants
 */
export const backdropVariants: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.2,
      ease: CALM_EASE,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.16,
      ease: CALM_EASE,
    },
  },
};
