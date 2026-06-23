import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useMetaStore } from "../state/metaStore";
import { achievementById } from "../state/achievements/definitions";

// Global toast — mounted once in App, shows the front of the unlock queue
// over any screen, then auto-dismisses (advancing to the next).
export function AchievementToast() {
  const { t } = useTranslation();
  const queue = useMetaStore((s) => s.achievementQueue);
  const dismiss = useMetaStore((s) => s.dismissAchievementToast);
  const id = queue[0];
  const def = id ? achievementById(id) : undefined;

  useEffect(() => {
    if (!id) return;
    const tm = setTimeout(() => dismiss(id), 3200);
    return () => clearTimeout(tm);
  }, [id, dismiss]);

  return (
    <div style={{ position: "fixed", top: 14, left: 0, right: 0, display: "flex", justifyContent: "center", zIndex: 100, pointerEvents: "none" }}>
      <AnimatePresence>
        {def && (
          <motion.div
            key={id}
            initial={{ opacity: 0, y: -40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -30, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 24 }}
            onClick={() => dismiss(id)}
            style={{
              pointerEvents: "auto", cursor: "pointer",
              display: "flex", alignItems: "center", gap: 12,
              padding: "11px 16px", borderRadius: 14, maxWidth: 340, margin: "0 14px",
              background: `linear-gradient(135deg, ${def.color}33, rgba(10,8,22,0.92))`,
              border: `1.5px solid ${def.color}`,
              boxShadow: `0 0 22px ${def.color}88, 0 8px 24px rgba(0,0,0,0.45)`,
              backdropFilter: "blur(10px)",
            }}
          >
            <motion.div
              initial={{ rotate: -20, scale: 0.6 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 14, delay: 0.1 }}
              style={{
                width: 42, height: 42, borderRadius: 11, display: "grid", placeItems: "center", fontSize: 22, flexShrink: 0,
                background: `radial-gradient(circle, ${def.color}55, ${def.color}11)`,
                border: `1.5px solid ${def.color}`, boxShadow: `0 0 12px ${def.color}`,
              }}
            >
              {def.icon}
            </motion.div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 1.5, color: def.color, textTransform: "uppercase" }}>
                {t("achievements.unlockedToast")}
              </div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {t(`achievements.items.${def.id}.title`)}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
