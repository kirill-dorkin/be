const globalAuth = globalThis as typeof globalThis & {
  __AUTH_SECRET__?: string;
  __AUTH_SECRET_WARNING__?: boolean;
};

function generateFallbackSecret() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID().replace(/-/g, "");
  }

  let secret = "";
  for (let i = 0; i < 32; i += 1) {
    secret += Math.floor(Math.random() * 16).toString(16);
  }
  return secret;
}

export function getAuthSecret(): string {
  const envSecret = typeof process !== "undefined" ? process.env?.NEXTAUTH_SECRET : undefined;

  if (envSecret && envSecret.trim().length >= 32) {
    return envSecret;
  }

  if (!globalAuth.__AUTH_SECRET__) {
    globalAuth.__AUTH_SECRET__ = generateFallbackSecret();
  }

  const isProduction = typeof process !== "undefined" ? process.env?.NODE_ENV === "production" : true;

  if (isProduction && !globalAuth.__AUTH_SECRET_WARNING__) {
    console.warn(
      "[auth] NEXTAUTH_SECRET is not set. Generated a fallback secret for this runtime instance. " +
        "Configure NEXTAUTH_SECRET to ensure stable authentication sessions.",
    );
    globalAuth.__AUTH_SECRET_WARNING__ = true;
  }

  return globalAuth.__AUTH_SECRET__!;
}
