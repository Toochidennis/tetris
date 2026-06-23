import { useEffect } from "react";
import { motion } from "framer-motion";
import { useMetaStore } from "../../state/metaStore";

export function Splash() {
  const { profile, setScreen } = useMetaStore();
  useEffect(() => {
    const t = setTimeout(() => setScreen(profile ? "menu" : "onboarding"), 1400);
    return () => clearTimeout(t);
  }, [profile, setScreen]);

  const blocks = ["I", "O", "T", "L"] as const;
  return (
    <div style={{ display: "grid", placeItems: "center", height: "100%" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 16 }}>
          {blocks.map((b, i) => (
            <motion.div
              key={b}
              initial={{ y: -40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.12, type: "spring", stiffness: 300, damping: 20 }}
              style={{
                width: 26, height: 26, borderRadius: 6,
                background: `var(--p-${b})`,
                boxShadow: `0 0 12px var(--p-${b}-glow)`,
              }}
            />
          ))}
        </div>
        <motion.h1
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
          style={{ fontSize: 34, fontWeight: 800, letterSpacing: -1, margin: 0 }}
        >
          BlockFall
        </motion.h1>
      </div>
    </div>
  );
}
