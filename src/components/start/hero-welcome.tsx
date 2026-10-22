'use client';

import { Plant } from '@phosphor-icons/react';

export function HeroWelcome() {
  return (
    <div className="text-center max-w-xl mx-auto space-y-4 chat-enter">
      <div className="w-12 h-12 rounded-2xl bg-accent-subtle text-accent-text flex items-center justify-center mx-auto shadow-subtle orb-pulse">
        <Plant size={26} weight="duotone" className="text-accent" />
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary leading-tight">
        What feels heavy right now?
      </h1>

      <p className="text-text-secondary text-sm sm:text-base leading-relaxed max-w-md mx-auto">
        Tell me what you are avoiding, or vent your raw thoughts. I will shrink it down into microscopic, zero-guilt actions.
      </p>
    </div>
  );
}

