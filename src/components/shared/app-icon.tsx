'use client';

import type { SVGProps } from 'react';
import { motion, useReducedMotion, type Variants } from 'framer-motion';

type NativeSvgProps = Omit<
  SVGProps<SVGSVGElement>,
  | 'onAnimationStart'
  | 'onAnimationEnd'
  | 'onAnimationIteration'
  | 'onDrag'
  | 'onDragStart'
  | 'onDragEnd'
  | 'onDragEnter'
  | 'onDragExit'
  | 'onDragLeave'
  | 'onDragOver'
  | 'onDrop'
  | 'values'
>;

interface AppIconProps extends NativeSvgProps {
  size?: number;
  animated?: boolean;
  hoverAnimated?: boolean;
}

const teeterTransition = {
  duration: 3.2,
  ease: 'easeInOut' as const,
  repeat: Infinity,
  times: [0, 0.25, 0.5, 0.75, 1],
};

const topTransition = {
  ...teeterTransition,
  times: [0, 0.25, 0.32, 0.5, 0.75, 0.82, 1],
};

const restTransition = {
  duration: 0.45,
  ease: 'easeInOut' as const,
};

const baseVariants: Variants = {
  rest: { rotate: 0, transition: restTransition },
  hover: {
    rotate: [0, -2, 0, 2, 0],
    transition: teeterTransition,
  },
};

const midVariants: Variants = {
  rest: { rotate: 0, x: 0, y: 0, transition: restTransition },
  hover: {
    rotate: [0, -9, 2, 12, 0],
    x: [0, -2, 0.5, 2.5, 0],
    y: [0, -1, 0, -1, 0],
    transition: teeterTransition,
  },
};

const topVariants: Variants = {
  rest: { x: 0, y: 0, transition: restTransition },
  hover: {
    x: [0, -7, -7.8, 1, 6.5, 7.2, 0],
    y: [0, 1.5, 2, 0, 1, 1.8, 0],
    transition: topTransition,
  },
};

export function AppIcon({
  size = 24,
  animated = false,
  hoverAnimated = false,
  className = '',
  ...props
}: AppIconProps) {
  const reduceMotion = useReducedMotion();
  const animateContinuously = animated && !reduceMotion;
  const animateOnHover = hoverAnimated && !reduceMotion;

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`cairn-svg ${className}`.trim()}
      initial="rest"
      animate={animateContinuously ? 'hover' : 'rest'}
      whileHover={animateOnHover ? 'hover' : undefined}
      {...props}
    >
      {/* App Icon Squircle Background */}
      <rect width="64" height="64" rx="15" fill="#1E3A2F" />
      <g className="cairn-group">
        {/* Base Stone */}
        <motion.g
          variants={baseVariants}
          style={{ transformBox: 'view-box', transformOrigin: '32px 45.5px' }}
        >
          <rect x="16" y="40" width="32" height="11" rx="5.5" fill="#34D399" />
        </motion.g>
        {/* Middle Offset Stone */}
        <motion.g
          variants={midVariants}
          style={{ transformBox: 'view-box', transformOrigin: '31px 32px' }}
        >
          <rect x="20" y="27" width="22" height="10" rx="5" transform="rotate(-4 20 27)" fill="#6EE7B7" />
        </motion.g>
        {/* Top Tiny Crown Stone */}
        <motion.g
          variants={topVariants}
          style={{ transformBox: 'view-box', transformOrigin: '33px 18px' }}
        >
          <circle cx="33" cy="18" r="5" fill="#FBBF24" />
        </motion.g>
      </g>
    </motion.svg>
  );
}
