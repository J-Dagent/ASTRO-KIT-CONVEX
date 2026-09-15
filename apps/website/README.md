# Astro Kit Convex website

`jd-astro-convex-site` is the Astro frontend. It runs on Cloudflare Workers and
connects directly to the shared `@repo/backend` Convex package.

Run workspace commands from the repository root:

```bash
pnpm dev:website
pnpm build
pnpm typecheck
```

The site uses Astro, React 19 islands, Tailwind CSS v4, shadcn/ui, Better Auth,
Convex, Polar, and PostHog. Routes live in `src/pages`; layouts live in
`src/layouts`; interactive roots live in `src/islands`.

Cloudflare configuration is in `wrangler.jsonc`. The worker name is
`jd-astro-convex-site`. Environment values are managed outside source control: never
copy secrets into documentation, and do not run deployment commands as part of
routine validation.

See the root `README.md`, `AGENTS.md`, and `docs/architecture/monorepo.md` for
the complete workspace workflow and architecture.
