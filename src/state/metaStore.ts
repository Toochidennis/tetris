import { create } from "zustand";
import type { GameMode, GameSummary } from "../engine/types";
import { profileService } from "./services";
import type { PlayerProfile } from "./services";
import { evaluateAchievements, nextStreak, utcDate } from "./achievements/evaluate";
import { SUPPORTED_LANGS } from "../i18n";

// Fill defaults on profiles created before achievements/streak existed.
function normalizeProfile(p: PlayerProfile | null): PlayerProfile | null {
  if (!p) return null;
  return {
    ...p,
    avatarId: p.avatarId ?? 0,
    achievements: p.achievements ?? {},
    streak: p.streak ?? 0,
    lastDailyDate: p.lastDailyDate ?? "",
  };
}

export type Screen =
  | "splash"
  | "onboarding"
  | "menu"
  | "modeSelect"
  | "game"
  | "leaderboard"
  | "achievements"
  | "settings";

export type ThemeName = "neon-dark" | "classic" | "minimal-light";

interface Settings {
  language: string;
  theme: ThemeName;
  handedness: "left" | "right";
  sfxVolume: number;
  musicVolume: number;
  reducedMotion: boolean;
}

const SETTINGS_KEY = "blockfall.settings.v1";
const SUPPORTED_CODES = SUPPORTED_LANGS;

// The user's default language = the device language on first open, clamped to a
// language we actually support (else English).
function deviceLanguage(): string {
  const nav = (navigator.language || "en").split("-")[0].toLowerCase();
  return SUPPORTED_CODES.includes(nav) ? nav : "en";
}

function defaultSettings(): Settings {
  return {
    language: deviceLanguage(),
    theme: "neon-dark",
    handedness: "right",
    sfxVolume: 0.7,
    musicVolume: 0.4,
    reducedMotion:
      typeof matchMedia !== "undefined" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches,
  };
}

function loadSettings(): Settings {
  const base = defaultSettings();
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...base, ...JSON.parse(raw) }; // merge so new fields get defaults
  } catch {
    /* ignore */
  }
  return base;
}

interface MetaStore {
  screen: Screen;
  selectedMode: GameMode;
  profile: PlayerProfile | null;
  settings: Settings;
  achievementQueue: string[]; // ids waiting to be toasted
  hasUnseenAchievements: boolean; // drives the Menu "new" badge
  setScreen: (s: Screen) => void;
  setMode: (m: GameMode) => void;
  setSettings: (patch: Partial<Settings>) => void;
  createProfile: (username: string, countryCode: string, avatarId?: number) => void;
  setAvatar: (avatarId: number) => void;
  recordGame: (summary: GameSummary) => void;
  dismissAchievementToast: (id: string) => void;
  markAchievementsSeen: () => void;
  clearProfile: () => void;
  resetAll: () => void;
}

export const useMetaStore = create<MetaStore>((set, get) => ({
  screen: "splash",
  selectedMode: "marathon",
  profile: normalizeProfile(profileService.get()),
  settings: loadSettings(),
  achievementQueue: [],
  hasUnseenAchievements: false,

  setScreen: (s) => {
    if (s === "achievements") set({ hasUnseenAchievements: false });
    set({ screen: s });
  },
  setMode: (m) => set({ selectedMode: m }),

  setSettings: (patch) => {
    const next = { ...get().settings, ...patch };
    set({ settings: next });
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  },

  createProfile: (username, countryCode, avatarId = 0) => {
    const p: PlayerProfile = {
      username,
      countryCode,
      avatarId,
      createdAt: Date.now(),
      bestScores: {},
      totalLines: 0,
      gamesPlayed: 0,
      recentScores: [],
      achievements: {},
      streak: 0,
      lastDailyDate: "",
    };
    profileService.save(p);
    set({ profile: p });
  },

  setAvatar: (avatarId) => {
    const p = get().profile;
    if (!p) return;
    const updated = { ...p, avatarId };
    profileService.save(updated);
    set({ profile: updated });
  },

  recordGame: (summary) => {
    const p = get().profile;
    if (!p) return;
    const { mode, score, lines } = summary;
    const now = Date.now();

    // Daily streak update.
    let streak = p.streak;
    let lastDailyDate = p.lastDailyDate;
    if (mode === "daily") {
      streak = nextStreak(p.lastDailyDate, p.streak, now);
      lastDailyDate = utcDate(now);
    }

    const updated: PlayerProfile = {
      ...p,
      bestScores: { ...p.bestScores, [mode]: Math.max(p.bestScores[mode] ?? 0, score) },
      totalLines: p.totalLines + lines,
      gamesPlayed: p.gamesPlayed + 1,
      recentScores: [...p.recentScores, score].slice(-10),
      streak,
      lastDailyDate,
    };

    // Evaluate achievements against the freshly-updated stats + this run.
    const newly = evaluateAchievements(updated, summary);
    if (newly.length) {
      updated.achievements = { ...updated.achievements };
      for (const id of newly) updated.achievements[id] = now;
    }

    profileService.save(updated);
    set((s) => ({
      profile: updated,
      achievementQueue: newly.length ? [...s.achievementQueue, ...newly] : s.achievementQueue,
      hasUnseenAchievements: s.hasUnseenAchievements || newly.length > 0,
    }));
  },

  dismissAchievementToast: (id) =>
    set((s) => ({ achievementQueue: s.achievementQueue.filter((x) => x !== id) })),

  markAchievementsSeen: () => set({ hasUnseenAchievements: false }),

  clearProfile: () => {
    profileService.clear();
    set({ profile: null, achievementQueue: [], hasUnseenAchievements: false });
  },

  // Full reset: wipe the profile AND restore default settings — including the
  // language, which goes back to the device's default language.
  resetAll: () => {
    profileService.clear();
    const fresh = defaultSettings();
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(fresh));
    } catch {
      /* ignore */
    }
    set({
      profile: null,
      settings: fresh,
      achievementQueue: [],
      hasUnseenAchievements: false,
    });
  },
}));
