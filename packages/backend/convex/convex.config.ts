import { defineApp } from "convex/server";
import { v } from "convex/values";
import betterAuth from "@convex-dev/better-auth/convex.config";
import polar from "@convex-dev/polar/convex.config.js";

const app = defineApp({
  env: {
    BETTER_AUTH_SECRET: v.optional(v.string()),
    GOOGLE_CLIENT_ID: v.optional(v.string()),
    GOOGLE_CLIENT_SECRET: v.optional(v.string()),
    POLAR_ORGANIZATION_TOKEN: v.optional(v.string()),
    POLAR_SERVER: v.optional(
      v.union(v.literal("sandbox"), v.literal("production")),
    ),
    POLAR_WEBHOOK_SECRET: v.optional(v.string()),
    SITE_URL: v.optional(v.string()),
  },
});

app.use(betterAuth);
app.use(polar);

export default app;
