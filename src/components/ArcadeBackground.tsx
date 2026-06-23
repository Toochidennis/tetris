import { motion } from "framer-motion";

// Floating tetromino decorations + ambient glow, reusable across arcade screens.
const FLOATERS: { cells: number[][]; color: string; style: React.CSSProperties; dur: number; delay: number }[] = [
  { cells: [[1,1,1,1]],         color: "#c13cff", style: { top: "14%", left: "78%" }, dur: 11, delay: 0 },
  { cells: [[1,1],[1,1]],       color: "#00b8ff", style: { top: "6%",  left: "8%"  }, dur: 13, delay: 1.2 },
  { cells: [[1,1,1],[0,1,0]],   color: "#ff7a00", style: { top: "44%", left: "88%" }, dur: 10, delay: 0.6 },
  { cells: [[0,1,1],[1,1,0]],   color: "#ffc400", style: { top: "62%", left: "4%"  }, dur: 14, delay: 2 },
  { cells: [[1,0],[1,0],[1,1]], color: "#c13cff", style: { top: "82%", left: "82%" }, dur: 12, delay: 0.4 },
  { cells: [[1,1,1]],           color: "#00b8ff", style: { top: "30%", left: "2%"  }, dur: 9,  delay: 1.6 },
];

function Floater({ cells, color, style, dur, delay }: typeof FLOATERS[number]) {
  const s = 11;
  return (
    <motion.div
      style={{ position: "absolute", opacity: 0.16, ...style }}
      animate={{ y: [0, -22, 0], rotate: [0, 8, 0] }}
      transition={{ duration: dur, repeat: Infinity, ease: "easeInOut", delay }}
    >
      {cells.map((row, ri) => (
        <div key={ri} style={{ display: "flex" }}>
          {row.map((c, ci) =>
            c ? <div key={ci} style={{ width: s, height: s, margin: 1, borderRadius: 2, background: color, boxShadow: `0 0 10px ${color}` }} />
              : <div key={ci} style={{ width: s, height: s, margin: 1 }} />
          )}
        </div>
      ))}
    </motion.div>
  );
}

export function ArcadeBackground() {
  return (
    <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
      {/* navy gradient base */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(130% 90% at 50% 0%, #0e1030 0%, #050816 60%)" }} />
      {/* faint grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: "linear-gradient(rgba(139,92,246,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.05) 1px, transparent 1px)",
        backgroundSize: "30px 30px",
      }} />
      {/* ambient glow blobs */}
      <motion.div
        style={{ position: "absolute", top: "-12%", left: "15%", width: "75%", height: "40%", background: "radial-gradient(ellipse, rgba(193,60,255,0.18) 0%, transparent 70%)" }}
        animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.08, 1] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        style={{ position: "absolute", bottom: "0%", right: "-5%", width: "60%", height: "35%", background: "radial-gradient(ellipse, rgba(0,184,255,0.12) 0%, transparent 70%)" }}
        animate={{ opacity: [0.5, 0.85, 0.5] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut" }}
      />
      {FLOATERS.map((f, i) => <Floater key={i} {...f} />)}
    </div>
  );
}
