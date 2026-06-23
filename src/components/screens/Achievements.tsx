import { useMemo } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useMetaStore } from "../../state/metaStore";
import { ArcadeBackground } from "../ArcadeBackground";
import { ACHIEVEMENTS, type AchievementDef } from "../../state/achievements/definitions";

export function Achievements() {
  const { t } = useTranslation();
  const { setScreen, profile } = useMetaStore();
  const unlocked = profile?.achievements ?? {};

  const count = useMemo(
    () => ACHIEVEMENTS.filter((a) => unlocked[a.id]).length,
    [unlocked]
  );
  const pct = Math.round((count / ACHIEVEMENTS.length) * 100);

  return (
    <div style={{ position: "relative", height: "100%", background: "#050816", overflow: "hidden" }}>
      <ArcadeBackground />

      <div style={{ position: "relative", zIndex: 1, height: "100%", overflowY: "auto", padding: "16px 16px 28px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <button
            onClick={() => setScreen("menu")}
            className="glass"
            style={{ width: 38, height: 38, borderRadius: 11, display: "grid", placeItems: "center", color: "#A5B4FC", fontSize: 17, cursor: "pointer" }}
            aria-label={t("common.back", "Back")}
          >←</button>
          <h1 style={{
            margin: 0, flex: 1, textAlign: "center", fontSize: 19, fontWeight: 900, letterSpacing: 2.5, textTransform: "uppercase",
            background: "linear-gradient(90deg, #a78bfa, #38BDF8)",
            WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 12px rgba(167,139,250,0.55))",
          }}>
            {t("achievements.title")}
          </h1>
          <div style={{ width: 38 }} />
        </div>

        {/* Completion summary */}
        <div className="glass" style={{ display: "flex", alignItems: "center", gap: 14, padding: 14, borderRadius: 16, marginBottom: 16, border: "1px solid rgba(139,92,246,0.3)" }}>
          <Ring pct={pct} />
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#fff" }}>
              {t("achievements.completed", { count, total: ACHIEVEMENTS.length })}
            </div>
            <div style={{ fontSize: 12, color: "#A5B4FC" }}>{pct}% complete</div>
          </div>
        </div>

        {/* Grid */}
        <motion.div
          initial="hidden" animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}
        >
          {ACHIEVEMENTS.map((a) => (
            <Card key={a.id} a={a} unlockedAt={unlocked[a.id]} profile={profile} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function Ring({ pct }: { pct: number }) {
  const r = 22, c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: 56, height: 56, flexShrink: 0 }}>
      <svg width="56" height="56" viewBox="0 0 56 56">
        <circle cx="28" cy="28" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="5" />
        <motion.circle
          cx="28" cy="28" r={r} fill="none" stroke="#8B5CF6" strokeWidth="5" strokeLinecap="round"
          strokeDasharray={c} transform="rotate(-90 28 28)"
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c * (1 - pct / 100) }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          style={{ filter: "drop-shadow(0 0 6px #8B5CF6)" }}
        />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", fontSize: 13, fontWeight: 900, color: "#fff" }}>{pct}%</div>
    </div>
  );
}

function Card({ a, unlockedAt, profile }: { a: AchievementDef; unlockedAt?: number; profile: ReturnType<typeof useMetaStore.getState>["profile"] }) {
  const { t } = useTranslation();
  const isUnlocked = !!unlockedAt;
  const prog = a.progress && profile ? a.progress(profile) : null;

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
      animate={isUnlocked ? { boxShadow: [`0 0 12px ${a.color}55`, `0 0 22px ${a.color}99`, `0 0 12px ${a.color}55`] } : undefined}
      transition={isUnlocked ? { duration: 2.6, repeat: Infinity, ease: "easeInOut" } : undefined}
      style={{
        position: "relative", padding: 13, borderRadius: 15, minHeight: 132,
        display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 6,
        border: `1.5px solid ${isUnlocked ? a.color : "rgba(255,255,255,0.08)"}`,
        background: isUnlocked ? `linear-gradient(160deg, ${a.color}26, rgba(10,8,22,0.6))` : "rgba(255,255,255,0.03)",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* badge */}
      <div style={{
        width: 46, height: 46, borderRadius: 12, display: "grid", placeItems: "center", fontSize: 24,
        background: isUnlocked ? `radial-gradient(circle, ${a.color}44, ${a.color}11)` : "rgba(255,255,255,0.05)",
        border: `1.5px solid ${isUnlocked ? a.color : "rgba(255,255,255,0.12)"}`,
        boxShadow: isUnlocked ? `0 0 14px ${a.color}88` : "none",
        filter: isUnlocked ? "none" : "grayscale(1) opacity(0.5)",
      }}>
        {isUnlocked ? a.icon : "🔒"}
      </div>

      <div style={{ fontSize: 13, fontWeight: 800, color: isUnlocked ? "#fff" : "#9aa0bf", lineHeight: 1.15 }}>
        {t(`achievements.items.${a.id}.title`)}
      </div>
      <div style={{ fontSize: 10.5, color: isUnlocked ? "rgba(255,255,255,0.6)" : "#707080", lineHeight: 1.25 }}>
        {t(`achievements.items.${a.id}.desc`)}
      </div>

      {/* progress bar for cumulative, locked ones */}
      {!isUnlocked && prog && (
        <div style={{ width: "100%", marginTop: "auto" }}>
          <div style={{ height: 5, borderRadius: 999, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${Math.min(100, (prog.current / prog.target) * 100)}%`, background: a.color, boxShadow: `0 0 6px ${a.color}` }} />
          </div>
          <div className="tabular" style={{ fontSize: 9.5, color: "#7c83a3", marginTop: 3 }}>
            {prog.current.toLocaleString()} / {prog.target.toLocaleString()}
          </div>
        </div>
      )}
    </motion.div>
  );
}
