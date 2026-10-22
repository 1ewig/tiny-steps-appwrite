interface AmbientProgressProps {
  progressPercentage: number;
}

export function AmbientProgress({ progressPercentage }: AmbientProgressProps) {
  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-surface-subtle/80 z-toast overflow-hidden">
      <div
        className="h-full bg-accent rounded-r-full transition-all duration-700 ease-out"
        style={{ width: `${Math.min(100, Math.max(0, progressPercentage))}%` }}
        role="progressbar"
        aria-valuenow={progressPercentage}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  );
}
