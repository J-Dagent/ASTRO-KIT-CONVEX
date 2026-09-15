# Monorepo Architecture

`jd-astro-kit-convex` has two deployment and ownership boundaries.

## Website

`apps/website` is the Astro site and Cloudflare Worker named `jd-astro-convex-site`. It owns pages, layouts, static assets, interactive React islands, the public Better Auth bridge, and billing screens.

## Convex backend

`packages/backend` is the Convex project published inside the workspace as `@repo/backend`. It owns application data, queries, mutations, actions, HTTP Actions, Better Auth persistence, Polar webhook synchronization, and future scheduled work.

Public marketing and documentation pages are pre-rendered. Each `/app` page mounts one React root containing `ConvexBetterAuthProvider`; native Convex hooks read and write data without a query cache adapter. Convex functions enforce identity on the backend. The server route `/api/auth/*` forwards same-origin Better Auth traffic to the routes registered in Convex.

## Runtime path

Ordinary public requests follow Browser → Cloudflare and usually resolve to pre-rendered assets. Interactive islands call Convex directly. Auth requests follow Browser → `/api/auth/*` on Astro → Better Auth on Convex. Local Convex loopback URLs are limited to development and cannot pass the production build guard.
