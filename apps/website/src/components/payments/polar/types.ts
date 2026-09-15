import { api } from "@repo/backend/convex/_generated/api";
import type { FunctionReturnType } from "convex/server";

export type Products = FunctionReturnType<typeof api.billing.listAllProducts>;
export type Product = Products[number];
export type Price = Product["prices"][number];
export type Subscription = FunctionReturnType<
  typeof api.billing.getCurrentSubscription
>;
