# 🌱 Tiny Steps — Low-Friction AI Task Decompressor

> **A quiet, distraction-free task decompressor that unpacks ambiguous, sprawling, or intimidating goals into logical, bite-sized next actions.**

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

Traditional productivity tools (Todoist, Notion, Jira) are designed for organized minds operating at high energy. When you are experiencing burnout, ADHD inertia, or executive overload:
* **Long lists cause paralysis**: Seeing 15 items triggers immediate cognitive shutdown.
* **Guilt mechanics backfire**: Overdue badges, streaks, and countdowns create shame and avoidance.
* **Goals are too vague**: "Work on developer competition", "Clean the room", or "Tackle taxes" requires too much working memory just to identify step #1.

### Core Principles:
> **"Lower the activation energy until starting is easier than avoiding."**

1. **Quiet Competence & Adult Respect**: Tiny Steps acts as a sharp, pragmatic thinking partner. It speaks with calm clarity—never patronizing, never cheerleading (*"You got this!"*), and never playing the role of a therapist.
2. **Substance Over Meta-Work**: Jump straight into the actual goal. Strictly no bureaucratic prep chores (*"Open a blank document"*, *"Find writing app"*, *"Take a seat"*, *"Close the document tab"*).
3. **Cognitive Decompression**:
   * **Decisions & Ideation**: Micro-filter decision trees (pick 1 familiar constraint ➔ write 2 raw ideas ➔ eliminate scope risk ➔ define core concept).
   * **Massive Projects**: Isolate one bounded starter win. Never pretend a 10-hour project finishes in 4 steps.
4. **Straight-Up Refusals (Zero Emergency Responsibility)**:
   * Tiny Steps is strictly an everyday task decomposition tool. It straight-up refuses any prompts expressing crisis, hopeless despair, or self-harm without emotional roleplay, directing users immediately to free 24/7 lifelines (Call/text 988, text HOME to 741741).
   * Refuses direct academic cheating (solving homework or writing full essays), instead scaffolding the user's execution workflow.

---

## ✨ Key Features

### 1. 📋 The Single Living Task Card (Anti-Overwhelm)
* **Domain-Driven Architecture**: Backed by a clean, first-class `Task` and `Step` model rather than a legacy chatbot transcript.
* **In-Place Guidance & Adaptation**: Tweaking or venting uses the **Adaptive Task Navigator** to surgically modify specific steps or reroute blockers without stacking duplicate checklists or noisy message bubbles.
* **Task Identity Immutability**: The task's overall mission title and original empathetic guidance remain permanent and unpolluted.
* **Preserves Progress**: Completed steps remain checked off; only the active or targeted pending steps adjust.

### 2. 🎯 Centered Hero & Adaptive In-Situ Copilot
* **Empty State**: The prompt input is centered directly under the greeting, inviting step #1 with zero visual noise.
* **Active Working Mode**: Once steps are generated, the input collapses into a quiet bottom chip (`Need to tweak or vent?`), keeping 98% of the screen clear for execution. Click anytime to expand and adjust.
* **Persistent Execution Context**: Submitting a tweak keeps the sheet open with an inline `<SpinnerGap>` on the send button, preventing jarring collapses while you work through reality friction.
* **Surgical Step & Sub-Step Surgery**: The assistant has complete hierarchical awareness (`[COMPLETED]`, `[CURRENT / ACTIVE]`, `[UPCOMING]`), allowing precise sub-step edits (`modifySubStep`), constraint substitutions (`reroute_constraint`), or step deletions (`removeStep`).

### 3. 🎚️ Elastic Sensitivity Modes
Users experience task resistance differently depending on their daily energy:
* **A little stuck**: Direct, manageable chunks for baseline energy (`Plant` icon). 3–6 adaptive steps for structured momentum.
* **Overwhelmed (Default)**: Low-friction starter steps to break through mental fog (`Leaf` icon). 3–5 gentle, focused steps with zero artificial filler.
* **Full paralysis**: Ultra-small initial actions to break inertia with zero pressure (`PottedPlant` icon). Strictly capped at 4 micro-actions.

### 4. ✨ On-Demand Step Shrinking ("Still too big?")
If any step triggers hesitation or resistance, click **"Break it down"** to split it dynamically into 3 bite-sized pieces following the **Prep ➔ Starter ➔ Checkpoint** formula:
1. **Prep**: Make direct contact with the primary workspace or file.
2. **Starter**: Complete just the easiest 1–2 minute slice of substance.
3. **Checkpoint**: Reach a solid stopping point with momentum established.

### 5. ◎ Focus Tunnel (Monotasking Mode)
* A full-screen, distraction-free view isolating the present task in large bold typography.
* Optical blur-dissolve morphs smooth transitions between step completions.
* Newly created tasks open directly into the tunnel after a calm, text-only loading transition.
* Controlled via keyboard shortcuts (`Space` or `Enter` to advance, `S` to shrink).
* Clean celebration screen upon completion (*"All steps complete. You turned initial friction into momentum."*).

### 6. 👁️ Progressive Disclosure (Anti-Scan Panic)
* Future steps in the 3-column workspace (Now, Next, Later) are softly blurred by default (`future-step-blur`) to prevent scanning ahead and feeling overwhelmed.
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
* Powered by the **Vercel AI SDK** (`ai` v7) and **Vercel AI Gateway** (`@ai-sdk/gateway` v4) with default model **`google/gemini-2.5-flash-lite`** (high accuracy, structured JSON compliance, ~3.7s latency).
* Configurable reasoning effort via `AI_REASONING_EFFORT` (`low` by default, `high`, or disabled).
* Fully configurable via `.env.local` (`AI_GATEWAY_API_KEY`, `AI_MODEL`, `AI_REASONING_EFFORT`).
* **100% Offline-Safe**: If unauthenticated or offline, seamlessly falls back to the deterministic local engine with zero UI errors or broken states.
* State persists safely to `localStorage` with automated migration guards.

---

## 🕘 Recent Updates

| Commit | Change |
| :--- | :--- |
| `730a775` | **Concise Character Bounds**: Enforced strict 18–32 char titles, stripped trailing periods, and concise $\le 10$-word instructions on assistant steps. |
| `e1db2f2` | **Persistent Input & Button Spinner**: Kept assistant input open on submit, placed spinner on enter button, and removed redundant loader below acknowledgment. |
| `6a94cb1` | **Adaptive Task Navigator**: Implemented surgical step/sub-step mutations, full tree serialization, constraint rerouting, and task identity immutability. |
| `c3de0f8` | **Quiet Competence Persona**: Aligned AI persona and app microcopy with pragmatic task decompressor; de-therapized offline presets and UI completion cards. |
| `086bbf6` | **Universal Prompts**: Replaced niche pseudo-academic jargon with universal substance-first task and decision decomposition prompts. |
| `0d34431` | **Gemini 2.5 Flash Lite & Benchmark Suite**: Adopted `google/gemini-2.5-flash-lite`, added configurable `AI_REASONING_EFFORT` env helper, and added gateway benchmarking suite. |
| `8555e8b` | **Smooth Deletion Transition**: Fixed layout shift in the history drawer with an animated height collapse and internal spacing wrapper. |
| `672788a` | **Domain Schema Migration**: Migrated from legacy chat session to a domain-driven `Task` and `Step` model with 2-level store addressing. |
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
| **Vercel AI SDK 7 & Gateway** | Gateway client (`@ai-sdk/gateway`) driving `google/gemini-2.5-flash-lite` with structured output schemas |
| **Tailwind CSS v4** | 100% tokenized CSS variable architecture (`globals.css`) with zero hardcoded theme colors |
| **Zustand 5.0** | Centralized, hydration-safe reactive task store with local persistence & auto-migration |
| **Framer Motion 14** | Physics-based spring animations, checkmark transitions, and modal choreographies |
| **Phosphor Icons 2.1** | Sensory-friendly, modern, and minimal icons across all controls |
| **Oxlint 1.89** | Rust-based linter that scans the entire codebase in ~30ms |

---

## 📂 Project Structure

```text
src/
├── app/
│   │   ├── api/
│   │   │   ├── breakdown/route.ts     # Task decomposition endpoint (structured JSON output)
│   │   │   ├── shrink/route.ts        # Step breakdown endpoint (3 micro-actions)
│   │   │   └── assistant/route.ts     # Conversational session intent classification
│   │   ├── layout.tsx                 # Root layout (Plus Jakarta Sans, globals.css tokens, theme script)
│   │   ├── icon.svg                   # Dynamic SVG tab favicon (stepping stones cairn)
│   │   ├── page.tsx                   # Root redirect -> /tasks (handled at edge in next.config.ts)
│   │   ├── tasks/
│   │   │   ├── layout.tsx             # Persistent shell layout wrapper
│   │   │   ├── page.tsx               # Task creator page (/tasks)
│   │   │   └── [id]/
│   │   │       └── page.tsx           # Dedicated task breakdown with PPR (/tasks/[id])
│   │   └── globals.css                # Semantic design tokens (colors, radii, shadows, typography)
│   │
│   ├── components/
│   │   ├── start/
│   │   │   ├── hero-welcome.tsx       # Centered empty state greeting with cairn icon
│   │   │   ├── energy-selector.tsx    # Tactile energy sensitivity pills (1-3)
│   │   │   └── start-client.tsx       # Client orchestrator for /tasks
│   │   │
│   │   ├── task-breakdown/
│   │   │   ├── task-breakdown-client.tsx # Dynamic task breakdown client orchestrator for /tasks/[id]
│   │   │   ├── task-card.tsx          # 3-column Now / Next / Later spatial task workspace
│   │   │   ├── now-card.tsx           # Orchestrator for the active "Now" task step
│   │   │   ├── now-components/        # Decomposed sub-components for NowCard
│   │   │   │   ├── now-card-header.tsx    # Step count indicator and out-of-order return pill
│   │   │   │   ├── now-completed-card.tsx # "All steps complete" celebration card
│   │   │   │   ├── step-visibility-toggle.tsx # Crossfading "Show/Hide micro-steps" toggle
│   │   │   │   ├── now-micro-steps.tsx    # Nested micro-step accordion checklist
│   │   │   │   └── index.ts           # Barrel export
│   │   │   ├── next-card.tsx          # Upcoming steps card
│   │   │   ├── later-card.tsx         # Remaining steps card with completed toggle
│   │   │   ├── focus-tunnel-modal.tsx # Distraction-free single-task execution modal
│   │   │   └── peek-toggle.tsx        # Floating round future-step blur/unblur toggle
│   │   │
│   │   └── shared/
│   │       ├── app-icon.tsx           # Reusable cairn app icon with balancing teeter animation
│   │       ├── chat-input.tsx         # Adaptive input (centered pill / collapsible bottom chip)
│   │       ├── confirm-dialog.tsx     # Accessible modal dialog with focus trapping for deletion
│   │       ├── focus-loader.tsx       # Text-only start transition & safety support notice dialog
│   │       ├── theme-toggle-fab.tsx   # Bottom-left floating action button for sensory light/dim mode
│   │       └── layout/
│   │           ├── tasks-layout-client.tsx # Persistent layout shell (header, drawer, loader, tunnel)
│   │           ├── app-header.tsx     # Header with home, history trigger & focus tunnel launcher
│   │           └── history-drawer.tsx # Accessible slide-over task history drawer
│   │
│   ├── constants/
│   │   ├── animation.ts               # Universal Framer Motion variants & spring configurations
│   │   └── presets.ts                 # Clean task momentum templates with optional step hints
│   │
│   ├── lib/
│   │   ├── ai/
│   │   │   ├── gateway.ts             # Vercel AI Gateway model resolution & reasoning effort config
│   │   │   └── prompts.ts             # Quiet competence system persona & domain decomposition prompts
│   │   ├── assistant-engine.ts        # Deterministic offline fallback engine & intent classifier
│   │   ├── task-generation.ts         # Async breakdown seam with loader timing constants
│   │   ├── task-utils.ts              # Pure task getters and date formatting
│   │   └── session-utils.ts           # Backward-compatibility alias re-exports
│   │
│   ├── hooks/
│   │   ├── use-start-task.ts          # Start orchestration, minimum dwell, and fallback handling
│   │   ├── use-shrink-step.ts         # Micro-step breakdown timer and trigger handling
│   │   ├── use-task-card.ts           # Spatial task sequence, out-of-order, and completion derivations
│   │   ├── use-history-drawer.ts      # History drawer focus management, tab trapping, and deletion
│   │   ├── use-keyboard-shortcuts.ts  # Global Ctrl+K, Ctrl+H, Space, and Enter listeners
│   │   └── use-hydrated.ts            # React 19 useSyncExternalStore hydration listener
│   │
│   ├── store/
│   │   └── task-store.ts              # Persisted Zustand state (tasks, active step updates & migrations)
│   │
│   └── types/
│       └── task.ts                    # Strongly-typed data models (Task, Step, EnergyLevel)
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

### 2. Environment Configuration
Copy the template and configure your Vercel AI Gateway credentials:
```bash
cp .env.example .env.local
```

In `.env.local`:
```env
AI_GATEWAY_API_KEY=your_vercel_ai_gateway_api_key_here
AI_MODEL=google/gemini-2.5-flash-lite
AI_REASONING_EFFORT=low
```

### 3. Development Server
Start the Next.js development server powered by Turbopack:
```bash
bun run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Native Typechecking & Fast Linting
Validate TypeScript and Oxlint rules in sub-second multi-core passes:
```bash
bun run check  # Multi-threaded native typecheck (~250ms)
bun run lint   # Oxlint static analysis (~30ms)
```

### 5. Automated AI Evaluation Suite
Run the 29-scenario benchmark suite covering real-world tasks, boundary refusals, and adversarial stress tests:
```bash
bun run scripts/eval-suite.ts            # Run full evaluation suite
bun run scripts/eval-suite.ts --relevant # Run only real-world human tasks
bun run scripts/eval-suite.ts --stress   # Run adversarial panic dump stress tests
```

### 6. Production Build
Create an optimized production bundle:
```bash
bun run build
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Ctrl + K` / `Cmd + K` | Start a new task session |
| `Ctrl + H` / `Cmd + H` | Toggle task history drawer |
| `Escape` | Close history drawer / dialogs / focus tunnel |
| `Enter` (in input) | Send prompt / decompose task |
| `Shift + Enter` (in input) | Insert a newline |
| `Space` / `Enter` (in Focus Tunnel) | Advance to next step |
| `S` (in Focus Tunnel) | Shrink current step into 3 micro-actions |

---

## 🎯 The Permission Slip

> *"Doing just one tiny step and stopping is still momentum established."*

---

## 📄 License
MIT License. Created with care for anyone who ever felt overwhelmed by a sprawling task.
