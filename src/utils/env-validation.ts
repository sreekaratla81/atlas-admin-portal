export function validateEnv() {
  const required = ["VITE_API_BASE"];
  const missing = required.filter((key) => !import.meta.env[key]);
  if (missing.length > 0) {
    console.error(
      `[Atlas Admin] Missing required environment variables: ${missing.join(", ")}. ` +
      `Copy .env.example to .env and fill in the values.`
    );
  }
}
