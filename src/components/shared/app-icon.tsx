import type { SVGProps } from 'react';

interface AppIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

export function AppIcon({ size = 24, className = '', ...props }: AppIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {/* App Icon Squircle Background */}
      <rect width="64" height="64" rx="15" fill="#1E3A2F" />
      {/* Base Stone */}
      <rect x="16" y="40" width="32" height="11" rx="5.5" fill="#34D399" />
      {/* Middle Offset Stone */}
      <rect x="20" y="27" width="22" height="10" rx="5" transform="rotate(-4 20 27)" fill="#6EE7B7" />
      {/* Top Tiny Crown Stone */}
      <circle cx="33" cy="18" r="5" fill="#FBBF24" />
    </svg>
  );
}
