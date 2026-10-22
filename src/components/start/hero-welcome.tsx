'use client';

import { AppIcon } from '@/components/shared/app-icon';

export function HeroWelcome() {
  return (
    <div className="text-center max-w-xl mx-auto space-y-4 chat-enter">
      <div className="mx-auto flex items-center justify-center">
        <AppIcon size={52} className="shadow-subtle rounded-2xl" />
      </div>

      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary leading-tight">
        What feels heavy right now?
      </h1>

      <p className="text-text-secondary text-sm sm:text-base leading-relaxed max-w-md mx-auto">
        Brain-dump your thoughts. We&apos;ll make it tiny.
      </p>
    </div>
  );
}

