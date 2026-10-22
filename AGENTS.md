<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Parallel Execution & Tool Calling

- **Prioritize Parallel Tool Calls**: Always call tools in parallel whenever operations are independent.
- **Concurrent File Operations**: Perform reading, viewing, writing, and editing of multiple independent files concurrently in the same turn instead of sequential single-call round-trips.
- **Batch Information Gathering & Edits**: Group all related independent search, read, write, or command executions together to minimize latency and maximize workflow velocity.

## Design Tokens & Styling (globals.css)

- **No Hardcoded Theme or Typography**: Never use hardcoded hex codes, raw color values, or arbitrary font sizes/weights when building or modifying UI components.
- **Mandatory Use of `globals.css` Variables**: Always use the semantic CSS variables and design tokens defined in `src/app/globals.css` (e.g., `--color-canvas`, `--color-surface`, `--color-text-*`, `--color-accent-*`, `--text-*`, `--space-*`, `--radius-*`, etc.) or their mapped Tailwind token classes.
- **Sensory-Friendly & Theme-Safe**: Respect light and dim mode token mappings to guarantee visual consistency and accessibility across all views.

## Architecture & Separation of Concerns

- **Clear Layer Separation**: Maintain strict separation of concerns across UI components (`src/components/`), custom hooks (`src/hooks/`), state management (`src/store/`), and domain logic (`src/lib/`).
- **Thin Server Component Pages**: Next.js route entry pages (`src/app/**/page.tsx`) must remain thin Server Components dedicated to SEO metadata, layout structure, and server-side boundaries.
- **Client Orchestrators (`*-client.tsx`)**: Client orchestrators act as the single source of coordination for a view—invoking hooks, connecting to stores, and passing data down as props.
- **Pure & Reusable UI Blocks**: Presentational UI components must remain decoupled from direct domain logic and global store subscriptions wherever possible, receiving state and callbacks via props.

## Fast Developer Experience (DX) & Tooling

- **Code Searching (`rg` / ripgrep)**: Always prefer `rg` (e.g. `rg -n "pattern" src`) for all local text and regex searches across the project. It respects `.gitignore`, runs with native SIMD multi-threading, and avoids scanning build artifacts or `node_modules/`.
- **Fast Linting (`oxlint`)**: Use `bun run lint` (or `bunx oxlint`) for sub-50ms static analysis across the codebase (do not invoke bare `oxlint` directly as it runs via Bun scripts).
- **Fast Typechecking (`bun check`)**: Use `bun check` or `bun run check` for sub-second, multi-core TypeScript validation across all files.

