import type { OutcomeKey } from "./outcomes";
import type { Tier } from "./tiers";

export type ActivityCategory = "online" | "in_person";

export interface UserDTO {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  totalPoints: number;
  monthlyPoints: number;
  currentTier: Tier;
}

export interface AuthCallbackRequest {
  provider: "google" | "apple";
  idToken: string;
  // Apple only ever provides the user's name on their very first sign-in, via
  // the native SDK response (never inside the identity token itself).
  name?: string;
}

export interface AuthCallbackResponse {
  token: string;
  user: UserDTO;
}

export interface ActivityTypeDTO {
  key: string;
  label: string;
  category: ActivityCategory;
  points: number;
  sortOrder: number;
}

export interface LogDTO {
  id: string;
  activityType: string;
  points: number;
  companyName: string;
  contactName: string | null;
  outcome: OutcomeKey;
  notes: string | null;
  createdAt: string;
}

export interface FeedEntryDTO extends LogDTO {
  user: { id: string; name: string; avatarUrl: string | null };
}

export interface LeaderboardEntryDTO {
  rank: number;
  userId: string;
  name: string;
  avatarUrl: string | null;
  points: number;
  tier: Tier;
}

export interface PoolStatsDTO {
  month: string; // "2026-08"
  totalPointsThisMonth: number;
  pointsPerDollarRatio: number;
  dollars: number;
  cap: number | null;
}

export interface CreateLogRequest {
  activityType: string;
  companyName: string;
  contactName?: string;
  outcome: OutcomeKey;
  notes?: string;
}

export interface CreateLogResponse {
  log: LogDTO;
  totalPoints: number;
  monthlyPoints: number;
  tier: Tier;
  tierCrossed: Tier | null;
}
