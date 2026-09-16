import { existsSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const envPath = fileURLToPath(new URL("../.env.local", import.meta.url));
const sources = [process.env];

if (existsSync(envPath)) {
  const fileValues = {};
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    fileValues[match[1]] = match[2].replace(/^(['"])(.*)\1$/, "$2");
  }
  sources.push(fileValues);
}

const valueFor = (name) => sources.find((source) => source[name])?.[name];
const deployment = valueFor("CONVEX_DEPLOYMENT");
const urls = [valueFor("CONVEX_URL"), valueFor("CONVEX_SITE_URL")].filter(Boolean);

if (
  deployment?.startsWith("local:") ||
  urls.some((value) => {
    try {
      const host = new URL(value).hostname;
      return host === "localhost" || host === "127.0.0.1" || host === "::1";
    } catch {
      return false;
    }
  })
) {
  throw new Error(
    "Local Convex configuration is not supported. Connect or inject a Convex Cloud deployment first.",
  );
}

console.log("Convex configuration is Cloud-compatible.");
