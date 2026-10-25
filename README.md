# 🌱 Tiny Steps — Low-Friction AI Task Companion

> **An empathetic, zero-pressure task decomposition companion designed for ADHD paralysis, burnout, and executive dysfunction.**

[![Next.js 16.4.2](https://img.shields.io/badge/Next.js-16.4.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.3-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript 7](https://img.shields.io/badge/TypeScript-7.0.2-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Bun 1.4](https://img.shields.io/badge/Bun-1.4.3-FBF0DF?style=flat-square&logo=bun)](https://bun.sh/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/State-Zustand_5-brown?style=flat-square)](https://github.com/pmndrs/zustand)
[![Framer Motion](https://img.shields.io/badge/Motion-Framer_14-black?style=flat-square&logo=framer)](https://www.framer.com/motion/)
[![Phosphor Icons](https://img.shields.io/badge/Icons-Phosphor_2-blueviolet?style=flat-square)](https://phosphoricons.com/)
[![Oxlint](https://img.shields.io/badge/Linter-Oxlint_1.89-orange?style=flat-square)](https://oxc.rs/)

---

## 💡 The Philosophy Behind Tiny Steps

Traditional productivity apps (Todoist, Notion, Jira) are designed for organized minds operating at high energy. When you are experiencing burnout or executive dysfunction:
* **Long lists cause panic**: Seeing 15 items triggers an amygdala freeze response.
* **Guilt mechanics backfire**: Overdue badges and broken streaks create shame and avoidance.
* **Tasks are too vague**: "Clean the room" or "Work on taxes" requires too much working memory just to identify step #1.

### The Core Thesis:
> **"Lower the activation energy until refusal is harder than starting."**

Action does not follow motivation; **motivation follows microscopic physical momentum**. If an action takes only 10–30 seconds (*"Touch one wrapper"*, *"Put feet flat on the floor"*, *"Type 'Hi' in the email draft"*), the brain does not perceive it as a threat. Once the paralysis breaks, forward momentum takes over naturally.

---

## ✨ Key Features

### 1. 📋 The Single Living Task Card (Anti-Overwhelm)
* **Domain-Driven Architecture**: Backed by a clean, first-class `Task` and `Step` model rather than a legacy chatbot transcript.
* **In-Place Guidance & Adaptation**: Tweaking or venting updates the **existing card guidance in-place** instead of stacking duplicate checklists or noisy message bubbles.
* **Preserves Progress**: Completed steps remain checked off; only the pending steps adjust.

### 2. 🎯 Centered Hero & Collapsible Tweak Chip
* **Empty State**: The prompt input is centered directly under the gentle greeting, inviting step #1 with zero visual noise.
* **Active Working Mode**: Once steps are generated, the input collapses into a quiet bottom chip (`Need to tweak or vent?`), keeping 98% of the screen clear for execution. Click anytime to expand and adjust.

### 3. 🎚️ Elastic Sensitivity Modes
Users experience task resistance differently depending on their daily energy:
* **A little stuck**: 3–6 adaptive steps for manageable momentum (`Plant` icon). Accommodates natural beginnings, middles, and complete closures without artificial truncation.
* **Overwhelmed (Default)**: 3–5 gentle steps with warm reassuring tone (`Leaf` icon). Balanced starter slice with zero artificial filler.
* **Full paralysis**: 2–4 absurdly tiny micro-actions (*"Exhale slowly. You only have to do 10 seconds of motion right now"*, `PottedPlant` icon). Strictly capped at 4 steps to break the physical freeze without threat.

### 4. ✨ On-Demand Step Shrinking ("Still too big?")
If any step triggers hesitation or fear, click **"Break it down"** to split it dynamically into 3 bite-sized pieces following the **Prep ➔ Touch ➔ Finish** formula:
1. **Prep**: Glance at or reach for what you need (zero pressure to work).
2. **Touch**: Do just the first 15–20 seconds.
3. **Finish**: Complete just that piece cleanly.

### 5. ◎ Focus Tunnel (Monotasking Mode)
* A full-screen, distraction-free view isolating the present task in large bold typography.
* Optical blur-dissolve morphs smooth transitions between step completions.
* Newly created tasks open directly into the tunnel after a calm, text-only loading transition.
* Controlled via keyboard shortcuts (`Space` or `Enter` to advance, `S` to shrink).
* Gentle celebration screen upon completion (*"Take a breath and unclench your jaw. You turned something heavy into momentum"*).

### 6. 👁️ Progressive Disclosure (Anti-Scan Panic)
* Future steps in the 3-column workspace (Now, Next, Later) are softly blurred by default (`future-step-blur`) to prevent scanning ahead and quitting.
* Hovering a blurred step reveals it after an intentional delay; active steps display optional calming whisper hints.
* Floating toggle button to unblur future steps whenever you feel ready.

### 7. 📜 Accessible Task History Drawer
* Slide-over history panel with active session highlights and animated micro progress momentum bars.
* Zero layout shift deletion: Height collapses smoothly so tasks below glide upward continuously.
* Accessible focus management: Tab trapping and sensory [`ConfirmDialog`](src/components/shared/confirm-dialog.tsx) to prevent accidental loss.

### 8. 🎨 Sensory-Friendly Design System
* Warm oatmeal canvas, gentle sage green accents, and a soothing **Dim Mode** toggle.
* Zero harsh alert reds, countdown clocks, or aggressive urgency triggers.
* 100% tokenized design system (`globals.css`) with `@media (prefers-reduced-motion)` accessibility support.

### 9. 🤖 Live LLM via Vercel AI Gateway & Offline Resilience
* Powered by the **Vercel AI SDK** (`ai` v7) and **Vercel AI Gateway** (`@ai-sdk/gateway` v4) with default model `minimax/minimax-m3.1-flash` (ultra-fast, empathetic).
* Fully configurable via `.env.local` (`AI_GATEWAY_API_KEY`, `AI_MODEL`).
* **100% Offline-Safe**: If unauthenticated or offline, seamlessly falls back to the deterministic local engine with zero UI errors or broken states.
* State persists safely to `localStorage` with automated migration guards.

---

## 🕘 Recent Updates

| Commit | Change |
| :--- | :--- |
| `8555e8b` | **Smooth Deletion Transition**: Fixed layout shift in the history drawer with an animated height collapse and internal spacing wrapper. |
| `672788a` | **Domain Schema Migration**: Migrated from legacy chat session (`ChatSession`, `ChatMessage`, `messages[]`) to a domain-driven `Task` and `Step` model with 2-level store addressing. |
| `8eef744` | **Hook Alignment**: Renamed `useDelayedShrink` to `useShrinkStep` for symmetry with `useStartTask`; eliminated the `useOfflineAssistant` pseudo-hook. |
| `2143d48` | **Component Decomposition**: Decomposed `NowCard` into a dedicated `now-components/` folder (`now-card-header`, `now-completed-card`, `step-visibility-toggle`, `now-micro-steps`). |
| `eb3edd0` | **Optical Text Morphs**: Added 0.5s optical blur-dissolve morph transitions for step completions in the Focus Tunnel. |
| `4ee317c` | **Layout Stability**: Prevented task start layout shifts and harmonized the history button entrance animation. |

---

## 🛠️ Tech Stack & Architecture

| Technology | Role |
| :--- | :--- |
| **Next.js 16.4.2** | App Router with Turbopack, React Server Components (RSC) & Partial Prerendering (PPR) |
| **React 19.3.0** | Server Components, Actions, and `useSyncExternalStore` for hydration safety |
| **TypeScript 7.0.2** | Microsoft's native Go-based multi-threaded compiler (10x faster build times) |
| **Bun 1.4.3** | High-performance JavaScript runtime, package manager, and native typechecker |
| **Tailwind CSS v4** | 100% tokenized CSS variable architecture (`globals.css`) with zero hardcoded theme colors |
| **Zustand 5.0** | Centralized, hydration-safe reactive task store with local persistence & auto-migration |
| **Framer Motion 14** | Physics-based spring animations, checkmark transitions, and modal choreographies |
| **Phosphor Icons 2.1** | Sensory-friendly, modern, and minimal icons across all controls |
| **Oxlint 1.89** | Rust-based linter that scans the entire codebase in ~25ms |

---

## 📂 Project Structure

```text
src/
├── app/
│   ├── layout.tsx                     # Root layout (Plus Jakarta Sans, globals.css tokens, theme script)
│   ├── icon.svg                       # Dynamic SVG tab favicon (stepping stones cairn)
│   ├── page.tsx                       # Root redirect -> /tasks (handled at edge in next.config.ts)
│   ├── tasks/
│   │   ├── layout.tsx                 # Persistent shell layout wrapper
│   │   ├── page.tsx                   # Task creator page (/tasks)
│   │   └── [id]/
│   │       └── page.tsx               # Dedicated task breakdown with PPR (/tasks/[id])
│   └── globals.css                    # Semantic design tokens (colors, radii, shadows, typography)
│
├── components/
│   ├── start/
│   │   ├── hero-welcome.tsx           # Centered empty state greeting with cairn icon
│   │   ├── energy-selector.tsx        # Tactile energy sensitivity pills (1-3)
│   │   └── start-client.tsx           # Client orchestrator for /tasks
│   │
│   ├── task-breakdown/
│   │   ├── task-breakdown-client.tsx  # Dynamic task breakdown client orchestrator for /tasks/[id]
│   │   ├── task-card.tsx              # 3-column Now / Next / Later spatial task workspace
│   │   ├── now-card.tsx               # Orchestrator for the active "Now" task step
│   │   ├── now-components/            # Decomposed sub-components for NowCard
│   │   │   ├── now-card-header.tsx    # Step count indicator and out-of-order return pill
│   │   │   ├── now-completed-card.tsx # "You made it through" celebration view
│   │   │   ├── step-visibility-toggle.tsx # Crossfading "Show/Hide micro-steps" toggle
│   │   │   ├── now-micro-steps.tsx    # Nested micro-step accordion checklist
│   │   │   └── index.ts               # Barrel export
│   │   ├── next-card.tsx              # Upcoming steps card
│   │   ├── later-card.tsx             # Remaining steps card with completed toggle
│   │   ├── focus-tunnel-modal.tsx     # Distraction-free single-task execution modal
│   │   └── peek-toggle.tsx            # Floating round future-step blur/unblur toggle
│   │
│   └── shared/
│       ├── app-icon.tsx               # Reusable cairn app icon with balancing teeter animation
│       ├── chat-input.tsx             # Adaptive input (centered pill / collapsible bottom chip)
│       ├── confirm-dialog.tsx         # Accessible modal dialog with focus trapping for deletion
│       ├── focus-loader.tsx           # Text-only full-screen start transition with rotating copy
│       ├── theme-toggle-fab.tsx       # Bottom-left floating action button for sensory light/dim mode
│       └── layout/
│           ├── tasks-layout-client.tsx # Persistent layout shell (header, drawer, loader, tunnel)
│           ├── app-header.tsx         # Header with home, history trigger & focus tunnel launcher
│           └── history-drawer.tsx     # Accessible slide-over task history drawer
│
├── constants/
│   ├── animation.ts                   # Universal Framer Motion variants & spring configurations
│   └── presets.ts                     # Task decomposition templates with optional step hints
│
├── lib/
│   ├── assistant-engine.ts            # Pure domain logic (decomposition, intent parsing, micro-steps)
│   ├── task-generation.ts             # Async breakdown seam with loader timing constants
│   ├── task-utils.ts                  # Pure task getters and date formatting
│   └── session-utils.ts               # Backward-compatibility alias re-exports
│
├── hooks/
│   ├── use-start-task.ts              # Start orchestration, minimum dwell, and fallback handling
│   ├── use-shrink-step.ts             # Micro-step breakdown timer and trigger handling
│   ├── use-task-card.ts               # Spatial task sequence, out-of-order, and completion derivations
│   ├── use-history-drawer.ts          # History drawer focus management, tab trapping, and deletion
│   ├── use-keyboard-shortcuts.ts      # Global Ctrl+K, Ctrl+H, Space, and Enter listeners
│   └── use-hydrated.ts                # React 19 useSyncExternalStore hydration listener
│
├── store/
│   └── task-store.ts                  # Persisted Zustand state (tasks, active step updates & migrations)
│
└── types/
    └── task.ts                        # Strongly-typed data models (Task, Step, EnergyLevel)
```

---

## 🚀 Getting Started

### Prerequisites
* [Bun](https://bun.sh/) (v1.4+ recommended)

### 1. Installation
Clone the repository and install dependencies using Bun:
```bash
bun install
```

### 2. Development Server
Start the Next.js development server powered by Turbopack:
```bash
bun run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Native Typechecking
Run Bun's multi-core typechecker:
```bash
bun run check
```
*(Runs in ~200ms across all files!)*

### 4. Fast Linting
Run Oxlint across the codebase:
```bash
bun run lint
```
*(Runs in ~30ms with 148+ rules!)*

### 5. Production Build
Create an optimized production build:
```bash
bun run build
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + K` / `Cmd + K` | Start a new gentle task session |
| `Ctrl + H` / `Cmd + H` | Toggle task history drawer |
| `Escape` | Close task history drawer / confirmation dialog / modals |
| `Enter` (in input) | Send prompt / decompose task |
| `Shift + Enter` (in input) | Insert a newline |
| `Space` / `Enter` (in Focus Tunnel) | Mark current micro-step done and advance |
| `S` (in Focus Tunnel) | Shrink current step into 3 micro-actions |

---

## 💚 The Permission Slip

> *"Doing just one tiny step and stopping is still a complete win."*

---

## 📄 License
MIT License. Created with care for anyone who ever felt overwhelmed by a to-do list.
