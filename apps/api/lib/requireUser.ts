import { prisma } from "@sponsor/db";
import { NextRequest } from "next/server";

import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

export class UnauthorizedError extends Error {}

export async function requireUser(request: NextRequest) {
  const header = request.headers.get("authorization");
  const bearerToken = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
  const token = bearerToken ?? request.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;
  if (!token) throw new UnauthorizedError("Not signed in");

  let userId: string;
  try {
    userId = await verifySessionToken(token);
  } catch {
    throw new UnauthorizedError("Invalid session token");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new UnauthorizedError("User no longer exists");

  return user;
}
