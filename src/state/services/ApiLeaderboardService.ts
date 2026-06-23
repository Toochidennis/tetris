import type { GameMode } from "../../engine/types";
import type { LeaderboardEntry, LeaderboardService } from "./LeaderboardService";

/**
 * REST-backed leaderboard. Drop-in replacement for MockLeaderboardService —
 * it implements the exact same interface, so no UI changes are needed.
 *
 * Wire it up by setting VITE_API_URL (see services/index.ts). Expected endpoints:
 *   GET  {base}/leaderboard/:mode?limit=100   -> LeaderboardEntry[]
 *   POST {base}/leaderboard                    -> LeaderboardEntry  (body: entry)
 *   (optional) GET {base}/leaderboard/:mode/stream  -> SSE of LeaderboardEntry[]
 *
 * `subscribe` uses Server-Sent Events when available and otherwise falls back to
 * polling, so realtime is optional on the backend.
 */
export class ApiLeaderboardService implements LeaderboardService {
  constructor(
    private baseUrl: string,
    private pollMs = 15_000,
    private getAuthToken?: () => string | null
  ) {}

  private headers(): HeadersInit {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    const token = this.getAuthToken?.();
    if (token) h["Authorization"] = `Bearer ${token}`;
    return h;
  }

  async getTop(mode: GameMode, limit: number): Promise<LeaderboardEntry[]> {
    const res = await fetch(`${this.baseUrl}/leaderboard/${mode}?limit=${limit}`, {
      headers: this.headers(),
    });
    if (!res.ok) throw new Error(`Leaderboard fetch failed: ${res.status}`);
    return (await res.json()) as LeaderboardEntry[];
  }

  async submit(
    entry: Omit<LeaderboardEntry, "id" | "rank" | "createdAt">
  ): Promise<LeaderboardEntry> {
    const res = await fetch(`${this.baseUrl}/leaderboard`, {
      method: "POST",
      headers: this.headers(),
      body: JSON.stringify(entry),
    });
    if (!res.ok) throw new Error(`Score submit failed: ${res.status}`);
    return (await res.json()) as LeaderboardEntry;
  }

  subscribe(mode: GameMode, cb: (entries: LeaderboardEntry[]) => void): () => void {
    let stopped = false;

    // Prefer SSE for realtime; fall back to polling.
    if (typeof EventSource !== "undefined") {
      try {
        const es = new EventSource(`${this.baseUrl}/leaderboard/${mode}/stream`);
        es.onmessage = (ev) => {
          try { cb(JSON.parse(ev.data) as LeaderboardEntry[]); } catch { /* ignore */ }
        };
        // Seed once immediately so the UI isn't empty while the stream warms up.
        this.getTop(mode, 100).then((e) => { if (!stopped) cb(e); }).catch(() => {});
        return () => { stopped = true; es.close(); };
      } catch {
        /* fall through to polling */
      }
    }

    const poll = () => {
      if (stopped) return;
      this.getTop(mode, 100).then((e) => { if (!stopped) cb(e); }).catch(() => {});
    };
    poll();
    const id = window.setInterval(poll, this.pollMs);
    return () => { stopped = true; clearInterval(id); };
  }
}
