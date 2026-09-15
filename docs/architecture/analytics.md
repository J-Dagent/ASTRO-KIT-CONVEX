# Analytics reference

The website sends its existing server-side PostHog events through
`apps/website/src/lib/posthog.ts`. The client is created per request
and flushes immediately in the Cloudflare Worker.

Instrumented events:

- `customer_portal_opened` when a customer opens the Polar portal

Exceptions in the portal flow are also reported. The Convex Polar component
owns checkout and subscription synchronization; it does not duplicate every
backend event into PostHog. Production requires
the `POSTHOG_API_KEY` and `POSTHOG_HOST` Cloudflare secrets to be configured
manually. Never add their values to repository documentation or source files.

The existing PostHog project contains the payment funnel, checkout, portal, and
active-subscriber insights created during initial setup. Treat the application
event names above as the durable interface; dashboards may evolve separately.
