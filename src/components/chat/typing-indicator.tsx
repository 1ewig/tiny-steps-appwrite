export function TypingIndicator() {
  return (
    <div className="flex items-start gap-3 chat-enter">
      <div className="w-8 h-8 rounded-xl bg-accent-subtle text-accent-text flex items-center justify-center shrink-0 text-sm">
        🌱
      </div>
      <div className="bg-surface border border-border-subtle rounded-xl px-4 py-3 flex items-center gap-1.5 shadow-subtle">
        <span className="w-1.5 h-1.5 rounded-full bg-accent dot-1" />
        <span className="w-1.5 h-1.5 rounded-full bg-accent dot-2" />
        <span className="w-1.5 h-1.5 rounded-full bg-accent dot-3" />
        <span className="text-xs text-text-tertiary ml-1.5">Shrinking into tiny pieces...</span>
      </div>
    </div>
  );
}
