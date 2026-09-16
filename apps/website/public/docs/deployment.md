# Deployment

## Release order

Deploy the backend before the frontend:

1. Validate, test, and build the workspace.
2. Deploy Convex functions and schema to Convex Cloud.
3. Build the frontend with that deployment's public URLs.
4. Deploy the Worker to Cloudflare.
5. Smoke-test `/`, `/docs`, `/app`, and the OAuth callback.

## Release owner

The template intentionally ships without a provider-specific pipeline. Choose exactly one system to own production releases: GitHub Actions, GitLab CI, Cloudflare, another CI service, or a controlled manual process. That release owner should perform:

```text
install
  -> typecheck
  -> tests
  -> production build
  -> Convex Cloud deploy
  -> Cloudflare Worker deploy
```

Do not configure a second automatic deploy for the same production environment. Competing systems can publish different commits or build with different variables.

Convex uses `CONVEX_DEPLOY_KEY` for non-interactive authentication, while Wrangler uses `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` in CI. An operator running Wrangler manually may use an authenticated local session. `PUBLIC_CONVEX_URL`, `PUBLIC_CONVEX_SITE_URL`, `SITE_URL`, `GOOGLE_CLIENT_ID`, `POLAR_SERVER`, and `CLOUDFLARE_ACCOUNT_ID` are configuration rather than application secrets.

## Provider-neutral commands

Inject the production variables and secrets with your runner's native mechanism, then run:

```bash
pnpm install --frozen-lockfile
pnpm run validate:deployment-env
pnpm typecheck
pnpm test
pnpm build
pnpm deploy:backend
pnpm deploy:website
```

Before the first connected release, or whenever server-side values change, configure the Convex Cloud environment using the commands in [Environments](/docs/environments). `pnpm deploy:backend` uses an interactive Convex login when run by an operator or `CONVEX_DEPLOY_KEY` when supplied by CI. `pnpm deploy:website` accepts a disconnected frontend when neither public Convex URL is present, and validates both Cloud endpoints as soon as either one is supplied.

The build itself runs the artifact leak check. It fails if generated output contains loopback Convex endpoints or known private variable values. Never edit `dist` or `.wrangler` output manually; rebuild from source instead.

## Post-deployment checks

```bash
curl --fail https://your-worker.example.com/
curl --fail https://your-worker.example.com/docs
curl --head https://your-worker.example.com/app
```

The first two checks must succeed even if Convex is unavailable. `/app` may show the login screen, redirect, or report a private-backend configuration error, but it must never expose private data without a valid backend identity.
