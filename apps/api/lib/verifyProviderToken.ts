import { OAuth2Client } from "google-auth-library";
import { createRemoteJWKSet, jwtVerify } from "jose";

export interface VerifiedIdentity {
  providerId: string;
  email: string;
  name: string | null;
  avatarUrl: string | null;
}

const googleClient = new OAuth2Client();

export async function verifyGoogleIdToken(idToken: string): Promise<VerifiedIdentity> {
  const clientIds = (process.env.GOOGLE_CLIENT_IDS ?? "").split(",").map((id) => id.trim()).filter(Boolean);
  if (clientIds.length === 0) throw new Error("GOOGLE_CLIENT_IDS is not set");

  const ticket = await googleClient.verifyIdToken({ idToken, audience: clientIds });
  const payload = ticket.getPayload();
  if (!payload?.sub || !payload.email) throw new Error("Google token missing sub/email");

  return {
    providerId: payload.sub,
    email: payload.email,
    name: payload.name ?? null,
    avatarUrl: payload.picture ?? null,
  };
}

const appleJWKS = createRemoteJWKSet(new URL("https://appleid.apple.com/auth/keys"));

export async function verifyAppleIdToken(idToken: string): Promise<VerifiedIdentity> {
  const bundleId = process.env.APPLE_BUNDLE_ID;
  if (!bundleId) throw new Error("APPLE_BUNDLE_ID is not set");

  const { payload } = await jwtVerify(idToken, appleJWKS, {
    issuer: "https://appleid.apple.com",
    audience: bundleId,
  });
  if (typeof payload.sub !== "string") throw new Error("Apple token missing sub");

  return {
    providerId: payload.sub,
    // Apple only ever includes email in the identity token (private-relay or real).
    // It never includes name there — the client must send it on first sign-in.
    email: typeof payload.email === "string" ? payload.email : "",
    name: null,
    avatarUrl: null,
  };
}
