import { NextRequest, NextResponse } from "next/server";

import { OAUTH_STATE_COOKIE } from "@/lib/oauthState";
import { SESSION_COOKIE_NAME, signSessionToken } from "@/lib/session";
import { DuplicateEmailError, upsertUserFromIdentity } from "@/lib/upsertUserFromIdentity";
import { verifyGoogleIdToken } from "@/lib/verifyProviderToken";

interface GoogleTokenResponse {
  id_token?: string;
  error?: string;
  error_description?: string;
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expectedState = request.cookies.get(OAUTH_STATE_COOKIE)?.value;

  const clearStateCookie = (response: NextResponse) => {
    response.cookies.delete(OAUTH_STATE_COOKIE);
    return response;
  };

  if (!code || !state || !expectedState || state !== expectedState) {
    return clearStateCookie(
      NextResponse.json({ error: "Invalid or expired sign-in attempt. Please try again." }, { status: 400 }),
    );
  }

  const clientId = process.env.GOOGLE_WEB_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_WEB_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return clearStateCookie(
      NextResponse.json({ error: "GOOGLE_WEB_CLIENT_ID/GOOGLE_WEB_CLIENT_SECRET not set" }, { status: 500 }),
    );
  }

  const redirectUri = new URL("/api/auth/google/callback", request.url).toString();

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  const tokenBody = (await tokenRes.json()) as GoogleTokenResponse;

  if (!tokenRes.ok || !tokenBody.id_token) {
    return clearStateCookie(
      NextResponse.json(
        { error: `Google token exchange failed: ${tokenBody.error_description ?? tokenBody.error ?? tokenRes.status}` },
        { status: 401 },
      ),
    );
  }

  let identity;
  try {
    identity = await verifyGoogleIdToken(tokenBody.id_token);
  } catch (err) {
    return clearStateCookie(
      NextResponse.json({ error: `Token verification failed: ${(err as Error).message}` }, { status: 401 }),
    );
  }

  let user;
  try {
    user = await upsertUserFromIdentity("google", identity);
  } catch (err) {
    if (err instanceof DuplicateEmailError) {
      return clearStateCookie(NextResponse.json({ error: err.message }, { status: 409 }));
    }
    throw err;
  }

  const token = await signSessionToken(user.id);

  const response = NextResponse.redirect(new URL("/", request.url));
  response.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 180,
    path: "/",
  });
  return clearStateCookie(response);
}
