# Repository Instructions

## Branch and PR Workflow

Use `staging` as the integration branch. Start feature branches from the latest `staging`; isolated worktrees may live under `.worktrees/<branch-name>`. Keep PRs small and reviewable, target `staging`, and keep unrelated features on separate branches. After a dependency merges, update active branches from `staging`. Promote `staging` to `main` only for releases.

## Repository Architecture

This is a pnpm monorepo with two intentional boundaries:

- `apps/website`: `jd-astro-convex-site`, the Astro frontend deployed on Cloudflare. It owns pages, layouts, static marketing content, React islands, the same-origin Better Auth bridge, and the billing UI.
- `packages/backend`: `@repo/backend`, the Convex backend. It owns the database, queries, mutations, actions, HTTP Actions, Better Auth persistence, Polar synchronization, and scheduled or asynchronous backend work.

Marketing pages are pre-rendered by default. Hydrate React only for interaction. `/app` uses one React root with `ConvexBetterAuthProvider` and native `convex/react` hooks. Do not add an Astro backend hop in front of ordinary Convex queries, mutations, or actions. Keep validation, authorization, and abuse controls in each relevant Convex function.

Demo and example files are intentional teaching/reference material in the template. Do not remove them unless explicitly requested.

Downstream applications created from this template may remove demo UI and examples once equivalent production implementations exist.

## Commands

Run commands from the repository root unless stated otherwise.

```bash
pnpm run setup
pnpm run dev:website
pnpm run dev:backend
pnpm run deploy:website
pnpm run deploy:backend

pnpm dev
pnpm build
pnpm typecheck
pnpm test

pnpm skills:sync
```

`pnpm test` runs the repository's automated checks. Production releases must have one designated owner: a CI/CD pipeline or an explicitly initiated manual release, never two competing deployment systems.

## Convex

Convex is the single primary backend and data platform in this variant. Do not add PostgreSQL, Drizzle, or another fallback data layer. Read `packages/backend/convex/_generated/ai/guidelines.md` before changing Convex functions. Prefer `internalQuery`, `internalMutation`, or `internalAction` for functions used only by backend code. Run `pnpm dev:backend` for development code generation. Run `pnpm deploy:backend` only when deployment is explicitly requested.

## Source Inspection

When dependency source inspection is needed, fetch only the relevant package or repository with `npx opensrc`. Do not assume `opensrc/` is populated.

```bash
npx opensrc <package>
npx opensrc pypi:<package>
npx opensrc crates:<package>
npx opensrc <owner>/<repo>
```

## Web Tooling

Use the lightest reliable tool.

- Claude Code: use `WebFetch` for straightforward public page retrieval.
- OpenCode: use `webfetch` for direct public retrieval and `websearch` for search when available.
- Codex: use native `web_search` for web research/search; Codex has no tool named `WebFetch`.
- Cross-platform: use `agent-browser` for dynamic or client-rendered sites, interaction, authentication, stateful navigation, browser workflows, or when native fetch/search is insufficient.

## Documents and PDFs

Use the `anydoc` skill for ordinary text extraction from supported documents, including text-readable PDFs. For large documents, write Markdown to disk and read only the relevant sections.

Use the `pdf-inspector` skill for PDF classification, scanned or mixed detection, OCR diagnosis, or incomplete extraction. Prefer structured classification, compact Markdown, and page selection when they reduce unnecessary context.

Do not classify every PDF before ordinary AnyDoc conversion. Use `pdftotext` only as a plain-text fallback when the normal document tools fail.

Use visual page inspection when the task depends on images, charts, diagrams, or layout. Prefer local parsing and OCR by default.

## Task Delegation

Delegate only when context isolation, parallelism, or throughput materially benefit. Choose a lightweight model for mechanical work, a balanced model for scoped research or synthesis, and the strongest reasoning model for difficult tradeoffs. Avoid host-specific model names in durable instructions. The parent owns final synthesis and validation.

## Skill Architecture

`.agents/skills/` is the canonical physical source for project skills. `.claude/skills/` contains relative symlinks only. After adding or removing skills, run `pnpm skills:sync`.

Plans produced by `improve` and `improve-animations` belong in `plans/`. Internal durable knowledge belongs in `docs/`; application-rendered technical documentation belongs in `apps/website/public/docs/` and remains in English.

## Definition of Done

Run relevant executable validation: typecheck, build, real tests when they exist, and blast-radius or review checks when appropriate. Preserve existing `.env` files byte-for-byte. Do not claim success from static reasoning when executable checks exist.
