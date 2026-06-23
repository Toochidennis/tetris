import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { ClearEvent } from "../engine/types";

interface PopupEntry {
  id: number;
  label: string;
  points: string;
}

function buildLabel(e: ClearEvent): string {
  if (e.tSpin === "full" && e.count >= 1) return "T-SPIN!";
  if (e.tSpin === "mini" && e.count >= 1) return "T-SPIN MINI";
  if (e.count === 4) return "TETRIS!";
  if (e.count === 3) return "TRIPLE";
  if (e.count === 2) return "DOUBLE";
  return "SINGLE";
}

export function ScorePopup({ lastClear }: { lastClear: ClearEvent | null }) {
  const [entries, setEntries] = useState<PopupEntry[]>([]);
  const counter = useRef(0);
  const prevClear = useRef(lastClear);

  useEffect(() => {
    if (lastClear === prevClear.current) return;
    prevClear.current = lastClear;
    if (!lastClear) return;

    const lines: string[] = [buildLabel(lastClear)];
    if (lastClear.backToBack) lines.push("BACK TO BACK");
    if (lastClear.combo > 1) lines.push(`COMBO ×${lastClear.combo}`);

    const id = ++counter.current;
    setEntries(e => [...e, { id, label: lines.join("  ·  "), points: `+${lastClear.points.toLocaleString()}` }]);
    setTimeout(() => setEntries(e => e.filter(x => x.id !== id)), 1400);
  }, [lastClear]);

  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6 }}>
      <AnimatePresence>
        {entries.map(e => (
          <motion.div
            key={e.id}
            initial={{ opacity: 0, scale: 0.75, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, y: -40 }}
            transition={{ duration: 0.15, exit: { duration: 0.35 } }}
            style={{ textAlign: "center" }}
          >
            <div style={{ fontSize: 26, fontWeight: 900, color: "var(--accent-glow)", textShadow: "0 0 18px var(--accent)", letterSpacing: 1 }}>
              {e.label}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>
              {e.points}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
