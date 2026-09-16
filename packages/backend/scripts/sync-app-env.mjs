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

function assertCloudUrl(value, suffix, name) {
  const url = new URL(value);
  if (url.protocol !== "https:" || !url.hostname.endsWith(suffix)) {
    throw new Error(`${name} must be an HTTPS ${suffix} URL.`);
  }
}

if (!existsSync(backendEnvPath)) {
  throw new Error(
    "Convex has not created packages/backend/.env.local yet. Run `pnpm --filter @repo/backend setup` first.",
  );
}

if (existsSync(appEnvPath)) {
  const currentAppEnv = readFileSync(appEnvPath, "utf8");
  if (
    readValue(currentAppEnv, "PUBLIC_CONVEX_URL") &&
    readValue(currentAppEnv, "PUBLIC_CONVEX_SITE_URL")
  ) {
    assertCloudUrl(
      readValue(currentAppEnv, "PUBLIC_CONVEX_URL"),
      ".convex.cloud",
      "PUBLIC_CONVEX_URL",
    );
    assertCloudUrl(
      readValue(currentAppEnv, "PUBLIC_CONVEX_SITE_URL"),
      ".convex.site",
      "PUBLIC_CONVEX_SITE_URL",
    );
    console.log("Frontend Convex Cloud URLs are already configured; .env.local was left unchanged.");
    process.exit(0);
  }

  throw new Error(
    "apps/website/.env.local already exists but does not contain both PUBLIC_CONVEX_URL and PUBLIC_CONVEX_SITE_URL. It was left unchanged.",
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

assertCloudUrl(convexUrl, ".convex.cloud", "CONVEX_URL");
assertCloudUrl(convexSiteUrl, ".convex.site", "CONVEX_SITE_URL");

writeFileSync(
  appEnvPath,
  [
    "# Generated once from the connected Convex Cloud deployment.",
    `PUBLIC_CONVEX_URL=${JSON.stringify(convexUrl)}`,
    `PUBLIC_CONVEX_SITE_URL=${JSON.stringify(convexSiteUrl)}`,
    'PUBLIC_SITE_URL="http://localhost:3000"',
    "",
  ].join("\n"),
  { flag: "wx" },
);

console.log("Created apps/website/.env.local with Convex Cloud URLs.");
