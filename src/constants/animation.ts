import type { Variants, Transition } from 'framer-motion';

/* ==========================================================================
   1. PHYSICS & TIMING CURVES
   Damped curves aligned with Tiny Steps design tokens (--ease-calm)
   ========================================================================== */

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

/* ==========================================================================
   2. UNIVERSAL TACTILE CONTROLS
   ADHD & sensory-friendly micro-interactions for buttons, pills, and checkboxes
   ========================================================================== */

/**
 * Universal Tactile Button & Pill Animations
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

// Backwards-compatible aliases for legacy imports
export const energyPillVariants = tactileButtonVariants;
export const energyIconVariants = tactileIconVariants;
export const sendButtonVariants = tactileButtonVariants;
export const sendIconVariants = tactileIconVariants;

/* ==========================================================================
   3. CARD & SURFACE ENTRANCES
   ========================================================================== */

/**
 * Universal Sensory Entrance Variants
 * Combines opacity fade, gentle slide up (14px), and soft focus unblur (6px -> 0px)
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
 * Tranquil Dialog & Confirmation Card Entrance Variants
 * Subtle micro-scale (0.99 -> 1.0) and 5px vertical glide with zero bouncy overshoot.
 */
export const dialogCardVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.99,
    y: 5,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.22,
      ease: CALM_EASE,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.99,
    y: 3,
    transition: {
      duration: 0.16,
      ease: CALM_EASE,
    },
  },
};

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

// Reusable micro-fades
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
 * Popover & Menu Dropdown Variants
 */
export const popoverVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.96,
    y: -4,
  },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.18,
      ease: CALM_EASE,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: -4,
    transition: {
      duration: 0.12,
      ease: CALM_EASE,
    },
  },
};

// Backwards-compatible aliases
export const heroItemEntranceVariants = unblurFadeInVariants;

/* ==========================================================================
   4. SEQUENCING & STAGGER CONTAINERS
   ========================================================================== */

/**
 * Factory for Stagger Container Variants
 */
export function createStaggerVariants(options: {
  stagger?: number;
  delay?: number;
} = {}): Variants {
  const { stagger = 0.08, delay = 0.02 } = options;
  return {
    initial: {},
    animate: {
      transition: {
        staggerChildren: stagger,
        delayChildren: delay,
      },
    },
  };
}

/** Standard container stagger (0.08s cascade) */
export const staggerContainerVariants: Variants = createStaggerVariants({
  stagger: 0.08,
  delay: 0.02,
});

/** Relaxed page-level stagger (0.12s waterfall) */
export const staggerRelaxedVariants: Variants = createStaggerVariants({
  stagger: 0.12,
  delay: 0.12,
});

// Backwards-compatible aliases
export const taskWorkspaceStaggerVariants: Variants = staggerContainerVariants;
export const heroStaggerContainerVariants: Variants = staggerContainerVariants;
export const startScreenStaggerVariants: Variants = staggerRelaxedVariants;

/* ==========================================================================
   5. OPTICAL DISSOLVE & TEXT MORPHS
   Tranquil step transitions and rotating loader copy via optical blur dissolve
   ========================================================================== */

/**
 * Factory for Optical Blur-Dissolve / Text Morph Transitions
 */
export function createOpticalMorphVariants(options: {
  duration?: number;
  blur?: number;
  scale?: number;
} = {}): Variants {
  const { duration = 0.5, blur = 8, scale = 1.015 } = options;
  const exitScale = Number((2 - scale).toFixed(3));

  return {
    initial: {
      opacity: 0,
      filter: `blur(${blur}px)`,
      scale,
    },
    animate: {
      opacity: 1,
      filter: 'blur(0px)',
      scale: 1,
      transition: {
        duration,
        ease: CALM_EASE,
      },
    },
    exit: {
      opacity: 0,
      filter: `blur(${blur}px)`,
      scale: exitScale,
      transition: {
        duration,
        ease: CALM_EASE,
      },
    },
  };
}

/** 0.5s Focus Tunnel step transition */
export const opticalMorphVariants: Variants = createOpticalMorphVariants({
  duration: 0.5,
  blur: 8,
  scale: 1.015,
});

/** 1.0s Focus Loader rotating lines */
export const subtleMorphVariants: Variants = createOpticalMorphVariants({
  duration: 1.0,
  blur: 5,
  scale: 1.008,
});

/* ==========================================================================
   6. MICRO-STEPS ACCORDION
   ========================================================================== */

/**
 * Now Card Micro-Steps Accordion
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
