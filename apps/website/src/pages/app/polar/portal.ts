import type { APIRoute } from "astro";
import { api } from "@repo/backend/convex/_generated/api";
import { createAuthenticatedConvexClient } from "@/lib/auth-server";
import { createPostHogClient } from "@/lib/posthog";

export const prerender = false;

export const GET: APIRoute = async ({ request }) => {
  const posthog = createPostHogClient();
  try {
    const client = await createAuthenticatedConvexClient(request);
    const [user, customerSession] = await Promise.all([
      client.query(api.auth.getAuthUser, {}),
      client.action(api.billing.generateCustomerPortalUrl, {}),
    ]);
    posthog?.capture({
      distinctId: user._id,
      event: "customer_portal_opened",
      properties: { portal_url: customerSession.url },
    });
    return new Response(null, {
      status: 302,
      headers: { Location: customerSession.url },
    });
  } catch (error) {
    posthog?.captureException(error);
    throw error;
  } finally {
    await posthog?.shutdown();
  }
};
