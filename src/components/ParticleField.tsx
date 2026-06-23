import { memo } from "react";
import { motion } from "framer-motion";

// Lightweight drifting glow-cubes. Pure transforms (GPU), no particle library.
const CUBES = Array.from({ length: 14 }, (_, i) => ({
  id: i,
  left: `${(i * 7.1 + (i % 4) * 4) % 96}%`,
  size: 5 + (i % 4) * 4,
  color: ["#8B5CF6", "#38BDF8", "#F59E0B", "#22C55E", "#EF4444"][i % 5],
  dur: 9 + (i % 5) * 2.5,
  delay: (i % 7) * 0.9,
  drift: i % 2 ? 18 : -18,
  rot: i % 2 ? 90 : -90,
}));

export const ParticleField = memo(function ParticleField() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
      {/* cosmic vignette */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 80% at 50% 10%, rgba(139,92,246,0.12) 0%, transparent 55%)" }} />
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(100% 60% at 50% 100%, rgba(56,189,248,0.08) 0%, transparent 60%)" }} />
      {CUBES.map(c => (
        <motion.div
          key={c.id}
          style={{
            position: "absolute", left: c.left, bottom: -12,
            width: c.size, height: c.size, borderRadius: 2,
            background: c.color, boxShadow: `0 0 10px ${c.color}`, opacity: 0.0,
          }}
          animate={{ y: [0, -780], x: [0, c.drift, 0], rotate: [0, c.rot], opacity: [0, 0.5, 0] }}
          transition={{ duration: c.dur, repeat: Infinity, ease: "linear", delay: c.delay }}
        />
      ))}
    </div>
  );
});
