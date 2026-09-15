import { PostHog } from "posthog-node";
import { env } from "cloudflare:workers";

export function createPostHogClient(): PostHog | undefined {
  if (!env.POSTHOG_API_KEY || !env.POSTHOG_HOST) return undefined;

  return new PostHog(env.POSTHOG_API_KEY, {
    host: env.POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
    enableExceptionAutocapture: true,
  });
}
