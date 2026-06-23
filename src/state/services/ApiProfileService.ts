import type { PlayerProfile, ProfileService } from "./ProfileService";

/**
 * REST-backed profile, implementing the same interface as LocalProfileService.
 *
 * The ProfileService interface is synchronous (the app reads the profile during
 * render), so this keeps a local cache (mirrored to localStorage for instant
 * boot) and writes through to the backend in the background. Expected endpoints:
 *   GET    {base}/profile   -> PlayerProfile | 404
 *   PUT    {base}/profile   -> PlayerProfile   (body: profile)
 *   DELETE {base}/profile
 *
 * Call `hydrate()` once at startup to refresh the cache from the server.
 */
const CACHE_KEY = "blockfall.profile.cache.v1";

export class ApiProfileService implements ProfileService {
  private cache: PlayerProfile | null;

  constructor(
    private baseUrl: string,
    private getAuthToken?: () => string | null
  ) {
    this.cache = this.readCache();
  }

  private headers(): HeadersInit {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    const token = this.getAuthToken?.();
    if (token) h["Authorization"] = `Bearer ${token}`;
    return h;
  }

  private readCache(): PlayerProfile | null {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      return raw ? (JSON.parse(raw) as PlayerProfile) : null;
    } catch {
      return null;
    }
  }

  private writeCache(p: PlayerProfile | null) {
    try {
      if (p) localStorage.setItem(CACHE_KEY, JSON.stringify(p));
      else localStorage.removeItem(CACHE_KEY);
    } catch {
      /* ignore */
    }
  }

  /** Refresh the local cache from the server; returns the latest profile. */
  async hydrate(): Promise<PlayerProfile | null> {
    try {
      const res = await fetch(`${this.baseUrl}/profile`, { headers: this.headers() });
      if (res.status === 404) { this.cache = null; this.writeCache(null); return null; }
      if (!res.ok) return this.cache;
      const p = (await res.json()) as PlayerProfile;
      this.cache = p; this.writeCache(p);
      return p;
    } catch {
      return this.cache;
    }
  }

  get(): PlayerProfile | null {
    return this.cache;
  }

  save(p: PlayerProfile): void {
    this.cache = p;
    this.writeCache(p);
    // Write through; fire-and-forget (UI already updated optimistically).
    fetch(`${this.baseUrl}/profile`, {
      method: "PUT",
      headers: this.headers(),
      body: JSON.stringify(p),
    }).catch(() => { /* offline-tolerant; cache holds the source of truth */ });
  }

  clear(): void {
    this.cache = null;
    this.writeCache(null);
    fetch(`${this.baseUrl}/profile`, { method: "DELETE", headers: this.headers() }).catch(() => {});
  }
}
