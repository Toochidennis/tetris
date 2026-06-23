import type { PlayerProfile } from "../services/ProfileService";
import type { GameSummary } from "../../engine/types";

export type Tier = "bronze" | "silver" | "gold";

export interface AchievementCtx {
  profile: PlayerProfile;
  summary: GameSummary | null; // present only when evaluating after a game
}

export interface AchievementDef {
  id: string;
  /** i18n key suffix: achievements.items.<id>.title / .desc */
  icon: string;
  color: string;
  tier: Tier;
  check: (ctx: AchievementCtx) => boolean;
  /** Cumulative progress for the page's progress bar (omit for one-shot feats). */
  progress?: (p: PlayerProfile) => { current: number; target: number };
}

const bestOf = (p: PlayerProfile) => Math.max(0, ...Object.values(p.bestScores));

// 12 achievements across bronze/silver/gold and all three data sources.
export const ACHIEVEMENTS: AchievementDef[] = [
  // ── Progression (profile stats) ──
  { id: "first_drop", icon: "🎮", color: "#38BDF8", tier: "bronze",
    check: ({ profile }) => profile.gamesPlayed >= 1,
    progress: (p) => ({ current: Math.min(p.gamesPlayed, 1), target: 1 }) },
  { id: "warmed_up", icon: "🔥", color: "#38BDF8", tier: "bronze",
    check: ({ profile }) => profile.gamesPlayed >= 10,
    progress: (p) => ({ current: Math.min(p.gamesPlayed, 10), target: 10 }) },
  { id: "veteran", icon: "🎖️", color: "#8B5CF6", tier: "silver",
    check: ({ profile }) => profile.gamesPlayed >= 50,
    progress: (p) => ({ current: Math.min(p.gamesPlayed, 50), target: 50 }) },
  { id: "century", icon: "💯", color: "#38BDF8", tier: "bronze",
    check: ({ profile }) => profile.totalLines >= 100,
    progress: (p) => ({ current: Math.min(p.totalLines, 100), target: 100 }) },
  { id: "line_cook", icon: "🧹", color: "#8B5CF6", tier: "silver",
    check: ({ profile }) => profile.totalLines >= 1000,
    progress: (p) => ({ current: Math.min(p.totalLines, 1000), target: 1000 }) },
  { id: "high_roller", icon: "💎", color: "#FFC400", tier: "gold",
    check: ({ profile }) => bestOf(profile) >= 50000,
    progress: (p) => ({ current: Math.min(bestOf(p), 50000), target: 50000 }) },

  // ── Skill feats (per-run summary) ──
  { id: "tetris", icon: "🟦", color: "#38BDF8", tier: "silver",
    check: ({ summary }) => !!summary && summary.tetrises >= 1 },
  { id: "spin_doctor", icon: "🌀", color: "#8B5CF6", tier: "silver",
    check: ({ summary }) => !!summary && summary.tSpins >= 1 },
  { id: "combo_king", icon: "⚡", color: "#F59E0B", tier: "gold",
    check: ({ summary }) => !!summary && summary.maxCombo >= 5 },
  { id: "marathoner", icon: "🏔️", color: "#c13cff", tier: "gold",
    check: ({ summary }) => !!summary && summary.maxLevel >= 15 },
  { id: "speed_demon", icon: "🏎️", color: "#FF7A00", tier: "gold",
    check: ({ summary }) => !!summary && summary.mode === "sprint" && summary.finishedGoal && summary.timeMs <= 90_000 },

  // ── Dedication (streak) ──
  { id: "daily_devotion", icon: "📅", color: "#22C55E", tier: "silver",
    check: ({ profile }) => profile.streak >= 3,
    progress: (p) => ({ current: Math.min(p.streak, 3), target: 3 }) },
];

export const ACHIEVEMENT_COUNT = ACHIEVEMENTS.length;
export const achievementById = (id: string) => ACHIEVEMENTS.find((a) => a.id === id);
