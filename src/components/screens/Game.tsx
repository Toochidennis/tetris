import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useGameStore } from "../../state/gameStore";
import { useMetaStore } from "../../state/metaStore";
import { useKeyboard } from "../../input/useKeyboard";
import { useGestures } from "../../input/useGestures";
import { Board } from "../Board";
import { Hud } from "../Hud";
import { ScorePopup } from "../ScorePopup";
import { ParticleField } from "../ParticleField";
import { leaderboardService } from "../../state/services";

function IconBtn({ children, onClick, label }: { children: React.ReactNode; onClick: () => void; label: string }) {
  return (
    <motion.button
      onClick={onClick}
      aria-label={label}
      whileTap={{ scale: 0.92 }}
      whileHover={{ boxShadow: "0 0 16px rgba(139,92,246,0.6)" }}
      style={{
        pointerEvents: "auto",
        minWidth: 44, height: 40, padding: "0 14px", borderRadius: 12,
        border: "1px solid rgba(139,92,246,0.55)",
        background: "rgba(255,255,255,0.05)", backdropFilter: "blur(8px)",
        color: "#fff", fontSize: 15, fontWeight: 800, cursor: "pointer",
        boxShadow: "0 0 10px rgba(139,92,246,0.25)",
      }}
    >
      {children}
    </motion.button>
  );
}

export function Game() {
  const { t } = useTranslation();
  const snap = useGameStore((s) => s.snapshot);
  const { pause, resume, restart, getSummary } = useGameStore();
  const { setScreen, settings, profile, recordGame, selectedMode } = useMetaStore();
  const boardRef = useRef<HTMLDivElement>(null);
  const [isNewRecord, setIsNewRecord] = useState(false);
  const recorded = useRef(false);

  useKeyboard(true);
  useGestures(boardRef, settings.handedness !== undefined);

  const over = snap?.status === "over";
  const paused = snap?.status === "paused";

  // On game over: record stats + silently submit the score (once).
  useEffect(() => {
    if (over && snap && !recorded.current) {
      recorded.current = true;
      // Compare against the PREVIOUS best (before recordGame updates it).
      const prevBest = profile?.bestScores[selectedMode] ?? 0;
      setIsNewRecord(prevBest > 0 && snap.scoreState.score > prevBest);
      const summary = getSummary();
      if (summary) recordGame(summary);
      if (profile) {
        leaderboardService
          .submit({
            username: profile.username,
            countryCode: profile.countryCode,
            avatarId: profile.avatarId,
            score: snap.scoreState.score,
            mode: selectedMode,
          })
          .catch(() => { /* offline-tolerant; score is saved locally regardless */ });
      }
    }
  }, [over, snap, recordGame, getSummary, profile, selectedMode]);

  if (!snap) return null;

  return (
    <div style={{ position: "relative", height: "100%", overflow: "hidden", background: "#070612", display: "flex", flexDirection: "column" }}>

      {/* Ambient background effects (behind everything) */}
      <ParticleField />

      {/* HUD in normal flow at the top — board starts directly beneath it */}
      <div style={{
        position: "relative",
        zIndex: 10,
        padding: "10px 12px 8px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <IconBtn label={t("common.back", "Back")} onClick={() => setScreen("menu")}>←</IconBtn>
          <IconBtn label={paused ? t("game.resume") : t("game.pause")} onClick={() => (paused ? resume() : pause())}>
            {paused ? "▶" : "❚❚"}
          </IconBtn>
        </div>
        <Hud snap={snap} />
      </div>

      {/* Board area: the field spans the full width and fills the space left
          under the HUD, resting on the bottom. Cells stretch to fit rather than
          holding a 1:2 ratio — width is the priority. The screen already clears
          the gesture bar (see App.tsx); the few px below keep the board's border
          and rounded corners off the clip edge, where they would be shaved. */}
      <div
        ref={boardRef}
        style={{
          position: "relative",
          zIndex: 1,
          flex: 1,
          minHeight: 0,
          paddingBottom: 7,
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-end",
          touchAction: "none",
        }}
      >
        <div style={{ position: "relative", width: "100%", height: "100%" }}>
          <Board snap={snap} reducedMotion={settings.reducedMotion} />
          <ScorePopup lastClear={snap.lastClear} />
        </div>
      </div>

      <AnimatePresence>
        {paused && (
          <Overlay key="pause" accent="#8B5CF6" title={t("game.paused")} icon="❚❚">
            <button className="btn btn-primary" onClick={resume} style={{ width: "100%" }}>{t("game.resume")}</button>
            <button className="btn" onClick={() => { restart(); }} style={{ width: "100%" }}>{t("game.restart")}</button>
            <button className="btn" onClick={() => setScreen("menu")} style={{ width: "100%" }}>{t("game.quit")}</button>
          </Overlay>
        )}
        {over && (
          <Overlay key="over" accent={isNewRecord ? "#FFC400" : "#38BDF8"} title={t("results.gameOver")} icon={isNewRecord ? "🏆" : "🎮"}
            banner={isNewRecord ? t("results.newRecord") : undefined}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9, marginBottom: 4 }}>
              <Stat k={t("results.score")} v={snap.scoreState.score.toLocaleString()} color="#FFC400" />
              <Stat k={t("results.lines")} v={snap.scoreState.lines} color="#38BDF8" />
              <Stat k={t("results.level")} v={snap.scoreState.level} color="#c13cff" />
              <Stat k={t("results.time")} v={`${Math.floor(snap.elapsedMs / 1000)}s`} color="#22C55E" />
            </div>

            <button className="btn btn-primary" onClick={() => { recorded.current = false; setIsNewRecord(false); restart(); }} style={{ width: "100%" }}>
              {t("results.retry")}
            </button>
            <button className="btn" onClick={() => setScreen("leaderboard")} style={{ width: "100%" }}>
              {t("leaderboard.title")}
            </button>
            <button className="btn" onClick={() => setScreen("menu")} style={{ width: "100%" }}>{t("results.menu")}</button>
          </Overlay>
        )}
      </AnimatePresence>
    </div>
  );
}

function Stat({ k, v, color }: { k: string; v: string | number; color: string }) {
  return (
    <div style={{
      padding: "10px 12px", borderRadius: 12,
      background: "rgba(255,255,255,0.04)",
      border: `1px solid ${color}55`,
      boxShadow: `inset 0 0 14px ${color}14`,
    }}>
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color }}>{k}</div>
      <div className="tabular" style={{ fontSize: 21, fontWeight: 900, color: "#fff", textShadow: `0 0 10px ${color}88` }}>{v}</div>
    </div>
  );
}

function Overlay({ children, accent, title, icon, banner }: {
  children: React.ReactNode; accent: string; title: string; icon: string; banner?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      style={{
        position: "fixed", inset: 0, display: "grid", placeItems: "center",
        background: "rgba(4,6,18,0.72)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
        padding: 24, zIndex: 60,
      }}
    >
      <motion.div
        initial={{ scale: 0.92, y: 16, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.96, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 26 }}
        style={{
          position: "relative", overflow: "hidden",
          padding: "26px 22px 22px", width: "100%", maxWidth: 340,
          display: "flex", flexDirection: "column", gap: 11,
          borderRadius: 22,
          background: `linear-gradient(180deg, ${accent}1f, rgba(13,11,26,0.96) 42%)`,
          border: `1.5px solid ${accent}`,
          boxShadow: `0 0 40px -6px ${accent}, 0 20px 50px rgba(0,0,0,0.5), inset 0 1px 0 ${accent}55`,
        }}
      >
        {/* top accent glow bar */}
        <div style={{ position: "absolute", top: 0, left: "20%", right: "20%", height: 3, borderRadius: 3, background: accent, boxShadow: `0 0 16px ${accent}`, filter: "blur(0.5px)" }} />

        {banner && (
          <div style={{ alignSelf: "center", padding: "4px 12px", borderRadius: 999, fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase", color: "#1a1205", background: accent, boxShadow: `0 0 16px ${accent}` }}>
            {banner}
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginBottom: 4 }}>
          <motion.div
            initial={{ scale: 0.5, rotate: -12 }} animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.08 }}
            style={{ width: 52, height: 52, borderRadius: 15, display: "grid", placeItems: "center", fontSize: 26,
              background: `radial-gradient(circle, ${accent}40, ${accent}12)`, border: `1.5px solid ${accent}`, boxShadow: `0 0 18px ${accent}` }}
          >
            {icon}
          </motion.div>
          <h2 style={{ margin: 0, fontSize: 21, fontWeight: 900, letterSpacing: 1, textTransform: "uppercase", color: "#fff", textShadow: `0 0 16px ${accent}aa` }}>
            {title}
          </h2>
        </div>

        {children}
      </motion.div>
    </motion.div>
  );
}
