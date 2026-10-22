import type { SVGProps } from 'react';

interface AppIconProps extends SVGProps<SVGSVGElement> {
  size?: number;
  animated?: boolean;
}

export function AppIcon({
  size = 24,
  animated = false,
  className = '',
  ...props
}: AppIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`cairn-svg ${animated ? 'anim-2' : ''} ${className}`.trim()}
      {...props}
    >
      {animated && (
        <style>{`
          .cairn-svg .cairn-group { transform-box: view-box; transform-origin: 32px 35px; }
          .cairn-svg .stone-base { transform-box: view-box; transform-origin: 32px 45.5px; }
          .cairn-svg .stone-mid { transform-box: view-box; transform-origin: 31px 32px; }
          .cairn-svg .stone-top { transform-box: view-box; transform-origin: 33px 18px; }
          .anim-2 .stone-base {
            animation: teeter-base 3.2s ease-in-out infinite;
          }
          .anim-2 .stone-mid {
            animation: teeter-mid 3.2s ease-in-out infinite;
          }
          .anim-2 .stone-top {
            animation: teeter-top 3.2s ease-in-out infinite;
          }
          @keyframes teeter-base {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-2deg); }
            75% { transform: rotate(2deg); }
          }
          @keyframes teeter-mid {
            0%, 100% { transform: rotate(0deg) translateX(0); }
            25% { transform: rotate(-9deg) translateX(-2px) translateY(-1px); }
            50% { transform: rotate(2deg) translateX(0.5px); }
            75% { transform: rotate(12deg) translateX(2.5px) translateY(-1px); }
          }
          @keyframes teeter-top {
            0%, 100% { transform: translate(0px, 0px); }
            25% { transform: translate(-7px, 1.5px); }
            32% { transform: translate(-7.8px, 2px); }
            50% { transform: translate(1px, 0px); }
            75% { transform: translate(6.5px, 1px); }
            82% { transform: translate(7.2px, 1.8px); }
          }
        `}</style>
      )}
      {/* App Icon Squircle Background */}
      <rect width="64" height="64" rx="15" fill="#1E3A2F" />
      <g className="cairn-group">
        {/* Base Stone */}
        <g className="stone-base">
          <rect x="16" y="40" width="32" height="11" rx="5.5" fill="#34D399" />
        </g>
        {/* Middle Offset Stone */}
        <g className="stone-mid">
          <rect x="20" y="27" width="22" height="10" rx="5" transform="rotate(-4 20 27)" fill="#6EE7B7" />
        </g>
        {/* Top Tiny Crown Stone */}
        <g className="stone-top">
          <circle cx="33" cy="18" r="5" fill="#FBBF24" />
        </g>
      </g>
    </svg>
  );
}
