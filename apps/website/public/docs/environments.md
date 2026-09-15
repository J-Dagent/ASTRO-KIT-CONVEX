# Environments and secrets

## Local development

Local Convex runs on loopback addresses. `pnpm run setup` creates these values in `apps/website/.env.local` without overwriting an existing file:

```bash
VITE_CONVEX_URL="http://localhost:3210"
VITE_CONVEX_SITE_URL="http://localhost:3211"
```

All `.env` and `.env.*` files remain ignored except committed example files. Never copy credentials into a tracked file.

## Convex Cloud

Production uses one Convex Cloud deployment. Configure its server-side values through the Convex dashboard or CLI:

```bash
pnpm --filter @repo/backend exec convex env set SITE_URL https://your-app.example.com
pnpm --filter @repo/backend exec convex env set BETTER_AUTH_SECRET your-generated-secret
pnpm --filter @repo/backend exec convex env set GOOGLE_CLIENT_ID your-client-id
pnpm --filter @repo/backend exec convex env set GOOGLE_CLIENT_SECRET your-client-secret
pnpm --filter @repo/backend exec convex env set POLAR_ORGANIZATION_TOKEN your-token
pnpm --filter @repo/backend exec convex env set POLAR_WEBHOOK_SECRET your-webhook-secret
pnpm --filter @repo/backend exec convex env set POLAR_SERVER production
```

`SITE_URL` is also the only origin used to construct checkout success and customer portal return URLs. The browser cannot supply a different redirect origin.

## Cloudflare build values

The frontend needs the two public endpoints of the same Convex deployment:

```bash
VITE_CONVEX_URL="https://your-deployment.convex.cloud"
VITE_CONVEX_SITE_URL="https://your-deployment.convex.site"
```

Production builds read these values only from the process environment. They do not load the local Convex values from `.env.local`. `pnpm run validate:production-env` rejects missing values, HTTP URLs, and loopback hosts.

## Production release configuration

Configure the following secrets in the single system responsible for production releases:

- `CONVEX_DEPLOY_KEY`
- `CLOUDFLARE_API_TOKEN`
- `BETTER_AUTH_SECRET`
- `GOOGLE_CLIENT_SECRET`
- `POLAR_ORGANIZATION_TOKEN`
- `POLAR_WEBHOOK_SECRET`

Add these non-secret environment variables:

- `CLOUDFLARE_ACCOUNT_ID`
- `GOOGLE_CLIENT_ID`
- `SITE_URL`
- `VITE_CONVEX_URL`
- `VITE_CONVEX_SITE_URL`

The `VITE_CONVEX_*` values identify public Convex endpoints. Browser code must know them, so treating them as secrets adds no protection. The Convex deploy key must belong to the production deployment identified by those two public URLs.

Your chosen runner may be GitHub Actions, GitLab CI, Cloudflare, another CI service, or a controlled manual shell. Map the names above using that system's native secret and variable storage; never commit their values. Run `pnpm run validate:deployment-env` before any production mutation so missing private configuration stops the release early.

## Optional Worker telemetry

The customer portal records an event when PostHog is configured. Add `POSTHOG_API_KEY` as a Cloudflare secret and `POSTHOG_HOST` as a Worker variable to enable it. Billing remains functional when either value is absent; telemetry must never block the portal redirect.
