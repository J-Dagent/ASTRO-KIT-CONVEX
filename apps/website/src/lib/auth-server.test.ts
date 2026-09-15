import { describe, expect, it } from "vitest";
import { forwardAuthRequest } from "./auth-server";

describe("Astro Better Auth bridge", () => {
  it("forwards GET requests to the Convex HTTP route with the public host", async () => {
    const calls: Array<{ input: string | URL | Request; init?: RequestInit }> = [];
    const fetcher = async (
      input: string | URL | Request,
      init?: RequestInit,
    ) => {
      calls.push({ input, init });
      return new Response(null, { status: 204 });
    };
    const request = new Request(
      "https://astro-kit.example/api/auth/get-session?fresh=1",
      { headers: { cookie: "better-auth.session_token=test" } },
    );

    const response = await forwardAuthRequest(
      request,
      "https://deployment.convex.site",
      fetcher,
    );

    expect(response.status).toBe(204);
    expect(calls).toHaveLength(1);
    const call = calls[0];
    expect(String(call?.input)).toBe(
      "https://deployment.convex.site/api/auth/get-session?fresh=1",
    );
    expect(call?.init?.method).toBe("GET");
    expect(new Headers(call?.init?.headers).get("cookie")).toBe(
      "better-auth.session_token=test",
    );
    expect(new Headers(call?.init?.headers).get("x-better-auth-forwarded-host")).toBe(
      "astro-kit.example",
    );
  });

  it("forwards POST bodies and strips hop-by-hop headers", async () => {
    const calls: Array<{ input: string | URL | Request; init?: RequestInit }> = [];
    const fetcher = async (
      input: string | URL | Request,
      init?: RequestInit,
    ) => {
      calls.push({ input, init });
      return new Response(null, { status: 200 });
    };
    const request = new Request(
      "https://astro-kit.example/api/auth/sign-out",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          connection: "keep-alive",
        },
        body: JSON.stringify({}),
      },
    );

    await forwardAuthRequest(
      request,
      "https://deployment.convex.site",
      fetcher,
    );

    const call = calls[0];
    expect(call?.init?.method).toBe("POST");
    expect(new Headers(call?.init?.headers).has("connection")).toBe(false);
    expect(new TextDecoder().decode(call?.init?.body as ArrayBuffer)).toBe("{}");
  });

  it("rejects the Convex cloud API URL in place of the HTTP site URL", async () => {
    await expect(
      forwardAuthRequest(
        new Request("https://astro-kit.example/api/auth/get-session"),
        "https://deployment.convex.cloud",
      ),
    ).rejects.toThrow("Convex Site URL");
  });

  it("returns a safe gateway error when the Convex auth route is unavailable", async () => {
    const response = await forwardAuthRequest(
      new Request("https://astro-kit.example/api/auth/get-session"),
      "https://deployment.convex.site",
      async () => {
        throw new TypeError("connect ECONNREFUSED 127.0.0.1");
      },
    );

    expect(response.status).toBe(502);
    expect(await response.json()).toEqual({
      error: "Authentication service unavailable",
    });
  });
});
