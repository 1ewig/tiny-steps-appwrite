# Architecture

Tiny Steps is a Next.js App Router app with a client-heavy UI, a small server layer for AI calls, and optional Appwrite sync. The browser owns the task state. The server turns prompts into structured JSON. Appwrite mirrors tasks for signed-in users.

The app is local-first: everything works without an account, and cloud sync is a background convenience rather than a requirement.

## System map

```mermaid
flowchart LR
  B["Browser<br/>React 19 + Zustand"] -->|POST prompt| A1["/api/breakdown"]
  B -->|POST step tree| A2["/api/shrink"]
  B -->|POST message + tree| A3["/api/assistant"]
  A1 --> GW["Vercel AI Gateway"]
  A2 --> GW
  A3 --> GW
  B <-->|read/write| LS[("localStorage")]
  B <-->|OAuth + TablesDB| AW["Appwrite"]
```

- **Browser** holds tasks, steps, UI state, and the current user.
- **Next server routes** validate input and call the Gateway. They do not store data.
- **AI Gateway** returns structured output validated by Zod schemas.
- **Appwrite** stores `tasks` and `steps` rows when a user signs in.
- **localStorage** persists the Zustand store between visits.

## Creating a task

```mermaid
sequenceDiagram
  participant U as User
  participant C as Tasks page
  participant API as Breakdown API
  participant GW as AI Gateway
  participant S as Zustand store
  U->>C: Describe task + pick energy level
  C->>API: POST { prompt, energyLevel }
  API->>GW: generateText + Output.object
  GW-->>API: title, acknowledgment, steps
  API-->>C: structured JSON
  C->>S: createTask(...)
  C->>C: Open Focus Tunnel and navigate
```

`useStartTask` handles the request, a 15-second timeout, a 600ms minimum loader, refusal notices, and error recovery. Accepted tasks are created locally with `createTask`, which also assigns the current `userId` when signed in.

Energy level changes the step budget:

| Level | Label | Step budget |
| --- | --- | --- |
| 1 | A little stuck | 3–6 |
| 2 | Overwhelmed | 3–5, target 4 |
| 3 | Full paralysis | 2–4, never more than 4 |

If the model refuses, the API returns `status: "refused"` and an empty `steps` array. The client shows the acknowledgment and restores the prompt instead of creating a task.

## Shrinking a step

`shrinkStepWithAI` sends the task title, the full serialized step tree, and the target index to `/api/shrink`. The prompt marks completed, active, upcoming, pending, and focus steps so the model respects earlier work and the next step.

`ShrinkStepSchema` returns an acknowledgment and 2–3 micro-steps (strictly capped at 3 to prevent overwhelm). `shrinkStep` attaches them to the parent as `subSteps` and sets `canSplit: false`. The parent title, instruction, and completion state stay in place.

## Tweaking a task

The bottom chat chip sends the message, task title, and serialized tree to `/api/assistant`. `AssistantIntentSchema` returns one intent: complete, modify, reroute, remove, insert, shrink, new task, tweak steps, encouragement, off-topic, or crisis.

`applyAssistantIntent` applies only the targeted mutation.

| Intent | Effect |
| --- | --- |
| `complete_step` | Toggle completion for the target step. |
| `modify_step`, `modify_substep`, `reroute_constraint` | Change the title or instruction of a step or sub-step. |
| `remove_step` | Remove a step or sub-step. |
| `insert_step` | Insert a step after `afterStepId`, or append it. |
| `shrink_step` | Attach the returned micro-steps to the target step (capped at 3). |
| `new_task` | Keep completed steps and append a new set of steps. |
| `tweak_steps` | Replace the step list. |
| `all_complete`, `encouragement` | Show calm solidarity or celebration without modifying steps. |
| `off_topic` | Show a gentle 1-sentence boundary redirecting to task steps without touching the tree. |
| `crisis` | Surface universal crisis support (findahelpline.com) without roleplaying therapy. |

## Data model

`Task` is the top-level unit:

- `id`, `title`, `prompt`, `guidance`
- `energyLevel`, `steps`, `introSeen`, `userId`
- `createdAt`, `updatedAt`

`Step` can contain `subSteps`:

- `id`, `title`, `text`, `instruction`
- `completed`, `completedAt`
- `canSplit`
- `subSteps?: Step[]`

The UI uses the first incomplete step as the active step. A selected step can be worked out of order; `useTaskCard` keeps that selection until the step is completed or the order is reset. The Next column holds one upcoming step at energy level 3 and up to two otherwise.

## State and persistence

The Zustand store is split into three slices: tasks, UI, and auth. `persist` writes `tasks`, `granularity`, `peekFuture`, `theme`, and `user` to `tinysteps_zustand_store`; transient flags such as loaders and drawers stay in memory.

`mergePersistedTaskState` handles older saved shapes. The layout waits for hydration before rendering task content, and a small inline script applies the dark class before paint to avoid a theme flash.

`next.config.ts` enables `cacheComponents` and `partialPrefetching`, and redirects `/` to `/tasks`.

## AI layer

`getAIGatewayModel` reads `AI_GATEWAY_API_KEY`, `AI_MODEL`, and `AI_GATEWAY_BASE_URL`. Without a key it returns `null`, and the routes respond with 503. `AI_REASONING_EFFORT` accepts `low` or `high` and defaults to `low`.

The three routes share the same shape:

| Route | Schema | Output |
| --- | --- | --- |
| `/api/breakdown` | `TaskBreakdownSchema` | title, acknowledgment, steps, refusal metadata |
| `/api/shrink` | `ShrinkStepSchema` | acknowledgment + 2–3 micro-steps |
| `/api/assistant` | `AssistantIntentSchema` | one structured intent |

Routes validate the request body, return 400 for missing fields, 503 when the Gateway is not configured, and 500 on model errors.

Prompts live in `src/lib/ai/prompts.ts`. The breakdown prompt enforces concrete, short actions and refuses self-harm, harmful, irrelevant, joke, and gibberish input. For self-harm input it points to https://findahelpline.com rather than roleplaying support. Acknowledgments use level-tuned companion voices—from direct forward clarity at Level 1 to radical permission ("Everything else can wait. We're only touching one tiny piece to get moving.") at Level 3—strictly banning robotic corporate clichés like "This is a common challenge". The shrink prompt receives the lifecycle-tagged tree and caps micro-steps at 3. The assistant prompt receives the same tree, enforces strict boundaries against off-topic fluff, trivia, and ghostwriting, and asks for one surgical intent.

## Testing and evaluation

`scripts/eval-suite.ts` runs 29 scenarios against the configured Gateway model: 14 real-world tasks, 10 rejection cases, and 5 stress cases. Use `--relevant` or `--stress` to run a subset. The script needs `AI_GATEWAY_API_KEY`.

## Cloud sync

Auth is optional Google OAuth through Appwrite. A full-screen, sensory-friendly `AuthOverlay` provides distraction-free sign-in with Google, keyboard `Esc` return, and loading indicators. `loginWithGoogle` uses the OAuth2 token flow, and `/auth/success` exchanges the returned user ID and secret for a session. `/auth/failure` handles aborted sign-ins.

When a user signs in, `useTaskSyncSubscription` runs once from the tasks layout:

1. Upload local tasks that have no `userId`.
2. Fetch the user's tasks and steps from TablesDB.
3. Merge both lists by newest `updatedAt`.

After that, task changes are debounced for 600ms and written in the background. Deletions go to TablesDB immediately. Signing out clears the local user, tasks, sync timestamp, and Focus Tunnel; it does not delete cloud rows.

The `tasks` table stores `title`, `prompt`, `guidance`, `energyLevel`, `introSeen`, and `userId`. The `steps` table stores `taskId`, `title`, `instruction`, `completed`, `order`, `canSplit`, and `subSteps` as JSON. Each row gets read, update, and delete permissions for the owning user.

Saving a task deletes its existing step rows and recreates them. This keeps the remote copy simple, but it means step rows do not have stable cloud IDs.

## UI layers

Route pages stay thin. `src/app/tasks/[id]/page.tsx` reads the route param and renders `TaskBreakdownClient`. The client orchestrator connects hooks and store actions, while cards and smaller components receive data and callbacks as props.

`TasksLayoutClient` is mounted once for the tasks area. It owns the header, history drawer, theme toggle, Focus Tunnel, loader, keyboard shortcuts, and the single sync subscription.

Focus Tunnel shows the active step and advances through incomplete sub-steps before completing the parent step. On initial entry, it displays the session title in `h1` and acknowledgment guidance in `p` to eliminate layout shift before step 1. Space or Enter advances, S shrinks, and Escape closes.

## Design system

Colors, spacing, radii, and typography come from semantic tokens in `src/app/globals.css`. Components use token classes instead of raw colors, so light and dim modes stay consistent. The theme is stored in Zustand and applied with a `dark` class on the root element. `prefers-reduced-motion` is honored globally, and motion-heavy components also check `useReducedMotion`.

## Tradeoffs and limits

- **No offline AI.** Breakdown, shrink, and assistant calls need a Gateway key and network. Saved tasks can still be opened offline.
- **Last-write-wins sync.** Conflicts are resolved by `updatedAt`; there is no server-side merge or operation log.
- **Client-generated IDs.** Task IDs use `task_${Date.now()}`. This is fine for a local-first app but not a distributed ID scheme.
- **Step rows are rewritten.** Saving a task replaces its remote step rows, so cloud step IDs are not stable.
- **AI routes are unauthenticated.** The Gateway key stays server-side, but the endpoints themselves do not check for a signed-in user.

## Where to look

- `src/types/task.ts` — Task, Step, and intent types
- `src/store/task-store.ts` — persistence setup
- `src/store/slices/task-slice.ts` — task and step mutations
- `src/lib/ai/prompts.ts` — system prompts and step-tree formatting
- `src/lib/ai/schemas.ts` — structured output schemas
- `src/app/api/*/route.ts` — AI endpoints
- `src/lib/appwrite/tasks.ts` — TablesDB reads and writes
- `src/hooks/use-task-sync.ts` — local/cloud reconciliation
- `src/components/layout/tasks-layout-client.tsx` — client shell
- `scripts/eval-suite.ts` — AI evaluation scenarios
