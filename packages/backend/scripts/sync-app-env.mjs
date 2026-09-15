import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const backendEnvPath = fileURLToPath(new URL("../.env.local", import.meta.url));
const appEnvPath = fileURLToPath(
  new URL("../../../apps/website/.env.local", import.meta.url),
);

function readValue(source, key) {
  const line = source
    .split(/\r?\n/)
    .find((candidate) => candidate.startsWith(`${key}=`));
  if (!line) return undefined;

  const rawValue = line.slice(key.length + 1).trim();
  if (
    (rawValue.startsWith('"') && rawValue.endsWith('"')) ||
    (rawValue.startsWith("'") && rawValue.endsWith("'"))
  ) {
    return rawValue.slice(1, -1);
  }
  return rawValue;
}

if (!existsSync(backendEnvPath)) {
  throw new Error(
    "Convex has not created packages/backend/.env.local yet. Run `pnpm --filter @repo/backend setup` first.",
  );
}

if (existsSync(appEnvPath)) {
  const currentAppEnv = readFileSync(appEnvPath, "utf8");
  if (
    readValue(currentAppEnv, "VITE_CONVEX_URL") &&
    readValue(currentAppEnv, "VITE_CONVEX_SITE_URL")
  ) {
    console.log("Frontend Convex URLs are already configured; .env.local was left unchanged.");
    process.exit(0);
  }

  throw new Error(
    "apps/website/.env.local already exists but does not contain both Convex URLs. It was left unchanged; add VITE_CONVEX_URL and VITE_CONVEX_SITE_URL manually.",
  );
}

const backendEnv = readFileSync(backendEnvPath, "utf8");
const convexUrl = readValue(backendEnv, "CONVEX_URL");
const convexSiteUrl = readValue(backendEnv, "CONVEX_SITE_URL");

if (!convexUrl || !convexSiteUrl) {
  throw new Error(
    "packages/backend/.env.local is missing CONVEX_URL or CONVEX_SITE_URL.",
  );
}

writeFileSync(
  appEnvPath,
  [
    "# Generated once by the Convex backend setup; safe to customize locally.",
    `VITE_CONVEX_URL=${JSON.stringify(convexUrl)}`,
    `VITE_CONVEX_SITE_URL=${JSON.stringify(convexSiteUrl)}`,
    'VITE_SITE_URL="http://localhost:3000"',
    "",
  ].join("\n"),
  { flag: "wx" },
);

console.log("Created apps/website/.env.local with local Convex URLs.");
