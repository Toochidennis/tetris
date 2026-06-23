import type { PlayerProfile } from "../services/ProfileService";
import type { GameSummary } from "../../engine/types";
import { ACHIEVEMENTS } from "./definitions";

// Pure evaluator — given the (already stat-updated) profile and the run summary,
// return the ids that just became unlocked. Kept pure so it could also run
// server-side later for anti-cheat without restructuring.
export function evaluateAchievements(profile: PlayerProfile, summary: GameSummary | null): string[] {
  const newly: string[] = [];
  for (const a of ACHIEVEMENTS) {
    if (profile.achievements[a.id]) continue; // already unlocked
    if (a.check({ profile, summary })) newly.push(a.id);
  }
  return newly;
}

export function utcDate(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10);
}

// Returns the new streak given the previous daily date + streak.
export function nextStreak(lastDailyDate: string, prevStreak: number, nowMs: number): number {
  const today = utcDate(nowMs);
  if (lastDailyDate === today) return Math.max(prevStreak, 1); // already counted today
  const yesterday = utcDate(nowMs - 86_400_000);
  if (lastDailyDate === yesterday) return prevStreak + 1;
  return 1; // streak broken (or first ever)
}
