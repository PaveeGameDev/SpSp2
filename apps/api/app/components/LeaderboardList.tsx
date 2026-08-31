"use client";

import type { LeaderboardEntryDTO } from "@sponsor/shared";
import { useState } from "react";

import { TierBadge } from "./TierBadge";

export function LeaderboardList({
  alltime,
  monthly,
  currentUserId,
  limit,
}: {
  alltime: LeaderboardEntryDTO[];
  monthly: LeaderboardEntryDTO[];
  currentUserId: string;
  limit?: number;
}) {
  const [scope, setScope] = useState<"alltime" | "monthly">("alltime");
  const entries = (scope === "alltime" ? alltime : monthly).slice(0, limit);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button
          className={`button ${scope === "alltime" ? "button-primary" : ""}`}
          onClick={() => setScope("alltime")}
        >
          All-Time
        </button>
        <button
          className={`button ${scope === "monthly" ? "button-primary" : ""}`}
          onClick={() => setScope("monthly")}
        >
          This Month
        </button>
      </div>

      {entries.length === 0 && <p className="muted">No logs yet — be the first!</p>}
      {entries.map((entry) => (
        <div key={entry.userId} className={`list-row ${entry.userId === currentUserId ? "me" : ""}`}>
          <span>
            {entry.rank}. {entry.name}
          </span>
          <span style={{ display: "flex", gap: 8, alignItems: "center" }}>
            {entry.points} pts <TierBadge tier={entry.tier} />
          </span>
        </div>
      ))}
    </div>
  );
}
