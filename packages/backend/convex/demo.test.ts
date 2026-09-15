/// <reference types="vite/client" />
import betterAuthTest from "@convex-dev/better-auth/test";
import polarTest from "@convex-dev/polar/test";
import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { api, components } from "./_generated/api";
import schema from "./schema";

const modules = import.meta.glob("./**/*.ts");

function createTestBackend() {
  const backend = convexTest(schema, modules);
  betterAuthTest.register(backend);
  polarTest.register(backend);
  return backend;
}

async function createAuthenticatedUser(
  backend: ReturnType<typeof createTestBackend>,
  key: string,
) {
  const now = Date.now();
  const user = await backend.run((ctx) =>
    ctx.runMutation(components.betterAuth.adapter.create, {
      input: {
        model: "user",
        data: {
          name: `User ${key}`,
          email: `${key}@example.com`,
          emailVerified: true,
          createdAt: now,
          updatedAt: now,
        },
      },
    }),
  );
  const session = await backend.run((ctx) =>
    ctx.runMutation(components.betterAuth.adapter.create, {
      input: {
        model: "session",
        data: {
          token: `token-${key}`,
          userId: user._id,
          createdAt: now,
          updatedAt: now,
          expiresAt: now + 60_000,
        },
      },
    }),
  );

  return backend.withIdentity({ subject: user._id, sessionId: session._id });
}

describe("realtime notes", () => {
  it("rejects unauthenticated reads", async () => {
    const backend = createTestBackend();
    await expect(backend.query(api.demo.listNotes, {})).rejects.toThrow(
      "Unauthenticated",
    );
  });

  it("rejects unauthenticated writes", async () => {
    const backend = createTestBackend();
    await expect(
      backend.mutation(api.demo.addNote, { text: "Bonjour" }),
    ).rejects.toThrow("Unauthenticated");
  });

  it("isolates notes by authenticated user", async () => {
    const backend = createTestBackend();
    const alice = await createAuthenticatedUser(backend, "alice");
    const bob = await createAuthenticatedUser(backend, "bob");

    await alice.mutation(api.demo.addNote, { text: "Note Alice" });
    await bob.mutation(api.demo.addNote, { text: "Note Bob" });

    expect((await alice.query(api.demo.listNotes, {})).map((note) => note.text)).toEqual([
      "Note Alice",
    ]);
    expect((await bob.query(api.demo.listNotes, {})).map((note) => note.text)).toEqual([
      "Note Bob",
    ]);
  });

  it("rejects empty notes and notes longer than 160 characters", async () => {
    const backend = createTestBackend();
    const user = await createAuthenticatedUser(backend, "validation");

    await expect(user.mutation(api.demo.addNote, { text: "   " })).rejects.toThrow(
      "between 1 and 160",
    );
    await expect(
      user.mutation(api.demo.addNote, { text: "x".repeat(161) }),
    ).rejects.toThrow("between 1 and 160");
  });
});

describe("billing authorization", () => {
  it("rejects checkout creation without an authenticated user", async () => {
    const backend = createTestBackend();
    await expect(
      backend.action(api.billing.generateCheckoutLink, { productId: "test" }),
    ).rejects.toThrow("Unauthenticated");
  });
});
