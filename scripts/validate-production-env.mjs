const expectedHosts = {
  PUBLIC_CONVEX_URL: ".convex.cloud",
  PUBLIC_CONVEX_SITE_URL: ".convex.site",
};

const errors = [];
const configuredValues = Object.keys(expectedHosts).filter((name) =>
  process.env[name]?.trim(),
);

if (configuredValues.length === 0) {
  console.log(
    "Convex Cloud is not connected yet; the frontend will deploy in disconnected mode.",
  );
  process.exit(0);
}

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

console.log("Production Convex Cloud URLs are valid.");
