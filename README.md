# Tiny Steps

Tiny Steps turns a vague or overwhelming task into a few concrete steps you can start right away. It is built for low-energy days: one task at a time, no streaks, no guilt, and no pressure to plan everything upfront.

You can use it as a guest. Tasks stay in your browser, and if you sign in with Google they sync to Appwrite.

## What it does

- Breaks a task into 3–6 steps based on how much energy you have.
- Shows the current step, the next one, and the rest in a simple Now / Next / Later workspace.
- Focus Tunnel puts a single step on screen so you can work without scanning ahead.
- If a step is still too big, break it into 2–4 smaller actions.
- A small assistant lets you tweak a step, reroute a blocker, remove a step, or add one without losing completed work.
- History keeps past tasks and progress; deleting a task asks for confirmation.
- Dim mode and reduced-motion support.

## How it works

1. Describe the task and pick an energy level.
2. The AI returns a short title, some guidance, and a handful of steps.
3. Work through them in the workspace or Focus Tunnel.

## Stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS v4, Zustand, Framer Motion, Phosphor Icons
- Vercel AI SDK and AI Gateway, default model `google/gemini-2.5-flash-lite`
- Appwrite TablesDB for optional cloud sync

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
| Appwrite variables | No | See `.env.example`; needed for cloud sync. |

Cloud sync uses Appwrite TablesDB with `tasks` and `steps` tables. Sign-in is optional; guest tasks stay in `localStorage`.

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
