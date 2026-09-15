# Astro Kit Convex

A multi-page Astro starter for marketing sites and small authenticated application areas. Astro owns pages and layouts, React owns interactive islands, and Convex owns data, authentication persistence, billing, HTTP Actions, and realtime updates.

## Architecture

- `apps/website` (`jd-astro-convex-site`): Astro pages, React islands, static assets, the same-origin Better Auth bridge, and the Cloudflare frontend.
- `packages/backend` (`@repo/backend`): Convex schema, queries, mutations, actions, HTTP Actions, Better Auth component, and Polar component.

Cloudflare owns the frontend worker and static assets. Convex is the only application database and backend platform in this variant.

Marketing pages are pre-rendered. `/app` mounts one client-side React root with `ConvexBetterAuthProvider`; it calls Convex directly with native hooks. `/api/auth/*` forwards same-origin auth traffic to the Better Auth routes registered in Convex.

## Setup

```bash
pnpm run setup
pnpm skills:sync
```

This installs dependencies, configures a local Convex development deployment, and creates the frontend `.env.local` with local Convex URLs when it does not already exist. Existing local environment files are never overwritten. Local loopback URLs are never used by a production build.

## Development

### All applications
```bash
pnpm dev
```

### Website
```bash
pnpm run dev:website
```

### Convex backend
```bash
pnpm run dev:backend
```

## Validation

```bash
pnpm typecheck
pnpm build
pnpm test
```

The tests cover the Better Auth bridge and authenticated Convex note behavior.

## Deployment

The template does not prescribe a CI/CD provider. Choose one production release owner, provide it with the documented configuration, and keep manual and automated releases from competing. Production validation, build leak checks, `CONVEX_DEPLOY_KEY` support, and the generic Convex and Cloudflare deploy commands remain available. See [AGENTS.md](AGENTS.md) and [`apps/website/public/docs/deployment.md`](apps/website/public/docs/deployment.md).
