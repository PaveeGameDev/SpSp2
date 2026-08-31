import { SignJWT, jwtVerify } from "jose";

// Name of the HttpOnly cookie the web OAuth callbacks set this same token in.
export const SESSION_COOKIE_NAME = "session";

function secret() {
  const value = process.env.JWT_SECRET;
  if (!value) throw new Error("JWT_SECRET is not set");
  return new TextEncoder().encode(value);
}

// Long-lived on purpose: trusted internal team, no refresh-token flow for v1.
const SESSION_LIFETIME = "180d";

export async function signSessionToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(SESSION_LIFETIME)
    .sign(secret());
}

export async function verifySessionToken(token: string): Promise<string> {
  const { payload } = await jwtVerify(token, secret());
  if (typeof payload.sub !== "string") throw new Error("Invalid session token");
  return payload.sub;
}
