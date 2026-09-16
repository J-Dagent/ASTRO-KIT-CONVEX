const publicConfig = [
  "CLOUDFLARE_ACCOUNT_ID",
  "GOOGLE_CLIENT_ID",
  "POLAR_SERVER",
  "SITE_URL",
  "PUBLIC_CONVEX_URL",
  "PUBLIC_CONVEX_SITE_URL",
];

const privateConfig = [
  "BETTER_AUTH_SECRET",
  "CLOUDFLARE_API_TOKEN",
  "CONVEX_DEPLOY_KEY",
  "GOOGLE_CLIENT_SECRET",
  "POLAR_ORGANIZATION_TOKEN",
  "POLAR_WEBHOOK_SECRET",
];

const errors = [];
for (const name of [...publicConfig, ...privateConfig]) {
  if (!process.env[name]?.trim()) errors.push(`${name} is required.`);
}

if (
  process.env.POLAR_SERVER &&
  !["sandbox", "production"].includes(process.env.POLAR_SERVER)
) {
  errors.push("POLAR_SERVER must be sandbox or production.");
}

const expectedHostSuffix = {
  SITE_URL: undefined,
  PUBLIC_CONVEX_URL: ".convex.cloud",
  PUBLIC_CONVEX_SITE_URL: ".convex.site",
};

for (const [name, suffix] of Object.entries(expectedHostSuffix)) {
  const value = process.env[name];
  if (!value) continue;
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") {
      errors.push(`${name} must use HTTPS.`);
    }
    if (suffix && !url.hostname.endsWith(suffix)) {
      errors.push(`${name} must target ${suffix}.`);
    }
  } catch {
    errors.push(`${name} must be a valid URL.`);
  }
}

if (errors.length > 0) {
  console.error("Production deployment configuration is incomplete:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Public configuration and required private deployment values are present.");
