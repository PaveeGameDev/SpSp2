import { prisma } from "@sponsor/db";
import { cookies } from "next/headers";

import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/session";

// Server Components/layouts use this (reads cookies() directly) instead of
// requireUser (which needs a NextRequest and is for Route Handlers).
export async function getSessionUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const userId = await verifySessionToken(token);
    return await prisma.user.findUnique({ where: { id: userId } });
  } catch {
    return null;
  }
}
