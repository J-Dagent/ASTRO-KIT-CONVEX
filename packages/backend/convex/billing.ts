import { Polar } from "@convex-dev/polar";
import type { GenericCtx } from "@convex-dev/better-auth";
import { v } from "convex/values";
import { action, env, query } from "./_generated/server";
import { components } from "./_generated/api";
import type { DataModel } from "./_generated/dataModel";
import { authComponent, getApplicationOrigin } from "./auth";

export const polar = new Polar<DataModel>(components.polar, {
  organizationToken: env.POLAR_ORGANIZATION_TOKEN,
  server: env.POLAR_SERVER,
  webhookSecret: env.POLAR_WEBHOOK_SECRET,
  getUserInfo: async (ctx) => {
    const user = await authComponent.getAuthUser(
      ctx as GenericCtx<DataModel>,
    );
    return { userId: user._id, email: user.email };
  },
});

const polarApi = polar.api();

export const {
  cancelCurrentSubscription,
  changeCurrentSubscription,
  getConfiguredProducts,
  listAllProducts,
  listAllSubscriptions,
} = polarApi;

export const generateCheckoutLink = action({
  args: {
    productId: v.string(),
    locale: v.optional(v.string()),
  },
  returns: v.object({ url: v.string() }),
  handler: async (ctx, { productId, locale }) => {
    const user = await authComponent.getAuthUser(ctx);
    const origin = getApplicationOrigin();
    const checkout = await polar.createCheckoutSession(ctx, {
      productIds: [productId],
      userId: user._id,
      email: user.email,
      origin,
      successUrl: `${origin}/app/polar/checkout/success?checkout_id={CHECKOUT_ID}`,
    });
    const url = new URL(checkout.url);
    if (locale) url.searchParams.set("locale", locale);
    return { url: url.toString() };
  },
});

export const generateCustomerPortalUrl = action({
  args: {},
  returns: v.object({ url: v.string() }),
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    const origin = getApplicationOrigin();
    const portal = await polar.createCustomerPortalSession(ctx, {
      userId: user._id,
      returnUrl: `${origin}/app/polar/subscriptions`,
    });
    return { url: portal.url };
  },
});

export const getCurrentSubscription = query({
  args: {},
  // @convex-dev/polar exports only its base subscription validator. This
  // helper also adds `product` and optional `productKey`, but the package does
  // not export the product validator needed to describe that stable shape.
  returns: v.any(),
  handler: async (ctx) => {
    const user = await authComponent.getAuthUser(ctx);
    return await polar.getCurrentSubscription(ctx, { userId: user._id });
  },
});
