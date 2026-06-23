import { MockLeaderboardService } from "./MockLeaderboardService";
import { LocalProfileService } from "./LocalProfileService";
import { ApiLeaderboardService } from "./ApiLeaderboardService";
import { ApiProfileService } from "./ApiProfileService";
import type { LeaderboardService } from "./LeaderboardService";
import type { ProfileService } from "./ProfileService";

// ── Backend wiring ──────────────────────────────────────────────────────────
// Set VITE_API_URL in a .env file (see .env.example) to switch the whole app
// onto a real backend. With no env var set, it runs fully offline on the
// localStorage-backed mock services. No UI code changes either way.
const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

// Plug your auth here when you add it (e.g. read a token from your auth store).
const getAuthToken = (): string | null => null;

export const leaderboardService: LeaderboardService = API_URL
  ? new ApiLeaderboardService(API_URL, 15_000, getAuthToken)
  : new MockLeaderboardService();

export const profileService: ProfileService = API_URL
  ? new ApiProfileService(API_URL, getAuthToken)
  : new LocalProfileService();

export type { LeaderboardEntry, LeaderboardService } from "./LeaderboardService";
export type { PlayerProfile, ProfileService } from "./ProfileService";
