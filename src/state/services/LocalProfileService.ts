import type { PlayerProfile, ProfileService } from "./ProfileService";

const LS_KEY = "blockfall.profile.v1";

export class LocalProfileService implements ProfileService {
  get(): PlayerProfile | null {
    try {
      const raw = localStorage.getItem(LS_KEY);
      return raw ? (JSON.parse(raw) as PlayerProfile) : null;
    } catch {
      return null;
    }
  }
  save(p: PlayerProfile): void {
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(p));
    } catch {
      /* ignore */
    }
  }
  clear(): void {
    try {
      localStorage.removeItem(LS_KEY);
    } catch {
      /* ignore */
    }
  }
}
