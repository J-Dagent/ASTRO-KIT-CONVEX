import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./auth";
import { polar } from "./billing";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);
polar.registerRoutes(http, { path: "/polar/events" });

export default http;
