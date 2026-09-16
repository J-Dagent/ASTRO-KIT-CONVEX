# Convex backend

## What Convex owns

Convex is the primary backend and data platform for this template variant. It owns application data, reactive functions, Better Auth persistence, Polar synchronization, HTTP Actions, and future scheduled work. Cloudflare runs the Astro frontend and its small set of on-demand routes.

Backend code lives in `packages/backend/convex/`.

## Convex Database

Convex stores JSON-like documents in tables. Every document receives `_id` and `_creationTime` system fields. The application schema is declared in `packages/backend/convex/schema.ts`.

The Better Auth and Polar components keep their own isolated tables. Do not duplicate those tables in the application schema.

## Schema and validators

Use `defineSchema`, `defineTable`, and validators from `convex/values`:

```ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  realtimeNotes: defineTable({
    text: v.string(),
    authorName: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_updated_at", ["updatedAt"]),
});
```

Every public or internal function must validate its arguments. Keep application rules, such as text length, in the function handler as well.

## Queries

Queries are read-only, deterministic functions. The client subscribes to their results.

```ts
export const listNotes = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("realtimeNotes")
      .withIndex("by_updated_at")
      .order("desc")
      .take(10);
  },
});
```

Bound result sets with `take()` or pagination. Do not scan an unbounded table with `collect()`.

## Mutations

Mutations update the database transactionally. The teaching demo inserts one shared note:

```ts
export const addNote = mutation({
  args: { text: v.string() },
  handler: async (ctx, { text }) => {
    return await ctx.db.insert("realtimeNotes", {
      text: text.trim(),
      updatedAt: Date.now(),
    });
  },
});
```

When the mutation commits, every client subscribed to the affected query receives the new result automatically.

## Actions

Actions can call external APIs and can run longer than queries or mutations. They cannot access `ctx.db` directly. Use them for work such as generating a Polar checkout URL. Call an internal query or mutation when an action needs database data or writes.

## Indexes

Declare indexes beside their tables and name every indexed field, such as `by_updated_at`. Query indexes with `withIndex()` in the declared field order. Add an index only for a real access pattern.

## Realtime subscriptions

React islands subscribe with the native Convex hook:

```ts
const notes = useQuery(api.demo.listNotes, {});
const addNote = useMutation(api.demo.addNote);
```

This is a pushed subscription over the Convex client connection. It does not poll and does not require `invalidateQueries()` after a Convex mutation.

The example at `/app` is designed for a two-tab check. Add a note in one tab and watch it appear in the other. Both the query and mutation resolve the Better Auth user on the backend. Each user sees only notes indexed by their own component user ID.

## Scheduled functions and cron

Use `ctx.scheduler.runAfter()` or `ctx.scheduler.runAt()` for durable one-off work. Define recurring work in `convex/crons.ts` with Convex cron jobs. Add these only when the product has a concrete delayed or recurring task.

## Local development

Run the initial setup once:

```bash
pnpm run setup
```

Then run the frontend and Convex together:

```bash
pnpm dev
```

Run them separately when debugging one side:

```bash
pnpm dev:website
pnpm dev:backend
```

`convex dev` creates or selects a development deployment, generates `convex/_generated/`, pushes backend functions, and watches for changes. Commit generated API types, but never commit `.env.local`.

## Production deployment

Production uses Convex Cloud. The selected release owner validates configuration, builds once, deploys Convex, then deploys the verified Worker artifact. `CONVEX_DEPLOY_KEY` enables a non-interactive Convex deployment in any CI provider. See [Environments](/docs/environments) and [Deployment](/docs/deployment).

## Astro and React connection

Marketing routes are Astro pages and stay static by default. `/app` mounts one React island with `ConvexBetterAuthProvider`; that root calls Convex directly. Do not wrap ordinary Convex queries, mutations, or actions in Astro Actions or server endpoints.

## Convex on public routes

Public routes never require Better Auth or a Convex token. A public React island can create its own passive Convex client when it needs a public function. Components that do not call Convex create no subscription or request.

Each public function owns its argument validation and abuse controls. Add rate limiting or bot verification when a real form, agent, or paid operation needs it. Do not add a second provider or a generic anonymous persistence layer.

`PUBLIC_CONVEX_URL` and `PUBLIC_CONVEX_SITE_URL` are public deployment endpoints. Browser bundles must contain them, so configure them as ordinary Astro build variables. Credentials such as `CONVEX_DEPLOY_KEY`, OAuth client secrets, Better Auth secrets, and Polar tokens remain secrets.
