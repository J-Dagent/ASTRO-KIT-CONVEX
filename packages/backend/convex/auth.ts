import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import type { GenericCtx } from "@convex-dev/better-auth";
import { betterAuth } from "better-auth/minimal";
import authConfig from "./auth.config";
import { components } from "./_generated/api";
import { env } from "./_generated/server";
import type { DataModel } from "./_generated/dataModel";

export const authComponent = createClient<DataModel>(components.betterAuth);

export function getApplicationOrigin() {
  if (env.SITE_URL) {
    return new URL(env.SITE_URL).origin;
  }

  if (new URL(env.CONVEX_SITE_URL).hostname === "127.0.0.1") {
    return "http://localhost:3000";
  }

  throw new Error("SITE_URL must be configured on this Convex deployment.");
}

export function createAuth(ctx: GenericCtx<DataModel>) {
  const siteUrl = getApplicationOrigin();

  return betterAuth({
    baseURL: siteUrl,
    secret: env.BETTER_AUTH_SECRET,
    database: authComponent.adapter(ctx),
    trustedOrigins: [siteUrl],
    socialProviders: {
      google: {
        clientId: env.GOOGLE_CLIENT_ID ?? "",
        clientSecret: env.GOOGLE_CLIENT_SECRET ?? "",
      },
    },
    plugins: [convex({ authConfig })],
  });
}

export const { getAuthUser } = authComponent.clientApi();
