import { useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useMetaStore } from "../../state/metaStore";
import { useGameStore } from "../../state/gameStore";
import type { GameMode } from "../../engine/types";
import { ArcadeBackground } from "../ArcadeBackground";
import { GameModeCard, TrophyIcon, BoltIcon, StopwatchIcon, CalendarIcon } from "../GameModeCard";

const COLORS = {
  purple: "#c13cff",
  orange: "#ff7a00",
  gold: "#ffc400",
  blue: "#00b8ff",
};

// Time until next UTC midnight (the daily challenge reset), e.g. "12h 45m".
function dailyResetIn(): string {
  const now = new Date();
  const next = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1);
  const ms = next - now.getTime();
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return `${h}h ${m}m remaining`;
}

function PlayerTrophy() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="#ffc400"><path d="M6 4h12v2h3v3a4 4 0 0 1-4 4h-.4A6 6 0 0 1 13 16.9V19h3v2H8v-2h3v-2.1A6 6 0 0 1 7.4 13H7a4 4 0 0 1-4-4V6h3V4Z" /></svg>;
}

function tier(best: number) {
  if (best >= 10000) return "RANK · MASTER";
  if (best >= 5000) return "RANK · PRO";
  if (best >= 1000) return "RANK · RISING";
  return "RANK · ROOKIE";
}

export function ModeSelect() {
  const { t } = useTranslation();
  const { setScreen, setMode, profile } = useMetaStore();
  const start = useGameStore((s) => s.start);

  const launch = (m: GameMode) => {
    setMode(m);
    setScreen("game");
    start(m);
  };

  const best = useMemo(
    () => (profile ? Math.max(0, ...Object.values(profile.bestScores)) : 0),
    [profile]
  );
  const initials = (profile?.username ?? "P").slice(0, 2).toUpperCase();
  const hue = profile ? [...profile.username].reduce((a, c) => a + c.charCodeAt(0), 0) % 360 : 280;
  const scoreFor = (m: GameMode) => {
    const v = profile?.bestScores[m];
    return v != null ? v.toLocaleString() : "—";
  };

  const cards = [
    { mode: "marathon" as GameMode, color: COLORS.purple, icon: <TrophyIcon />,    statLabel: "BEST SCORE", statValue: scoreFor("marathon") },
    { mode: "sprint"   as GameMode, color: COLORS.orange, icon: <BoltIcon />,      statLabel: "BEST SCORE", statValue: scoreFor("sprint") },
    { mode: "ultra"    as GameMode, color: COLORS.gold,   icon: <StopwatchIcon />, statLabel: "HIGH SCORE", statValue: scoreFor("ultra") },
    { mode: "daily"    as GameMode, color: COLORS.blue,   icon: <CalendarIcon />,  statLabel: "RESETS IN",  statValue: dailyResetIn() },
  ];

  return (
    <div style={{ position: "relative", height: "100%", background: "#050816", overflow: "hidden" }}>
      <ArcadeBackground />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ position: "relative", zIndex: 1, height: "100%", overflowY: "auto", display: "flex", flexDirection: "column", padding: "16px 16px 22px", gap: 16 }}
      >
        {/* ── Header ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={() => setScreen("menu")}
            className="glass"
            style={{ width: 40, height: 40, borderRadius: 12, display: "grid", placeItems: "center", fontSize: 18, color: "#A5B4FC", cursor: "pointer", flexShrink: 0 }}
            aria-label={t("common.back", "Back")}
          >←</button>

          {/* player chip */}
          <div className="glass" style={{ display: "flex", alignItems: "center", gap: 9, padding: "6px 12px 6px 6px", flex: 1, borderRadius: 14, minWidth: 0 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 999, display: "grid", placeItems: "center", fontWeight: 800, fontSize: 13, color: "#fff",
              background: `linear-gradient(135deg, hsl(${hue},75%,58%), hsl(${(hue + 40) % 360},75%,46%))`,
              boxShadow: `0 0 12px hsl(${hue},75%,55%,0.6)`,
            }}>{initials}</div>
            <div style={{ lineHeight: 1.25, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 13, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {profile?.username ?? "Player"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, letterSpacing: 0.5, color: "#ffc400" }}>
                <PlayerTrophy /> {tier(best)}
              </div>
            </div>
          </div>

          {/* best score */}
          <div className="glass" style={{ padding: "5px 12px", borderRadius: 14, textAlign: "center", flexShrink: 0 }}>
            <div style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: 1.2, color: "#00b8ff" }}>BEST SCORE</div>
            <div className="tabular" style={{ fontSize: 17, fontWeight: 900, color: "#ffc400", textShadow: "0 0 12px rgba(255,196,0,0.5)", lineHeight: 1.1 }}>
              {best.toLocaleString()}
            </div>
          </div>

          {/* settings */}
          <motion.button
            onClick={() => setScreen("settings")}
            whileHover={{ rotate: 90 }}
            transition={{ type: "spring", stiffness: 200, damping: 14 }}
            className="glass"
            style={{ width: 40, height: 40, borderRadius: 12, display: "grid", placeItems: "center", fontSize: 17, color: "#A5B4FC", cursor: "pointer", flexShrink: 0 }}
            aria-label={t("menu.settings", "Settings")}
          >⚙</motion.button>
        </div>

        {/* ── Title ── */}
        <h1 style={{
          margin: "4px 0", textAlign: "center", fontSize: 22, fontWeight: 900, letterSpacing: 3, textTransform: "uppercase",
          background: "linear-gradient(90deg, #c13cff, #00b8ff)",
          WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent",
          filter: "drop-shadow(0 0 14px rgba(193,60,255,0.55))",
        }}>
          {t("modes.title", "Choose Your Mode")}
        </h1>

        {/* ── Mode cards ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {cards.map((c, i) => (
            <GameModeCard
              key={c.mode}
              index={i}
              title={t(`modes.${c.mode}`)}
              description={t(`modes.${c.mode}Desc`)}
              statLabel={c.statLabel}
              statValue={c.statValue}
              color={c.color}
              icon={c.icon}
              onClick={() => launch(c.mode)}
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
