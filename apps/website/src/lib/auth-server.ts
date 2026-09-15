import { getToken } from "@convex-dev/better-auth/utils";
import { ConvexHttpClient } from "convex/browser";

type Fetcher = (
  input: string | URL | Request,
  init?: RequestInit,
) => Promise<Response>;

function parseConvexSiteUrl(value: string): URL {
  const url = new URL(value);
  if (url.hostname.endsWith(".convex.cloud")) {
    throw new Error(
      "VITE_CONVEX_SITE_URL must be a Convex Site URL, not a Convex cloud API URL.",
    );
  }
  return url;
}

function forwardedHeaders(request: Request, siteUrl: URL): Headers {
  const requestUrl = new URL(request.url);
  const headers = new Headers(request.headers);

  headers.delete("connection");
  headers.delete("content-length");
  headers.delete("transfer-encoding");
  headers.set("accept-encoding", "identity");
  headers.set("host", siteUrl.host);
  headers.set("x-forwarded-host", requestUrl.host);
  headers.set("x-forwarded-proto", requestUrl.protocol.replace(/:$/, ""));
  headers.set("x-better-auth-forwarded-host", requestUrl.host);
  headers.set(
    "x-better-auth-forwarded-proto",
    requestUrl.protocol.replace(/:$/, ""),
  );

  return headers;
}

export async function forwardAuthRequest(
  request: Request,
  convexSiteUrl: string,
  fetcher: Fetcher = fetch,
): Promise<Response> {
  const siteUrl = parseConvexSiteUrl(convexSiteUrl);
  const requestUrl = new URL(request.url);
  const target = new URL(`${requestUrl.pathname}${requestUrl.search}`, siteUrl);
  const hasBody = request.method !== "GET" && request.method !== "HEAD";

  try {
    return await fetcher(target, {
      method: request.method,
      headers: forwardedHeaders(request, siteUrl),
      redirect: "manual",
      body: hasBody ? await request.arrayBuffer() : undefined,
    });
  } catch {
    return Response.json(
      { error: "Authentication service unavailable" },
      { status: 502 },
    );
  }
}

export function handleAuthRequest(request: Request): Promise<Response> {
  return forwardAuthRequest(request, import.meta.env.VITE_CONVEX_SITE_URL);
}

export async function createAuthenticatedConvexClient(
  request: Request,
): Promise<ConvexHttpClient> {
  const siteUrl = parseConvexSiteUrl(import.meta.env.VITE_CONVEX_SITE_URL);
  const headers = forwardedHeaders(request, siteUrl);
  const { token } = await getToken(siteUrl.toString(), headers);
  const client = new ConvexHttpClient(import.meta.env.VITE_CONVEX_URL);
  if (token) client.setAuth(token);
  return client;
}
