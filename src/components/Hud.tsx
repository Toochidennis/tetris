import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import type { GameSnapshot } from "../engine/types";
import { useMetaStore } from "../state/metaStore";
import { PiecePreview } from "./PiecePreview";

function fmtTime(ms: number) {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Smooth count-up toward a target value (rAF, GPU-free, cheap).
function useCountUp(value: number, enabled: boolean, ms = 450) {
  const [disp, setDisp] = useState(value);
  const fromRef = useRef(value);
  const rafRef = useRef(0);
  useEffect(() => {
    if (!enabled) { fromRef.current = value; setDisp(value); return; }
    const from = fromRef.current;
    const to = value;
    if (from === to) return;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / ms);
      const e = 1 - Math.pow(1 - p, 3);
      const v = Math.round(from + (to - from) * e);
      setDisp(v);
      fromRef.current = v;
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else fromRef.current = to;
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, enabled, ms]);
  return enabled ? disp : value;
}

function StatPanel({ label, value, color, pulse }: { label: string; value: string | number; color: string; pulse?: boolean }) {
  return (
    <motion.div
      animate={pulse ? { scale: [1, 1.12, 1], boxShadow: [`0 0 10px ${color}55`, `0 0 26px ${color}`, `0 0 10px ${color}55`] } : {}}
      transition={{ duration: 0.6, ease: "easeOut" }}
      style={{
        flex: 1, minWidth: 0, padding: "7px 10px", borderRadius: 12,
        background: "rgba(255,255,255,0.045)",
        border: `1px solid ${color}66`,
        backdropFilter: "blur(8px)",
        boxShadow: `0 0 10px ${color}33, inset 0 0 12px ${color}14`,
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 1.5, color, textTransform: "uppercase", opacity: 0.9 }}>
        {label}
      </div>
      <div className="tabular" style={{ fontSize: 21, fontWeight: 900, color: "#fff", textShadow: `0 0 10px ${color}aa`, lineHeight: 1.15 }}>
        {value}
      </div>
    </motion.div>
  );
}

function PiecePanel({ label, color, children, dim, glowPulse }: { label: string; color: string; children: React.ReactNode; dim?: boolean; glowPulse?: boolean }) {
  return (
    <motion.div
      animate={glowPulse ? { boxShadow: [`0 0 10px ${color}33`, `0 0 22px ${color}66`, `0 0 10px ${color}33`] } : {}}
      transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      style={{
        padding: 10, borderRadius: 12,
        background: "rgba(255,255,255,0.04)",
        border: `1px solid ${color}66`,
        backdropFilter: "blur(8px)",
        boxShadow: `0 0 10px ${color}33, inset 0 0 12px ${color}10`,
        opacity: dim ? 0.45 : 1,
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1.5, color, textTransform: "uppercase", marginBottom: 6 }}>
        {label}
      </div>
      {children}
    </motion.div>
  );
}

export function Hud({ snap }: { snap: GameSnapshot }) {
  const { t } = useTranslation();
  const reducedMotion = useMetaStore(s => s.settings.reducedMotion);
  const showTimer = snap.mode === "sprint" || snap.mode === "ultra";

  const score = useCountUp(snap.scoreState.score, !reducedMotion);

  // Level-up celebration pulse.
  const [levelPulse, setLevelPulse] = useState(false);
  const prevLevel = useRef(snap.scoreState.level);
  useEffect(() => {
    if (snap.scoreState.level > prevLevel.current && !reducedMotion) {
      setLevelPulse(true);
      const tm = setTimeout(() => setLevelPulse(false), 650);
      prevLevel.current = snap.scoreState.level;
      return () => clearTimeout(tm);
    }
    prevLevel.current = snap.scoreState.level;
  }, [snap.scoreState.level, reducedMotion]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%" }}>
      <div style={{ display: "flex", gap: 8 }}>
        <StatPanel label={t("game.score")} value={score.toLocaleString()} color="#F59E0B" />
        <StatPanel label={t("game.level")} value={snap.scoreState.level} color="#c13cff" pulse={levelPulse} />
        <StatPanel label={t("game.lines")} value={snap.scoreState.lines} color="#38BDF8" />
        {showTimer && <StatPanel label={t("game.time")} value={fmtTime(snap.elapsedMs)} color="#22C55E" />}
      </div>

      <div style={{ display: "flex", gap: 10, justifyContent: "space-between", alignItems: "stretch" }}>
        <PiecePanel label={t("game.hold")} color="#8B5CF6" dim={!snap.canHold}>
          <div style={{ height: 40, display: "flex", alignItems: "center" }}>
            {snap.hold ? <PiecePreview type={snap.hold} /> : <div style={{ width: 40 }} />}
          </div>
        </PiecePanel>

        <div style={{ flex: 1 }}>
          <PiecePanel label={t("game.next")} color="#38BDF8" glowPulse={!reducedMotion}>
            <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
              {snap.queue.slice(0, 4).map((p, i) => (
                <PiecePreview key={i} type={p} size={i === 0 ? 16 : 12} />
              ))}
            </div>
          </PiecePanel>
        </div>
      </div>
    </div>
  );
}
