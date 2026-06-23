import { useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useMetaStore } from "../../state/metaStore";
import { PiecePreview } from "../PiecePreview";
import { Avatar } from "../Avatars";
import { cellStyle } from "../pieceColors";
import type { PieceType } from "../../engine/types";

// ── Decorative stack for the centerpiece board (top → bottom, 10 wide) ──
const DECOR_STACK = [
  "..........",
  "..........",
  "..........",
  "..........",
  "J.........",
  "J........Z",
  "J..TT...ZZ",
  "JOOTT..LZZ",
  "JOOTTSSL.Z",
  "OOITTSSLLZ",
];
const COLS = 10;

function blockStyle(letter: string): React.CSSProperties {
  if (letter === ".") return { background: "var(--grid-cell-empty)", borderRadius: 3 };
  return { ...cellStyle(letter as PieceType), borderRadius: 4 };
}

function Trophy({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#F59E0B">
      <path d="M6 4h12v2h3v3a4 4 0 0 1-4 4h-.4A6 6 0 0 1 13 16.9V19h3v2H8v-2h3v-2.1A6 6 0 0 1 7.4 13H7a4 4 0 0 1-4-4V6h3V4Zm0 4H5v1a2 2 0 0 0 1 1.7V8Zm12 0v2.7A2 2 0 0 0 19 9V8h-1Z" />
    </svg>
  );
}

function tier(best: number) {
  if (best >= 10000) return "MASTER";
  if (best >= 5000) return "PRO";
  if (best >= 1000) return "RISING";
  return "ROOKIE";
}

// Drifting background particles
const PARTICLES = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  left: `${(i * 8.3 + (i % 3) * 5) % 96}%`,
  size: 4 + (i % 3) * 3,
  color: ["#38BDF8", "#8B5CF6", "#F59E0B", "#22C55E", "#EF4444"][i % 5],
  dur: 7 + (i % 5) * 2,
  delay: (i % 6) * 0.8,
  drift: i % 2 ? 14 : -14,
}));

export function Menu() {
  const { t } = useTranslation();
  const { profile, setScreen, hasUnseenAchievements } = useMetaStore();

  const best = useMemo(
    () => (profile ? Math.max(0, ...Object.values(profile.bestScores)) : 0),
    [profile]
  );
  const hue = profile ? [...profile.username].reduce((a, c) => a + c.charCodeAt(0), 0) % 360 : 280;

  return (
    <div style={{ position: "relative", height: "100%", background: "#070612", overflow: "hidden" }}>

      {/* ── Background layers ── */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(139,92,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.05) 1px, transparent 1px)",
          backgroundSize: "30px 30px",
        }} />
        <motion.div
          style={{ position: "absolute", top: "-10%", left: "10%", width: "80%", height: "40%", background: "radial-gradient(ellipse, rgba(139,92,246,0.22) 0%, transparent 70%)" }}
          animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.1, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          style={{ position: "absolute", bottom: "12%", right: "-6%", width: "60%", height: "34%", background: "radial-gradient(ellipse, rgba(245,158,11,0.12) 0%, transparent 70%)" }}
          animate={{ opacity: [0.5, 0.85, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* drifting particles */}
        {PARTICLES.map(p => (
          <motion.div
            key={p.id}
            style={{ position: "absolute", left: p.left, bottom: -10, width: p.size, height: p.size, borderRadius: 2, background: p.color, boxShadow: `0 0 8px ${p.color}`, opacity: 0.5 }}
            animate={{ y: [0, -620], x: [0, p.drift, 0], opacity: [0, 0.6, 0] }}
            transition={{ duration: p.dur, repeat: Infinity, ease: "linear", delay: p.delay }}
          />
        ))}
      </div>

      {/* ── Foreground ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        style={{ position: "relative", zIndex: 1, height: "100%", overflowY: "auto", display: "flex", flexDirection: "column", padding: "16px 16px 22px", gap: 14 }}
      >

        {/* ── Top HUD bar ── */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Player chip */}
          <div className="glass" style={{ display: "flex", alignItems: "center", gap: 9, padding: "7px 12px 7px 7px", flex: 1, borderRadius: 14 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, display: "grid", placeItems: "center", flexShrink: 0,
              background: `linear-gradient(135deg, hsl(${hue},75%,58%,0.35), hsl(${(hue + 40) % 360},75%,46%,0.25))`,
              border: `1px solid hsl(${hue},75%,60%,0.6)`,
              boxShadow: `0 0 12px hsl(${hue},75%,55%,0.5)`,
            }}>
              <Avatar id={profile?.avatarId ?? 0} size={28} />
            </div>
            <div style={{ lineHeight: 1.25, minWidth: 0 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {profile?.username ?? "Player"}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, letterSpacing: 0.5, color: "#F59E0B" }}>
                <Trophy /> {tier(best)}
              </div>
            </div>
          </div>

          {/* Best score */}
          <div className="glass" style={{ padding: "6px 14px", borderRadius: 14, textAlign: "center" }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.5, color: "#38BDF8" }}>♛ BEST SCORE</div>
            <div className="tabular" style={{ fontSize: 19, fontWeight: 900, color: "#F59E0B", textShadow: "0 0 12px rgba(245,158,11,0.5)", lineHeight: 1.1 }}>
              {best.toLocaleString()}
            </div>
          </div>

          {/* Settings gear */}
          <button
            onClick={() => setScreen("settings")}
            className="glass"
            style={{ width: 44, height: 44, borderRadius: 14, display: "grid", placeItems: "center", fontSize: 19, color: "#A5B4FC", cursor: "pointer", flexShrink: 0 }}
            aria-label="Settings"
          >⚙</button>
        </div>

        {/* ── Logo ── */}
        <div style={{ textAlign: "center", marginTop: 4 }}>
          <motion.h1
            style={{ margin: 0, fontSize: 52, fontWeight: 900, letterSpacing: -1, lineHeight: 1, fontFamily: '"Sora", system-ui, sans-serif' }}
            animate={{ filter: ["drop-shadow(0 0 12px rgba(245,158,11,0.4))", "drop-shadow(0 0 26px rgba(245,158,11,0.7))", "drop-shadow(0 0 12px rgba(245,158,11,0.4))"] }}
            transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
          >
            <span style={{ background: "linear-gradient(180deg, #FFD23F, #F59E0B 60%, #D97706)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>BLOCK</span>
            <span style={{ background: "linear-gradient(180deg, #7be9ff, #38BDF8 60%, #4d6bff)", WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent" }}>FALL</span>
          </motion.h1>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 2 }}>
            <span style={{ width: 18, height: 2, background: "linear-gradient(90deg, transparent, #38BDF8)" }} />
            <p style={{ margin: 0, fontSize: 13, fontWeight: 700, letterSpacing: 1, color: "#38BDF8", textShadow: "0 0 10px rgba(56,189,248,0.5)" }}>
              {t("menu.tagline", "Stack. Clear. Conquer.")}
            </p>
            <span style={{ width: 18, height: 2, background: "linear-gradient(90deg, #38BDF8, transparent)" }} />
          </div>
        </div>

        {/* ── Centerpiece: HOLD · board · NEXT ── */}
        <div style={{ flex: 1, minHeight: 180, display: "flex", justifyContent: "center", alignItems: "stretch", gap: 8 }}>
          {/* HOLD */}
          <SidePanel label="HOLD">
            <div className="glass" style={{ padding: 8, borderRadius: 10, display: "grid", placeItems: "center", minWidth: 52, minHeight: 52 }}>
              <PiecePreview type="S" size={11} />
            </div>
          </SidePanel>

          {/* Board well */}
          <motion.div
            animate={{ boxShadow: ["0 0 24px rgba(139,92,246,0.18)", "0 0 40px rgba(139,92,246,0.32)", "0 0 24px rgba(139,92,246,0.18)"] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "relative", height: "100%", aspectRatio: "10 / 14",
              borderRadius: 12, padding: 6,
              background: "rgba(10,8,22,0.6)",
              border: "2px solid rgba(139,92,246,0.45)",
              backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
              backgroundSize: "10% 7.14%",
            }}
          >
            {/* stack */}
            <div style={{ position: "absolute", inset: 6, display: "grid", gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${DECOR_STACK.length}, 1fr)`, gap: 2 }}>
              {DECOR_STACK.flatMap((row, r) =>
                [...row.padEnd(COLS, ".")].map((ch, c) => <div key={`${r}-${c}`} style={blockStyle(ch)} />)
              )}
            </div>
            {/* falling T piece */}
            <motion.div
              style={{ position: "absolute", left: "50%", top: "22%", transform: "translateX(-50%)", filter: "drop-shadow(0 0 12px var(--p-T-glow))" }}
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
            >
              <PiecePreview type="T" size={13} />
            </motion.div>
          </motion.div>

          {/* NEXT */}
          <SidePanel label="NEXT">
            <div className="glass" style={{ padding: 8, borderRadius: 10, display: "flex", flexDirection: "column", gap: 9, alignItems: "center", minWidth: 52 }}>
              {(["L", "J", "O", "Z"] as PieceType[]).map((p, i) => (
                <PiecePreview key={i} type={p} size={i === 0 ? 11 : 9} />
              ))}
            </div>
          </SidePanel>
        </div>

        {/* ── PLAY ── */}
        <motion.button
          onClick={() => setScreen("modeSelect")}
          whileTap={{ scale: 0.97 }}
          animate={{ boxShadow: ["0 0 22px rgba(245,158,11,0.5), 0 8px 22px rgba(245,158,11,0.3)", "0 0 38px rgba(245,158,11,0.8), 0 8px 26px rgba(245,158,11,0.45)", "0 0 22px rgba(245,158,11,0.5), 0 8px 22px rgba(245,158,11,0.3)"] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "relative", overflow: "hidden",
            width: "100%", padding: "20px 0", borderRadius: 16, border: "2px solid rgba(255,255,255,0.25)",
            background: "linear-gradient(180deg, #FCD34D 0%, #F59E0B 55%, #D97706 100%)",
            color: "#3a1d00", fontSize: 24, fontWeight: 900, letterSpacing: 3, textTransform: "uppercase",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 12,
          }}
        >
          <motion.span aria-hidden style={{ position: "absolute", top: 0, bottom: 0, width: "40%", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)", filter: "blur(4px)" }}
            animate={{ x: ["-160%", "320%"] }} transition={{ duration: 2, repeat: Infinity, repeatDelay: 1.6, ease: "easeInOut" }} />
          <span style={{ position: "relative", display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 18 }}>▶</span> {t("menu.play", "Play")}
          </span>
        </motion.button>

        {/* ── Secondary actions ── */}
        <div style={{ display: "flex", gap: 10 }}>
          <NeonButton color="#38BDF8" icon="🏆" label={t("menu.leaderboard", "Leaderboard")} onClick={() => setScreen("leaderboard")} />
          <NeonButton color="#8B5CF6" icon="🎖" label={t("achievements.menu", "Achievements")} onClick={() => setScreen("achievements")} badge={hasUnseenAchievements} />
        </div>
        <NeonButton color="#2DD4BF" icon="⚙" label={t("menu.settings", "Settings")} onClick={() => setScreen("settings")} full />
      </motion.div>
    </div>
  );
}

function SidePanel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 6 }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.5, color: "#38BDF8", textAlign: "center" }}>{label}</div>
      {children}
    </div>
  );
}

function NeonButton({ color, icon, label, onClick, full, badge }: { color: string; icon: string; label: string; onClick: () => void; full?: boolean; badge?: boolean }) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      whileHover={{ y: -2, boxShadow: `0 0 24px ${color}, 0 8px 20px rgba(0,0,0,0.35)` }}
      style={{
        position: "relative",
        flex: full ? undefined : 1, width: full ? "100%" : undefined,
        display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
        padding: "14px 8px", borderRadius: 13,
        border: `1.5px solid ${color}`,
        background: `linear-gradient(180deg, ${color}55 0%, ${color}1c 100%)`,
        color: "#fff", fontSize: 13, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase",
        cursor: "pointer", backdropFilter: "blur(8px)",
        boxShadow: `0 0 14px ${color}55, inset 0 1px 0 ${color}88`,
        textShadow: `0 0 10px ${color}`,
      }}
    >
      <span style={{ fontSize: 15 }}>{icon}</span> {label}
      {badge && (
        <motion.span
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", top: -5, right: -5, width: 13, height: 13, borderRadius: 999, background: "#EF4444", border: "2px solid #070612", boxShadow: "0 0 8px #EF4444" }}
        />
      )}
    </motion.button>
  );
}
