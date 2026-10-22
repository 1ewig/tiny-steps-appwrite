'use client';

import type { ComponentType } from 'react';
import type { IconProps } from '@phosphor-icons/react';
import { Plant, Leaf, PottedPlant } from '@phosphor-icons/react';
import type { GranularityLevel } from '@/types/task';

interface EnergySelectorProps {
  currentLevel: GranularityLevel;
  onSelect: (level: GranularityLevel) => void;
  disabled?: boolean;
}

interface EnergyOption {
  level: GranularityLevel;
  icon: ComponentType<IconProps>;
  label: string;
  description: string;
}

const ENERGY_OPTIONS: EnergyOption[] = [
  {
    level: 1,
    icon: Plant,
    label: 'A little stuck',
    description: 'Clear, manageable ~2–5 min chunks for moderate energy.',
  },
  {
    level: 2,
    icon: Leaf,
    label: 'Overwhelmed',
    description: 'Gentle ~1 min pieces with calm reassurance. Zero pressure.',
  },
  {
    level: 3,
    icon: PottedPlant,
    label: 'Full paralysis',
    description: 'Absurdly tiny 5–30 second micro-actions (e.g. "touch one item").',
  },
];

export function EnergySelector({
  currentLevel,
  onSelect,
  disabled = false,
}: EnergySelectorProps) {
  const selectedOption =
    ENERGY_OPTIONS.find((opt) => opt.level === currentLevel) || ENERGY_OPTIONS[1];

  return (
    <div className="w-full flex flex-col items-center space-y-2.5 pt-1 chat-enter">
      <div className="flex items-center gap-1.5 text-xs text-text-tertiary font-medium">
        <span>Current energy level:</span>
      </div>

      {/* Pill options */}
      <div
        role="radiogroup"
        aria-label="Energy sensitivity level"
        className="flex flex-wrap items-center justify-center gap-2"
      >
        {ENERGY_OPTIONS.map((opt) => {
          const isSelected = opt.level === currentLevel;
          const Icon = opt.icon;

          return (
            <button
              key={opt.level}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onSelect(opt.level)}
              className={`group flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-medium border transition-all duration-fast select-none active:scale-95 disabled:opacity-50 disabled:pointer-events-none ${
                isSelected
                  ? 'bg-accent-subtle text-accent-text border-accent/40 shadow-subtle ring-1 ring-accent/30 font-semibold'
                  : 'bg-surface hover:bg-surface-subtle text-text-secondary hover:text-text-primary border-border-subtle hover:border-border-muted shadow-2xs'
              }`}
            >
              <Icon
                size={16}
                weight={isSelected ? 'fill' : 'regular'}
                className={`transition-colors shrink-0 ${
                  isSelected ? 'text-accent' : 'text-text-tertiary group-hover:text-text-secondary'
                }`}
              />
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>

      {/* Empathetic subtitle description */}
      <p className="text-2xs sm:text-xs text-text-tertiary text-center max-w-md italic transition-all duration-normal">
        {selectedOption.description}
      </p>
    </div>
  );
}
