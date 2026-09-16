---
name: project-setup-guide
description: Guide local or production setup for this Astro, Convex, Better Auth, Polar, and Cloudflare template. Use for installation, environment variables, authentication setup, backend connectivity, or deployment preparation.
---

You are the setup specialist for this repository. Guide the user one checkpoint at a time and wait when they must create an account, credential, or external resource.

## Architecture

This template has two runtimes:

- `apps/website` is the Astro site deployed to Cloudflare Workers.
- `packages/backend` is the Convex backend. It owns data, functions, Better Auth persistence, Polar synchronization, and scheduled work.

Convex is the only database and backend.

Public pages are pre-rendered and require no Convex client. `/app` owns one authenticated React island. Public functions keep their validation and abuse controls in Convex.

## 1. Confirm the target

Ask whether the user is setting up local development or production. Confirm Node.js 22 and pnpm 10.14.0 are available.

Never read, print, overwrite, or commit secret values. Ask the user to configure them through Convex, their deployment platform, or their local shell.

## 2. Connect Convex Cloud for local development

From the repository root, run:

```bash
pnpm run setup
```

This installs dependencies, lets the operator connect a Convex Cloud development deployment, generates the typed API, and creates `apps/website/.env.local` only when the file does not exist. Do not run it until the operator is ready to authenticate or provide deployment credentials. The generated frontend values are:

```bash
PUBLIC_CONVEX_URL="https://your-deployment.convex.cloud"
PUBLIC_CONVEX_SITE_URL="https://your-deployment.convex.site"
PUBLIC_SITE_URL="http://localhost:3000"
```

If `.env.local` already exists, preserve it. Ask the user to add missing values manually.

Start both runtimes with `pnpm dev`, or use separate terminals:

```bash
pnpm run dev:backend
pnpm run dev:website
```

The application stays local on port 3000 while its backend is hosted by Convex Cloud. Loopback Convex deployments are rejected.

## 3. Configure Better Auth

Set server values on the active Convex deployment:

```bash
pnpm --filter @repo/backend exec convex env set SITE_URL http://localhost:3000
pnpm --filter @repo/backend exec convex env set BETTER_AUTH_SECRET your-generated-secret
pnpm --filter @repo/backend exec convex env set GOOGLE_CLIENT_ID your-client-id
pnpm --filter @repo/backend exec convex env set GOOGLE_CLIENT_SECRET your-client-secret
```

Generate `BETTER_AUTH_SECRET` with `openssl rand -base64 32`. Google OAuth is optional until the user tests sign-in. Its callback is:

```text
http://localhost:3000/api/auth/callback/google
```

For production, replace the origin with the public application origin. Better Auth routes through `/api/auth/*`; session data stays in Convex.

## 4. Configure Polar when needed

Use Polar sandbox for development:

```bash
pnpm --filter @repo/backend exec convex env set POLAR_ORGANIZATION_TOKEN your-token
pnpm --filter @repo/backend exec convex env set POLAR_WEBHOOK_SECRET your-webhook-secret
pnpm --filter @repo/backend exec convex env set POLAR_SERVER sandbox
```

Configure the webhook at `https://your-deployment.convex.site/polar/events`. Keep Polar credentials in Convex environment variables, not frontend files.

## 5. Validate local setup

Run:

```bash
pnpm typecheck
pnpm test
pnpm build
```

Then verify `/`, `/docs`, sign-in, `/app`, sign-out, and one protected Convex query. Public routes must render without a session or available Convex connection. Full OAuth testing requires valid Google and Convex configuration.

## 6. Prepare production

Production must use Convex Cloud. Supply these public build variables:

```bash
PUBLIC_CONVEX_URL="https://your-deployment.convex.cloud"
PUBLIC_CONVEX_SITE_URL="https://your-deployment.convex.site"
```

`PUBLIC_CONVEX_*` values are public endpoints, not secrets. Configure server secrets on the matching Convex Cloud deployment. A non-interactive release also needs `CONVEX_DEPLOY_KEY`, `CLOUDFLARE_API_TOKEN`, and `CLOUDFLARE_ACCOUNT_ID` in the chosen CI/CD system.

Run `pnpm run validate:deployment-env` before a production mutation. The release owner should then run the normal validation, deploy Convex, build with the production URLs, and deploy the Cloudflare Worker. Use `pnpm deploy:backend` and `pnpm deploy:website` only after the user explicitly requests deployment.

Never edit `dist` or `.wrangler` output. The production build checks generated artifacts for loopback URLs and known secret values.
