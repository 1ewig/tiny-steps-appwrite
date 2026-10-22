interface HeroWelcomeProps {
  onSelectPreset?: (presetText: string) => void;
}

const PRESET_QUICK_ACTIONS = [
  { icon: '🧹', label: 'Clear messy desk', prompt: 'Clear my messy desk' },
  { icon: '✉️', label: 'Reply to email', prompt: 'Reply to an overdue email' },
  { icon: '🧺', label: 'Laundry pile', prompt: 'Deal with the laundry pile' },
  { icon: '🧠', label: 'Overwhelmed', prompt: "I'm overwhelmed with 10 things at once" },
];

export function HeroWelcome({ onSelectPreset }: HeroWelcomeProps = {}) {
  return (
    <div className="text-center max-w-xl mx-auto space-y-4 chat-enter">
      <div className="w-12 h-12 rounded-2xl bg-accent-subtle text-accent-text flex items-center justify-center text-2xl mx-auto shadow-subtle orb-pulse">
        🌱
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary leading-tight">
        What feels heavy right now?
      </h1>

      <p className="text-text-secondary text-sm sm:text-base leading-relaxed max-w-md mx-auto">
        Tell me what you are avoiding, or vent your raw thoughts. I will shrink it down into microscopic, zero-guilt actions.
      </p>

      {onSelectPreset && (
        <div className="pt-2">
          <div className="text-2xs font-semibold text-text-tertiary uppercase tracking-wider mb-2">
            Or pick a gentle starter
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {PRESET_QUICK_ACTIONS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => onSelectPreset(preset.prompt)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-subtle hover:bg-surface border border-border-subtle hover:border-accent/30 text-xs font-medium text-text-secondary hover:text-text-primary shadow-subtle hover:shadow-card transition-all active:scale-95"
              >
                <span>{preset.icon}</span>
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

