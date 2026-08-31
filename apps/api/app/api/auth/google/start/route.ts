import { randomBytes } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

import { OAUTH_STATE_COOKIE } from "@/lib/oauthState";

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_WEB_CLIENT_ID;
  if (!clientId) return Response.json({ error: "GOOGLE_WEB_CLIENT_ID is not set" }, { status: 500 });

  const state = randomBytes(16).toString("hex");
  const redirectUri = new URL("/api/auth/google/callback", request.url).toString();

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("state", state);
  authUrl.searchParams.set("prompt", "select_account");

  const response = NextResponse.redirect(authUrl);
  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 600,
    path: "/",
  });
  return response;
}
