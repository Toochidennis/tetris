import { motion } from "framer-motion";
import type { ReactNode } from "react";

export interface GameModeCardProps {
  title: string;
  description: string;
  statLabel: string;
  statValue: string;
  color: string;
  icon: ReactNode;
  onClick: () => void;
  index?: number;
}

// Decorative tetromino blocks tucked into the card's right edge, tinted to the card color.
function CornerBlocks({ color }: { color: string }) {
  const s = 12;
  const grid = [
    [1, 0, 1, 1],
    [1, 1, 1, 0],
    [0, 1, 0, 1],
  ];
  return (
    <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", opacity: 0.22, pointerEvents: "none" }}>
      {grid.map((row, ri) => (
        <div key={ri} style={{ display: "flex" }}>
          {row.map((c, ci) =>
            c ? <div key={ci} style={{ width: s, height: s, margin: 1, borderRadius: 2, background: color, boxShadow: `0 0 6px ${color}` }} />
              : <div key={ci} style={{ width: s, height: s, margin: 1 }} />
          )}
        </div>
      ))}
    </div>
  );
}

export function GameModeCard({ title, description, statLabel, statValue, color, icon, onClick, index = 0 }: GameModeCardProps) {
  return (
    <motion.button
      onClick={onClick}
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08 * index + 0.1, type: "spring", stiffness: 240, damping: 22 }}
      whileHover={{ y: -4, boxShadow: `0 0 34px ${color}99, 0 12px 32px rgba(0,0,0,0.45)` }}
      whileTap={{ scale: 0.97 }}
      style={{
        position: "relative", overflow: "hidden",
        display: "flex", alignItems: "center", gap: 16,
        width: "100%", textAlign: "start", cursor: "pointer",
        padding: "16px 18px", borderRadius: 16,
        border: `1.5px solid ${color}`,
        background: `linear-gradient(135deg, ${color}5e 0%, ${color}24 38%, rgba(12,10,28,0.72) 100%)`,
        backdropFilter: "blur(10px)",
        boxShadow: `0 0 20px ${color}66, 0 8px 24px rgba(0,0,0,0.4), inset 0 1px 0 ${color}, inset 0 0 24px ${color}26`,
        color: "#fff",
      }}
    >
      {/* color sheen along the top edge */}
      <span aria-hidden style={{ position: "absolute", inset: 0, borderRadius: 16, background: `linear-gradient(180deg, ${color}33, transparent 28%)`, pointerEvents: "none" }} />
      <CornerBlocks color={color} />

      {/* icon badge */}
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "relative", zIndex: 1,
          flexShrink: 0, width: 52, height: 52, borderRadius: 13, display: "grid", placeItems: "center",
          background: `radial-gradient(circle at 50% 35%, ${color}, ${color}33 70%)`,
          border: `1.5px solid ${color}`,
          boxShadow: `0 0 20px ${color}, inset 0 0 14px ${color}66`,
          color: "#fff",
          filter: `drop-shadow(0 0 6px ${color})`,
        }}
      >
        {icon}
      </motion.div>

      {/* text */}
      <div style={{ position: "relative", zIndex: 1, minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: 19, fontWeight: 900, letterSpacing: 1, textTransform: "uppercase", color: "#fff", textShadow: `0 0 12px ${color}aa` }}>
          {title}
        </div>
        <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.66)", marginTop: 1 }}>
          {description}
        </div>
        <div style={{ marginTop: 8 }}>
          <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: 1.5, color: `${color}`, opacity: 0.85 }}>
            {statLabel}
          </div>
          <div className="tabular" style={{ fontSize: 17, fontWeight: 900, color: "#fff", lineHeight: 1.1 }}>
            {statValue}
          </div>
        </div>
      </div>
    </motion.button>
  );
}

// ── Mode icons (inline SVG) ──
export function TrophyIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6 4h12v3a6 6 0 0 1-12 0V4Z" /><path d="M6 6H3v1a3 3 0 0 0 3 3M18 6h3v1a3 3 0 0 1-3 3" />
      <path d="M12 13v4M8 21h8M9 21a3 3 0 0 1 6 0" />
    </svg>
  );
}
export function BoltIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor"><path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" /></svg>
  );
}
export function StopwatchIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 2h6M12 8v5l3 2" /><circle cx="12" cy="14" r="8" />
    </svg>
  );
}
export function CalendarIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="16" rx="2" /><path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}
