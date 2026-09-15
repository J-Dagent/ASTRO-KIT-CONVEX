import { readdir, readFile } from "node:fs/promises";
import { basename, join, relative, resolve } from "node:path";

const root = resolve(import.meta.dirname, "..");
const outputDirectory = join(root, "apps/website/dist");
const sensitiveName = /(SECRET|PASSWORD|TOKEN|PRIVATE_KEY|API_KEY)/i;
const dotenvNames = new Set([".env", ".env.local", ".dev.vars"]);

const ignoredSourceDirectories = new Set([
  ".git",
  ".wrangler",
  "dist",
  "node_modules",
]);

async function walk(directory, { ignoreBuildDirectories = false } = {}) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (
      ignoreBuildDirectories &&
      entry.isDirectory() &&
      ignoredSourceDirectories.has(entry.name)
    ) {
      continue;
    }
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walk(path, { ignoreBuildDirectories })));
    }
    if (entry.isFile()) files.push(path);
  }
  return files;
}

function parseSensitiveValues(contents) {
  return contents
    .split(/\r?\n/)
    .map((line) => line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i))
    .filter((match) => match && sensitiveName.test(match[1]))
    .map((match) => match[2].replace(/^(['"`])|(['"`])$/g, "").trim())
    .filter((value) => value.length >= 12 && !/^(?:your-|replace-|example)/i.test(value));
}

function parseLocalRuntimeValues(contents) {
  return contents
    .split(/\r?\n/)
    .map((line) => line.match(/^\s*[A-Z0-9_]+\s*=\s*(.*)\s*$/i))
    .filter(Boolean)
    .map((match) => match[1].replace(/^(['"`])|(['"`])$/g, "").trim())
    .filter((value) => {
      try {
        const hostname = new URL(value).hostname;
        return hostname === "127.0.0.1" || hostname === "localhost" || hostname === "::1";
      } catch {
        return false;
      }
    });
}

const sourceFiles = await walk(root, { ignoreBuildDirectories: true });
const localSecretValues = [];
const localRuntimeValues = [];
for (const path of sourceFiles) {
  if (!dotenvNames.has(basename(path)) || path.startsWith(outputDirectory)) continue;
  const contents = await readFile(path, "utf8");
  localSecretValues.push(...parseSensitiveValues(contents));
  localRuntimeValues.push(...parseLocalRuntimeValues(contents));
}

const errors = [];
for (const path of await walk(outputDirectory)) {
  const contents = await readFile(path);
  const text = contents.toString("utf8");
  const outputPath = relative(outputDirectory, path);
  const isRenderedDocumentation = outputPath.startsWith("client/docs/");
  if (
    !path.endsWith(".md") &&
    !isRenderedDocumentation &&
    localRuntimeValues.some((value) => text.includes(value))
  ) {
    errors.push(`${relative(root, path)} contains a loopback runtime URL.`);
  }
  if (localSecretValues.some((secret) => text.includes(secret))) {
    errors.push(`${relative(root, path)} contains a value from a local secret variable.`);
  }
}

if (errors.length > 0) {
  console.error("Production build validation failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Production build contains no loopback runtime URL or local secret value.");
