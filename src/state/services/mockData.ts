import type { GameMode } from "../../engine/types";
import type { LeaderboardEntry } from "./LeaderboardService";

const NAMES = [
  "NovaByte", "PixelKing", "TetraQueen", "DropZero", "LineSweep", "GhostStack",
  "ComboCat", "SpinDoctor", "HardDropHal", "BagRunner", "NeonNinja", "ClearLord",
  "BlockSmith", "QuadFiend", "RotaRyu", "SoftLanding", "TSpinTina", "WallKick",
  "VoidGazer", "GridGremlin", "ZenStacker", "MaxCombo", "FrostByte", "EchoFall",
  "LumaPlay", "OrbitO", "JediJ", "ZagZora", "SkyClear", "AceDropper",
];
const COUNTRIES = [
  "NG", "US", "GB", "JP", "KR", "BR", "DE", "FR", "IN", "CN",
  "EG", "ZA", "CA", "AU", "MX", "ES", "IT", "RU", "TR", "SE",
];

function seededScore(i: number, mode: GameMode): number {
  const base = mode === "sprint" ? 12000 : mode === "ultra" ? 80000 : 150000;
  const v = Math.floor(base * Math.pow(0.93, i)) + (i * 137) % 500;
  return v;
}

// Deterministic avatar (0..4) from a username — stable per player.
function avatarFor(name: string): number {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h % 5;
}

export function generateMockEntries(mode: GameMode, count = 80): LeaderboardEntry[] {
  const entries: LeaderboardEntry[] = [];
  for (let i = 0; i < count; i++) {
    const username = NAMES[i % NAMES.length] + (i >= NAMES.length ? `${Math.floor(i / NAMES.length)}` : "");
    entries.push({
      id: `mock-${mode}-${i}`,
      rank: 0,
      username,
      countryCode: COUNTRIES[i % COUNTRIES.length],
      avatarId: avatarFor(username),
      score: seededScore(i, mode),
      mode,
      createdAt: Date.now() - i * 3_600_000,
    });
  }
  return entries;
}

export function randomEntry(mode: GameMode): Omit<LeaderboardEntry, "id" | "rank" | "createdAt"> {
  const name = NAMES[Math.floor(Math.random() * NAMES.length)] + Math.floor(Math.random() * 99);
  return {
    username: name,
    countryCode: COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)],
    avatarId: avatarFor(name),
    score: seededScore(Math.floor(Math.random() * 30) + 3, mode),
    mode,
  };
}
