import { Prisma, prisma, type User } from "@sponsor/db";
import type { Tier, UserDTO } from "@sponsor/shared";

import type { VerifiedIdentity } from "@/lib/verifyProviderToken";

export class DuplicateEmailError extends Error {}

export async function upsertUserFromIdentity(
  provider: "google" | "apple",
  identity: VerifiedIdentity,
  fallbackName?: string,
): Promise<User> {
  const name = identity.name ?? fallbackName ?? "New Member";
  try {
    return await prisma.user.upsert({
      where: { authProviderId: identity.providerId },
      update: identity.avatarUrl ? { avatarUrl: identity.avatarUrl } : {},
      create: {
        email: identity.email,
        name,
        avatarUrl: identity.avatarUrl,
        authProvider: provider,
        authProviderId: identity.providerId,
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      throw new DuplicateEmailError(
        "An account with this email already exists under a different sign-in method.",
      );
    }
    throw err;
  }
}

export function userToDTO(user: User): UserDTO {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    totalPoints: user.totalPoints,
    monthlyPoints: user.monthlyPoints,
    currentTier: user.currentTier as Tier,
  };
}
