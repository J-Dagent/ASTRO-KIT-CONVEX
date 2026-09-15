const expectedHosts = {
  VITE_CONVEX_URL: ".convex.cloud",
  VITE_CONVEX_SITE_URL: ".convex.site",
};

const errors = [];

for (const [name, suffix] of Object.entries(expectedHosts)) {
  const value = process.env[name];
  if (!value) {
    errors.push(`${name} is required.`);
    continue;
  }

  try {
    const url = new URL(value);
    if (url.protocol !== "https:") {
      errors.push(`${name} must use HTTPS.`);
    }
    if (!url.hostname.endsWith(suffix)) {
      errors.push(`${name} must target ${suffix}.`);
    }
  } catch {
    errors.push(`${name} must be a valid URL.`);
  }
}

if (errors.length > 0) {
  console.error("Production deployment configuration is invalid:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log("Production Convex URLs are valid.");
