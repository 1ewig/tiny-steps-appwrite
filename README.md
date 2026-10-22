# 🌱 Tiny Steps — Low-Friction AI Task Companion

> **An empathetic, zero-pressure task decomposition companion designed for ADHD paralysis, burnout, and executive dysfunction.**

[![Next.js 16.4.2](https://img.shields.io/badge/Next.js-16.4.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.3-61dafb?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript 7](https://img.shields.io/badge/TypeScript-7.0.2-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Bun 1.4](https://img.shields.io/badge/Bun-1.4.3-FBF0DF?style=flat-square&logo=bun)](https://bun.sh/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Zustand](https://img.shields.io/badge/State-Zustand_5-brown?style=flat-square)](https://github.com/pmndrs/zustand)
[![Framer Motion](https://img.shields.io/badge/Motion-Framer_14-black?style=flat-square&logo=framer)](https://www.framer.com/motion/)
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
* **One Checklist Rule**: Tweaking or venting updates the **existing card in-place** instead of stacking duplicate checklists that cause panic.
* **Preserves Progress**: Completed steps remain checked off; only the pending steps adjust.
* **Distraction-Free Workspace**: No cluttered SMS-style chat bubbles or avatars. Just clean, validated guidance and your interactive checklist.

### 2. 🎯 Centered Hero & Collapsible Tweak Chip
* **Empty State**: The prompt input is centered directly under the gentle greeting, inviting step #1 with zero visual noise.
* **Active Working Mode**: Once steps are generated, the input collapses into a quiet bottom chip (`💬 Need to tweak or vent?`), keeping 98% of the screen clear for execution. Click anytime to expand and adjust.

### 3. 🎚️ Elastic Sensitivity Modes
Users experience task resistance differently depending on their daily energy:
* **🌱 A little stuck**: Clear, manageable 2–5 minute chunks.
* **🌿 Overwhelmed (Default)**: Small, gentle 1-minute steps with warm reassuring tone.
* **🪴 Full paralysis**: Absurdly tiny 5–30 second micro-actions (*"Exhale slowly. You only have to do 10 seconds of motion right now"*).

### 4. ✨ On-Demand Step Shrinking ("Still too big?")
If any step triggers hesitation or fear, click **"✨ Shrink this step"** to split it dynamically into 3 bite-sized pieces:
1. **Prep**: Glance at or reach for what you need (zero pressure to work).
2. **Touch**: Do just the first 15–20 seconds.
3. **Finish**: Complete just that piece cleanly.

### 5. ◎ Focus Tunnel (Monotasking Mode)
* A full-screen, distraction-free view isolating the present task in large bold typography.
* Controlled via keyboard shortcuts (`Space` or `Enter` to advance).
* Gentle celebration screen upon completion (*"Take a breath and unclench your jaw. You turned something heavy into momentum"*).

### 6. 👁️ Progressive Disclosure (Anti-Scan Panic)
* Future steps are softly blurred by default (`future-step-blur`) to prevent users from scanning ahead and quitting.
* Single-click header toggle to unblur future steps whenever you feel ready.

### 7. 🎨 Sensory-Friendly Design System
* Warm oatmeal canvas, gentle sage green accents, and a soothing **Dim Mode** toggle.
* Zero harsh alert reds, countdown clocks, or aggressive urgency triggers.
* Fully accessible with `@media (prefers-reduced-motion)` support.

### 8. 🔒 100% Offline & Private
* Requires **no API keys** and sends **no personal data** to external servers.
* All sessions and step progress are automatically saved to `localStorage`.

---

## 🛠️ Tech Stack & Architecture

Built with a high-performance modern web stack:

| Technology | Role |
| :--- | :--- |
| **Next.js 16.4.2** | App Router with Turbopack, React Server Components (RSC) & Partial Prefetching |
| **React 19.3.0** | Modern React with Server Components, Actions, and `useSyncExternalStore` |
| **TypeScript 7.0.2** | Microsoft's native Go-based multi-threaded compiler (10x faster build times) |
| **Bun 1.4.3** | Lightning-fast JavaScript runtime, package manager, and native typechecker |
| **Tailwind CSS v4** | 100% tokenized CSS variable architecture (`globals.css`) with zero hardcoded values |
| **Zustand 5.0** | Centralized, hydration-safe reactive state with local persistence |
| **Framer Motion 14** | Physics-based spring animations, checkmark animations, and modal transitions |
| **Oxlint 1.89** | Rust-based linter that scans the entire codebase in ~15ms |

---

## 📂 Project Structure

```text
src/
├── app/
│   ├── layout.tsx                     # Root layout (Plus Jakarta Sans, globals.css tokens)
│   ├── page.tsx                       # Root redirect -> /tasks (reserved for future landing page)
│   ├── tasks/
│   │   ├── page.tsx                   # Task launcher / new task creator (/tasks)
│   │   └── [id]/
│   │       └── page.tsx               # Dedicated task workspace with partial prerendering (/tasks/[id])
│   └── globals.css                    # Complete design tokens (colors, radii, shadows, typography)
│
├── components/
│   ├── launcher/
│   │   ├── hero-welcome.tsx           # Centered empty state greeting
│   │   └── task-launcher-client.tsx   # Launcher orchestrator for /tasks
│   │
│   ├── workspace/
│   │   ├── task-workspace-client.tsx  # Dynamic task workspace orchestrator for /tasks/[id]
│   │   ├── assistant-bubble.tsx       # Assistant guidance & living task card
│   │   ├── message-feed.tsx           # Auto-scrolling task feed
│   │   ├── steps-checklist.tsx        # Framer Motion animated checklist (Shrink / Skip / Done)
│   │   └── typing-indicator.tsx       # Calm shimmer dots
│   │
│   └── shared/
│       ├── chat-input.tsx             # Adaptive input (centered pill / collapsible bottom chip)
│       ├── focus/
│       │   └── focus-tunnel-modal.tsx # Distraction-free single-task execution modal
│       └── layout/
│           ├── tasks-layout-client.tsx # Persistent layout shell (header, sidebar, progress, modal)
│           ├── ambient-progress.tsx   # Top ambient progress bar
│           ├── app-header.tsx         # Header with title, peek toggle, sensitivity & tunnel launcher
│           └── sidebar.tsx            # Collapsible session drawer (history & theme)
│
├── constants/
│   └── presets.ts                     # Task decomposition templates (desk, email, laundry, braindump)
│
├── lib/
│   └── assistant-engine.ts            # Pure domain logic (decomposition, intent parsing, micro-steps)
│
├── hooks/
│   ├── use-offline-assistant.ts       # React hook adapter for assistant engine
│   └── use-keyboard-shortcuts.ts      # Global Ctrl+K, Space, and Enter listeners
│
├── store/
│   └── task-store.ts                  # Persisted Zustand state (multi-session & in-place step updates)
└── types/
    └── task.ts                        # Strongly-typed data models
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
*(Runs in ~120ms across all files!)*

### 4. Fast Linting
Run Oxlint across the codebase:
```bash
bun run lint
```
*(Runs in ~15ms with 148+ rules!)*

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
| `Enter` (in input) | Send message / decompose task |
| `Shift + Enter` (in input) | Insert a newline |
| `Space` / `Enter` (in Focus Tunnel) | Mark current micro-step done and advance |

---

## 💚 The Permission Slip

> *"Doing just one tiny step and stopping is still a complete win."*

---

## 📄 License
MIT License. Created with care for anyone who ever felt overwhelmed by a to-do list.
