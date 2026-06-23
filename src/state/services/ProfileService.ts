export interface PlayerProfile {
  username: string;
  countryCode: string;
  avatarId: number; // index into the shared avatar set (chosen at onboarding)
  createdAt: number;
  bestScores: Record<string, number>; // mode -> best
  totalLines: number;
  gamesPlayed: number;
  recentScores: number[]; // last 10
  achievements: Record<string, number>; // id -> unlockedAt (ms); absent = locked
  streak: number; // consecutive daily-challenge days
  lastDailyDate: string; // UTC YYYY-MM-DD of last daily played
}

export interface ProfileService {
  get(): PlayerProfile | null;
  save(p: PlayerProfile): void;
  clear(): void;
}
