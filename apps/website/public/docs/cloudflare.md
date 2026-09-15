# Cloudflare Worker

## Responsibility

The `jd-astro-convex-site` Worker serves pre-rendered Astro pages, static assets, the Better Auth bridge, and the Polar portal endpoint. Convex owns the database and backend functions.

Public pages do not create a Convex client. `/app` creates one authenticated client inside `AppShell`. Better Auth traffic stays under `/api/auth/*`.

## Configuration

The tracked Worker configuration lives in `apps/website/wrangler.jsonc`. It contains the Worker name and non-secret runtime settings. Do not write credentials or deployment URLs into that file.

```json
{
  "name": "jd-astro-convex-site",
  "main": "@astrojs/cloudflare/entrypoints/server",
  "compatibility_flags": ["nodejs_compat"],
  "observability": { "enabled": true }
}
```

Wrangler reads `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` from the CI environment. Developers may use their local Wrangler login for a manual deployment.

## Production build guard

Run the guarded deployment from the repository root:

```bash
pnpm run deploy:website
```

The command validates both Convex Cloud URLs before Astro builds the Worker. A local Convex URL stops the command before Wrangler uploads anything.

## Troubleshooting

- A 500 on every route usually means the public Convex URL is missing from the production build or auth work escaped the `/app` boundary.
- A 500 only under `/app` usually means the Convex Cloud URLs, deployment, or Better Auth environment is missing.
- An OAuth callback error usually means `SITE_URL` and the Google authorized redirect URI do not match the Worker origin.
- Inspect runtime failures with `wrangler tail jd-astro-convex-site`.
