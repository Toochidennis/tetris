import type { GameMode } from "../../engine/types";

export interface LeaderboardEntry {
  id: string;
  rank: number;
  username: string;
  countryCode: string;
  avatarId?: number; // optional: supplied by backend / profile; UI falls back if absent
  score: number;
  mode: GameMode;
  createdAt: number;
}

// Implement this against a real backend later (Supabase/Firebase) without
// touching any UI: just provide another class with these methods.
export interface LeaderboardService {
  getTop(mode: GameMode, limit: number): Promise<LeaderboardEntry[]>;
  submit(
    entry: Omit<LeaderboardEntry, "id" | "rank" | "createdAt">
  ): Promise<LeaderboardEntry>;
  subscribe(
    mode: GameMode,
    cb: (entries: LeaderboardEntry[]) => void
  ): () => void;
}
