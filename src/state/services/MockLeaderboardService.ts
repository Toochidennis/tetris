import type { GameMode } from "../../engine/types";
import type { LeaderboardEntry, LeaderboardService } from "./LeaderboardService";
import { generateMockEntries, randomEntry } from "./mockData";

const LS_KEY = "blockfall.leaderboard.v1";

// Fake leaderboard that persists to localStorage and simulates realtime
// updates by injecting a new entry every 30-60s. Swap for a real backend
// by writing a class with the same LeaderboardService methods.
export class MockLeaderboardService implements LeaderboardService {
  private store: Record<string, LeaderboardEntry[]>;
  private subs = new Map<GameMode, Set<(e: LeaderboardEntry[]) => void>>();
  private timers = new Map<GameMode, number>();

  constructor() {
    this.store = this.load();
  }

  private load(): Record<string, LeaderboardEntry[]> {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      /* ignore */
    }
    const seeded: Record<string, LeaderboardEntry[]> = {
      marathon: generateMockEntries("marathon"),
      sprint: generateMockEntries("sprint"),
      ultra: generateMockEntries("ultra"),
      daily: generateMockEntries("daily"),
    };
    this.persist(seeded);
    return seeded;
  }

  private persist(s = this.store) {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(s));
    } catch {
      /* ignore */
    }
  }

  private ranked(mode: GameMode): LeaderboardEntry[] {
    const list = [...(this.store[mode] ?? [])].sort((a, b) =>
      mode === "sprint" ? a.score - b.score : b.score - a.score
    );
    return list.map((e, i) => ({ ...e, rank: i + 1 }));
  }

  async getTop(mode: GameMode, limit: number): Promise<LeaderboardEntry[]> {
    return this.ranked(mode).slice(0, limit);
  }

  async submit(
    entry: Omit<LeaderboardEntry, "id" | "rank" | "createdAt">
  ): Promise<LeaderboardEntry> {
    const full: LeaderboardEntry = {
      ...entry,
      id: `me-${Date.now()}`,
      rank: 0,
      createdAt: Date.now(),
    };
    this.store[entry.mode] = [...(this.store[entry.mode] ?? []), full];
    this.persist();
    this.emit(entry.mode);
    const ranked = this.ranked(entry.mode);
    return ranked.find((e) => e.id === full.id)!;
  }

  subscribe(mode: GameMode, cb: (e: LeaderboardEntry[]) => void): () => void {
    if (!this.subs.has(mode)) this.subs.set(mode, new Set());
    this.subs.get(mode)!.add(cb);
    cb(this.ranked(mode));

    if (!this.timers.has(mode)) {
      const tick = () => {
        const e = randomEntry(mode);
        this.store[mode] = [
          ...(this.store[mode] ?? []),
          { ...e, id: `live-${Date.now()}`, rank: 0, createdAt: Date.now() },
        ];
        this.persist();
        this.emit(mode);
        const next = 30_000 + Math.random() * 30_000;
        this.timers.set(mode, window.setTimeout(tick, next));
      };
      this.timers.set(mode, window.setTimeout(tick, 30_000 + Math.random() * 30_000));
    }

    return () => {
      this.subs.get(mode)?.delete(cb);
    };
  }

  private emit(mode: GameMode) {
    const ranked = this.ranked(mode);
    this.subs.get(mode)?.forEach((cb) => cb(ranked));
  }
}
