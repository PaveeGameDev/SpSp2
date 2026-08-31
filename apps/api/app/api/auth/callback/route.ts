import type { AuthCallbackRequest, AuthCallbackResponse } from "@sponsor/shared";
import { NextRequest } from "next/server";

import { signSessionToken } from "@/lib/session";
import { DuplicateEmailError, upsertUserFromIdentity, userToDTO } from "@/lib/upsertUserFromIdentity";
import { verifyAppleIdToken, verifyGoogleIdToken } from "@/lib/verifyProviderToken";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<AuthCallbackRequest>;

  if (body.provider !== "google" && body.provider !== "apple") {
    return Response.json({ error: "provider must be 'google' or 'apple'" }, { status: 400 });
  }
  if (!body.idToken) {
    return Response.json({ error: "idToken is required" }, { status: 400 });
  }

  let identity;
  try {
    identity =
      body.provider === "google"
        ? await verifyGoogleIdToken(body.idToken)
        : await verifyAppleIdToken(body.idToken);
  } catch (err) {
    return Response.json({ error: `Token verification failed: ${(err as Error).message}` }, { status: 401 });
  }

  let user;
  try {
    user = await upsertUserFromIdentity(body.provider, identity, body.name);
  } catch (err) {
    if (err instanceof DuplicateEmailError) {
      return Response.json({ error: err.message }, { status: 409 });
    }
    throw err;
  }

  const token = await signSessionToken(user.id);

  const response: AuthCallbackResponse = { token, user: userToDTO(user) };
  return Response.json(response);
}
