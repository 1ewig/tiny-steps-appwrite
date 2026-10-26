# Tiny Steps

> 🌐 **Live Demo:** [tiny-steps-gules.vercel.app](https://tiny-steps-gules.vercel.app)

Tiny Steps turns a vague or overwhelming task into a few concrete steps you can start right away. It is built for low-energy days: one task at a time, no streaks, no guilt, and no pressure to plan everything upfront.

See [docs/architecture.md](docs/architecture.md) for a deeper look at the internals.

You can use it as a guest. Tasks stay in your browser, and if you sign in with Google they sync to Appwrite.

## Product Demo

https://github.com/user-attachments/assets/demo (local file: `public/video/tiny-steps-demo.mp4`)

<video src="public/video/tiny-steps-demo.mp4" controls="controls" width="100%"></video>

> This video showcases the user flow of a minimalist productivity and task-management web application designed to help overwhelmed users overcome executive dysfunction by breaking down intimidating tasks into manageable micro-steps.

---

![Tiny Steps — Home](public/screenshots/01-home.webp)

## The Flow

### 1. Set Your Energy
Describe what's on your mind and choose how much energy you have today:
- **A little stuck** (3–6 steps)
- **Overwhelmed** (3–5 gentle starter steps)
- **Full paralysis** (2–4 micro-actions, never more than 4)

### 2. Enter the Focus Tunnel
New tasks open directly into a full-screen, distraction-free tunnel isolating just one step at a time so you don't scan ahead and freeze. Advance through steps with minimal keystrokes: press `Space` or `Enter` to complete a step, `S` to break it down, or `Esc` to view the full workspace.

![Focus Tunnel Active Step](public/screenshots/04-focus-tunnel-step.webp)

### 3. Spatial Workspace (Now / Next / Later)
In the full workspace, steps are organized spatially across three columns. Future steps are softly blurred by default to prevent scan panic.

![Spatial Workspace](public/screenshots/05-workspace-now-next-later.webp)

### 4. Shrink Resistance On Demand
If any step feels too big or triggers hesitation, "Break it down" dynamically splits it into 2–3 bite-sized sub-steps directly within the card (strictly capped at 3 to prevent overwhelm).

![Step with Micro-Steps](public/screenshots/06-workspace-substeps.webp)

### 5. Surgical In-Situ Assistant
Need to adjust reality? The unobtrusive bottom chip lets you tweak steps, reroute blockers, or add items without wiping your completed progress or dumping noisy chat transcripts. It also sets calm, zero-guilt boundaries against off-topic fluff or general trivia to keep your focus intact.

![In-Situ Assistant](public/screenshots/07-workspace-assistant.webp)

### 6. History Drawer
Review past sessions, resume incomplete tasks, or manage history with accessible confirmation dialogs.

![History Drawer](public/screenshots/02-history-empty.webp)

### 7. Clear Boundaries & Gentle Pauses
Tiny Steps breaks down execution for humans—it refuses to do academic ghostwriting, solve homework, or roleplay therapy. When input falls outside its scope, a calm notice card explains the boundary with a quick way to return to your words without losing your prompt.

![Boundary Notice Card](public/screenshots/08-refusal-notice.webp)

---

## Features at a Glance

- **Distraction-Free Focus Tunnel**: Full-screen monotasking with smooth optical morphs.
- **3-Column Workspace**: Spatial Now / Next / Later organization with anti-scan progressive disclosure.
- **On-Demand Micro-Actions**: Dynamically break intimidating steps into 2–3 smaller pieces.
- **Non-Destructive Assistant**: Surgical step surgery (modify, add, remove, reroute) preserving task immutability.
- **Clear Execution Boundaries**: Calm refusal notices that prevent machine labor substitution while safeguarding crisis inputs.
- **Sensory-Friendly Design**: Warm oatmeal canvas, calming sage accents, dim mode toggle, and reduced-motion support.
- **Guest-First & Cloud-Synced**: Full offline capability via `localStorage`, with optional Appwrite TablesDB sync.

---

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4, Zustand, Framer Motion, Phosphor Icons
- Vercel AI SDK and AI Gateway, default model `google/gemini-2.5-flash-lite`
- Appwrite TablesDB for optional cloud sync

## Database & Sync Architecture

Tiny Steps uses **Appwrite TablesDB** for relational, multi-device cloud synchronization:

- **Relational Tables**: Normalized into `tasks` and linked `steps` with explicit order indexing.
- **Row-Level Security (RLS)**: Enforces `Permission.read/update/delete(Role.user(userId))` per row on all cloud operations.
- **Local-first storage**: Tasks persist in `localStorage`. Signing in with Google OAuth migrates guest tasks into TablesDB and merges changes by `updatedAt`.

## Getting started

You need [Bun](https://bun.sh/) installed.

```bash
bun install
```

Copy `.env.example` to `.env.local` and add your AI Gateway key:

```env
AI_GATEWAY_API_KEY=your_key_here
```

Then start the app:

```bash
bun run dev
```

Open http://localhost:3000.

## Environment

| Variable | Required | Notes |
| --- | --- | --- |
| `AI_GATEWAY_API_KEY` | Yes, for AI features | Without it, breakdown, shrink, and assistant calls return an error. Saved tasks still open. |
| `AI_MODEL` | No | Defaults to `google/gemini-2.5-flash-lite`. |
| `AI_REASONING_EFFORT` | No | `low` or `high`; defaults to `low`. |
| `NEXT_PUBLIC_APPWRITE_ENDPOINT` | No | Appwrite Cloud endpoint (defaults to `https://sfo.cloud.appwrite.io/v1`). |
| `NEXT_PUBLIC_APPWRITE_PROJECT_ID` | No | Appwrite project ID for TablesDB and Auth. |
| `NEXT_PUBLIC_APPWRITE_DATABASE_ID` | No | Database ID containing the `tasks` and `steps` tables. |
| `APPWRITE_API_KEY` | No | Server-side admin key for backend operations (never exposed to browser). |
| `NEXT_PUBLIC_APP_URL` | No | Public deployment URL for metadataBase and OpenGraph SEO. |

## Scripts

| Command | What it does |
| --- | --- |
| `bun run dev` | Start the development server. |
| `bun run build` | Create a production build. |
| `bun run start` | Run the production build. |
| `bun run lint` | Run Oxlint. |
| `bun run check` | Run the TypeScript checker. |
| `bun run scripts/eval-suite.ts` | Run the 29-scenario AI eval suite. |
| `bun run scripts/eval-suite.ts --relevant` | Run the real-world task scenarios only. |
| `bun run scripts/eval-suite.ts --stress` | Run the adversarial stress scenarios only. |

## Project layout

```text
src/
├── app/          routes and API endpoints
├── components/   UI and layout
├── hooks/        client orchestration
├── store/        Zustand state and migrations
├── lib/          AI, Appwrite, and utilities
└── types/        shared data models
```

## License

MIT
