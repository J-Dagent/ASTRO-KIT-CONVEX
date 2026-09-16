# Better Auth with Convex

## Architecture

The browser signs in through Better Auth at `/api/auth/*`. Astro forwards that public route to the Convex HTTP Action registered by `@convex-dev/better-auth`.

```text
Google button
  -> /api/auth/* on Astro
  -> Better Auth HTTP Action on Convex
  -> Google OAuth
  -> Better Auth session stored by the Convex component
  -> authenticated Convex client
```

Convex owns Better Auth session data while the existing login, account, and logout UI stays unchanged.

## Required environment variables

After a Convex Cloud deployment is connected, `pnpm run setup` can create `apps/website/.env.local` when that file does not already exist. It never overwrites an existing local environment file. For a manual or production configuration, set:

```bash
# apps/website/.env.local
PUBLIC_CONVEX_URL="https://your-deployment.convex.cloud"
PUBLIC_CONVEX_SITE_URL="https://your-deployment.convex.site"
PUBLIC_SITE_URL="http://localhost:3000"
```

Set secrets on the Convex development deployment. Do not put their real values in repository files.

```bash
pnpm --filter @repo/backend exec convex env set SITE_URL http://localhost:3000
pnpm --filter @repo/backend exec convex env set BETTER_AUTH_SECRET your-secret
pnpm --filter @repo/backend exec convex env set GOOGLE_CLIENT_ID your-client-id
pnpm --filter @repo/backend exec convex env set GOOGLE_CLIENT_SECRET your-client-secret
```

Generate a Better Auth secret with `openssl rand -base64 32`.

## Google OAuth

Add this redirect URI to the Google OAuth client for local development:

```text
http://localhost:3000/api/auth/callback/google
```

For production, replace the origin with the application domain:

```text
https://your-domain.com/api/auth/callback/google
```

The callback stays on the application domain because Astro keeps `/api/auth/*` as the public bridge. No Convex site URL needs to be exposed as the Google callback.

## Backend files

- `packages/backend/convex/auth.config.ts` registers Better Auth as a Convex authentication provider.
- `packages/backend/convex/auth.ts` creates Better Auth with the Convex adapter and Google provider.
- `packages/backend/convex/http.ts` registers the Better Auth HTTP routes.
- `apps/website/src/pages/api/auth/[...all].ts` owns the Astro GET/POST route.
- `apps/website/src/lib/auth-server.ts` forwards auth traffic and creates authenticated server Convex clients.
- `apps/website/src/lib/auth-client.ts` adds the Better Auth Convex client plugin.

## Public and private route boundary

Marketing and documentation pages do not initialize Better Auth or request a token. Each `/app` page mounts one `AppShell` React root containing `ConvexBetterAuthProvider`.

Use `useConvexAuth()`, `Authenticated`, or `Unauthenticated` before calling protected Convex functions. A Better Auth browser session can exist briefly before the Convex client has validated its token.

The application reloads after sign-out so the authenticated Convex connection is cleared before the signed-out UI appears.

## Client integration

The Better Auth client keeps the established React API and adds the Convex token plugin:

```ts
export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : undefined,
  plugins: [convexClient()],
});
```

Start Google OAuth from the existing application origin. Better Auth returns through the proxy route and redirects to the protected application:

```ts
await authClient.signIn.social({
  provider: "google",
  callbackURL: "/app",
});
```

`AccountDialog` reads `authClient.useSession()` for the name, email, and avatar. Its sign-out callback reloads the document after Better Auth clears the session so no authenticated Convex cache survives into the signed-out UI.

## Protecting application UI

`AppShell` uses the Convex auth primitives:

```ts
<AuthLoading><LoadingScreen /></AuthLoading>
<Authenticated><AuthenticatedApplication /></Authenticated>
<Unauthenticated><GoogleLogin /></Unauthenticated>
```

This avoids rendering protected Convex queries in the short interval between the browser session loading and the Convex client accepting its JWT.

UI gates are not authorization. Every Convex function that reads private user data or performs a user-owned write must resolve the user from the authenticated backend context. Never accept a trusted user ID from browser arguments.

## Server-side access

The portal endpoint is the only current Astro server route that calls an authenticated Convex action. It creates a `ConvexHttpClient`, obtains the Better Auth JWT from the incoming cookie, calls the existing Convex action, records PostHog, and redirects.

Ordinary client-side operations use `useQuery`, `useMutation`, and `useAction` from `convex/react`. Do not add an Astro Action or endpoint in front of them.

## Troubleshooting

- A Google provider warning means `GOOGLE_CLIENT_ID` or `GOOGLE_CLIENT_SECRET` is missing on the active Convex deployment.
- A callback mismatch means the Google console URI does not exactly match the application-domain `/api/auth/callback/google` URL.
- A browser session with failed Convex queries usually means the Convex token has not loaded or the frontend points at a different deployment.
- A proxy error usually means `PUBLIC_CONVEX_SITE_URL` is missing or uses the `.convex.cloud` URL instead of `.convex.site`.

## Local verification

```bash
pnpm run setup
pnpm dev
```

Verify Google sign-in, `/app` access, account details, sign-out, and a protected Convex query. External Google and Convex credentials are required for the complete OAuth flow.
