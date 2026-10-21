'use client';

import { motion } from 'framer-motion';

interface HeroWelcomeProps {
  onSelectPreset: (promptText: string) => void;
}

const STARTER_PROMPTS = [
  {
    icon: '☕',
    title: 'Clear my messy desk',
    desc: 'Tackle dishes, cups, and paper piles without moving everything.',
    prompt: 'Clear my messy desk',
  },
  {
    icon: '✉️',
    title: 'Reply to an avoided message',
    desc: 'Write a guilt-free 1-sentence draft and hit send immediately.',
    prompt: 'Reply to an overdue email I am dreading',
  },
  {
    icon: '🧺',
    title: 'Tackle the laundry monster',
    desc: 'Just put 3 things in the basket. No folding required today.',
    prompt: 'Deal with the laundry pile',
  },
  {
    icon: '🧠',
    title: 'Help me unfreeze my brain',
    desc: 'Brain-dump everything that is stressing you out right now.',
    prompt: 'I have 10 things to do and I am completely overwhelmed and frozen',
  },
];

export function HeroWelcome({ onSelectPreset }: HeroWelcomeProps) {
  return (
    <div className="space-y-8 py-6 sm:py-10 text-center sm:text-left chat-enter">
      {/* Hero Headline & Badge */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent-subtle text-accent-text text-xs font-semibold">
          <span className="w-2 h-2 rounded-full bg-accent orb-pulse" />
          <span>Zero-Pressure Executive Function Assistant</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-text-primary leading-tight">
          What feels heavy right now?
        </h1>

        <p className="text-text-secondary text-sm sm:text-base max-w-lg leading-relaxed">
          Tell me what you are avoiding, or vent your raw thoughts. I will shrink it down into microscopic, zero-guilt
          actions.
        </p>
      </div>

      {/* Starter Cards Grid */}
      <div className="space-y-2.5 text-left">
        <p className="text-2xs font-semibold text-text-tertiary uppercase tracking-wider px-1">
          Popular starting points (1-click)
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {STARTER_PROMPTS.map((item, index) => (
            <motion.button
              key={index}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectPreset(item.prompt)}
              className="group p-4 rounded-xl bg-surface border border-border-subtle hover:border-accent shadow-subtle hover:shadow-card text-left transition-all flex items-start gap-3.5"
            >
              <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
              <div className="space-y-0.5">
                <div className="text-xs sm:text-sm font-semibold text-text-primary group-hover:text-accent transition-colors">
                  {item.title}
                </div>
                <div className="text-2xs text-text-secondary leading-snug">{item.desc}</div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
