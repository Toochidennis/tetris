import { useEffect, useState } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useMetaStore } from "../../state/metaStore";
import { applyDirection } from "../../i18n";
import { Avatar, AVATAR_META } from "../Avatars";
import { CountrySelect } from "../CountrySelect";
import { COUNTRIES } from "../../data/countries";

// Decorative tetromino clusters tucked into the corners.
const CORNER_BLOCKS: { cells: number[][]; color: string; style: React.CSSProperties; dur: number }[] = [
  { cells: [[1,1,1],[0,0,1]], color: "#38BDF8", style: { top: 10, right: 14 }, dur: 10 },
  { cells: [[1,1],[1,1]],     color: "#F59E0B", style: { top: 38, right: 56 }, dur: 12 },
  { cells: [[1,1,1]],         color: "#8B5CF6", style: { top: 64, right: 20 }, dur: 9  },
  { cells: [[1,0],[1,1]],     color: "#8B5CF6", style: { bottom: 16, left: 14 }, dur: 11 },
  { cells: [[1,1],[0,1]],     color: "#22C55E", style: { bottom: 44, right: 16 }, dur: 13 },
];

function BlockCluster({ cells, color, style, dur }: { cells: number[][]; color: string; style: React.CSSProperties; dur: number }) {
  const s = 9;
  return (
    <motion.div
      style={{ position: "absolute", opacity: 0.5, ...style }}
      animate={{ y: [0, -8, 0], rotate: [0, 4, 0] }}
      transition={{ duration: dur, repeat: Infinity, ease: "easeInOut" }}
    >
      {cells.map((row, ri) => (
        <div key={ri} style={{ display: "flex" }}>
          {row.map((c, ci) =>
            c ? (
              <div key={ci} style={{ width: s, height: s, margin: 1, borderRadius: 2, background: color, boxShadow: `0 0 8px ${color}` }} />
            ) : (
              <div key={ci} style={{ width: s, height: s, margin: 1 }} />
            )
          )}
        </div>
      ))}
    </motion.div>
  );
}

// Staggered reveal for the form sections.
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 24 } },
};

// Animated 2×2 logo mark above the title.
function LogoMark() {
  const blocks = [
    { c: "#38BDF8", x: 0, y: 0 },
    { c: "#8B5CF6", x: 1, y: 0 },
    { c: "#F59E0B", x: 0, y: 1 },
    { c: "#22C55E", x: 1, y: 1 },
  ];
  const u = 13;
  return (
    <motion.div
      style={{ width: u * 2, height: u * 2, position: "relative", margin: "0 auto 14px" }}
      animate={{ rotate: [0, 8, 0, -8, 0], y: [0, -4, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
    >
      {blocks.map((b, i) => (
        <div key={i} style={{
          position: "absolute", left: b.x * u, top: b.y * u, width: u - 2, height: u - 2,
          borderRadius: 3, background: b.c, boxShadow: `0 0 10px ${b.c}`,
        }} />
      ))}
    </motion.div>
  );
}

export function Onboarding() {
  const { t, i18n } = useTranslation();
  const { createProfile, setScreen } = useMetaStore();
  const [name, setName] = useState("");
  const [country, setCountry] = useState("NG");
  const [avatar, setAvatar] = useState(0);
  const [nameFocused, setNameFocused] = useState(false);
  const valid = name.trim().length >= 2 && name.trim().length <= 16;
  const selMeta = AVATAR_META[avatar];
  const rtl = i18n.dir() === "rtl";

  // Make the onboarding layout follow the active language's direction
  // (also covers the case where the user reset their profile mid-session).
  useEffect(() => {
    applyDirection(i18n.language);
  }, [i18n.language]);

  return (
    <div style={{ position: "relative", height: "100%", background: "#050816", overflow: "hidden" }}>

      {/* ── Background ── */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "linear-gradient(rgba(139,92,246,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(139,92,246,0.06) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }} />
        <motion.div
          style={{ position: "absolute", top: "-14%", left: "18%", width: "75%", height: "48%", background: "radial-gradient(ellipse, rgba(139,92,246,0.24) 0%, transparent 70%)" }}
          animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.08, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          style={{ position: "absolute", bottom: "6%", right: "-4%", width: "62%", height: "38%", background: "radial-gradient(ellipse, rgba(56,189,248,0.14) 0%, transparent 70%)" }}
          animate={{ opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        {CORNER_BLOCKS.map((b, i) => <BlockCluster key={i} {...b} />)}
      </div>

      {/* ── Content ── */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        style={{
          position: "relative", zIndex: 1,
          height: "100%", overflowY: "auto",
          display: "flex", flexDirection: "column",
          padding: "72px 28px 40px",
          gap: 26,
        }}
      >
        {/* Header */}
        <motion.div variants={item} style={{ textAlign: "center" }}>
          <LogoMark />
          <motion.h1
            style={{
              margin: 0, fontSize: 25, fontWeight: 900, letterSpacing: 1, textTransform: "uppercase",
              background: "linear-gradient(90deg, #a78bfa, #e879f9)",
              WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent",
            }}
            animate={{ filter: ["drop-shadow(0 0 10px rgba(167,139,250,0.5))", "drop-shadow(0 0 20px rgba(167,139,250,0.85))", "drop-shadow(0 0 10px rgba(167,139,250,0.5))"] }}
            transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
          >
            {t("onboarding.welcome")}
          </motion.h1>
          <p style={{ margin: "6px 0 0", fontSize: 13.5, fontWeight: 500, color: "#38BDF8", textShadow: "0 0 10px rgba(56,189,248,0.55)" }}>
            {t("onboarding.subtitle")}
          </p>
        </motion.div>

        {/* Avatars */}
        <motion.div variants={item}>
          <Label>{t("onboarding.chooseAvatar")}</Label>
          <div style={{ display: "flex", gap: 8, justifyContent: "space-between" }}>
            {AVATAR_META.map(av => {
              const sel = avatar === av.id;
              return (
                <motion.button
                  key={av.id}
                  onClick={() => setAvatar(av.id)}
                  whileTap={{ scale: 0.9 }}
                  animate={{ scale: sel ? 1.1 : 1 }}
                  transition={{ type: "spring", stiffness: 340, damping: 18 }}
                  style={{
                    position: "relative", flex: 1, aspectRatio: "1", borderRadius: 13,
                    border: `2px solid ${sel ? av.color : "rgba(255,255,255,0.1)"}`,
                    background: sel ? `${av.color}1e` : "rgba(255,255,255,0.035)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer", padding: 0, outline: "none",
                    transition: "border-color 180ms, background 180ms",
                  }}
                >
                  {/* pulsing glow ring on the selected avatar */}
                  {sel && (
                    <motion.span
                      aria-hidden
                      style={{ position: "absolute", inset: -2, borderRadius: 13, border: `2px solid ${av.color}`, pointerEvents: "none" }}
                      animate={{ opacity: [0.9, 0.25, 0.9], boxShadow: [`0 0 8px ${av.color}`, `0 0 20px ${av.color}`, `0 0 8px ${av.color}`] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                    />
                  )}
                  <motion.div animate={sel ? { y: [0, -2, 0] } : { y: 0 }} transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}>
                    <Avatar id={av.id} size={38} />
                  </motion.div>
                </motion.button>
              );
            })}
          </div>
          {/* live selected-avatar name */}
          <div style={{ height: 18, marginTop: 8, textAlign: "center" }}>
            <AnimatePresence mode="wait">
              <motion.span
                key={selMeta.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.2 }}
                style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, color: selMeta.color, textShadow: `0 0 10px ${selMeta.color}80` }}
              >
                {selMeta.name.toUpperCase()}
              </motion.span>
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Username */}
        <motion.div variants={item}>
          <Label>{t("onboarding.username")}</Label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            onFocus={() => setNameFocused(true)}
            onBlur={() => setNameFocused(false)}
            placeholder={t("onboarding.usernamePlaceholder")}
            maxLength={16}
            style={{
              width: "100%", padding: "14px 16px", borderRadius: 12,
              border: `1.5px solid ${nameFocused ? "#38BDF8" : "rgba(255,255,255,0.12)"}`,
              background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 16, outline: "none",
              boxShadow: nameFocused ? "0 0 0 3px rgba(56,189,248,0.18), 0 0 20px rgba(56,189,248,0.12)" : "none",
              transition: "border-color 180ms, box-shadow 180ms",
            }}
          />
          {name.length > 0 && !valid && (
            <div style={{ color: "#EF4444", fontSize: 12, marginTop: 6 }}>{t("onboarding.usernameError")}</div>
          )}
        </motion.div>

        {/* Country */}
        <motion.div variants={item}>
          <Label>{t("onboarding.country")}</Label>
          <CountrySelect value={country} options={COUNTRIES} onChange={setCountry} />
        </motion.div>

        <div style={{ flex: 1, minHeight: 8 }} />

        {/* CTA */}
        <motion.div variants={item} style={{ display: "flex", justifyContent: "center" }}>
          <motion.button
            disabled={!valid}
            onClick={() => { createProfile(name.trim(), country, avatar); setScreen("menu"); }}
            whileTap={valid ? { scale: 0.97 } : {}}
            animate={valid ? {
              boxShadow: [
                "0 0 18px rgba(245,158,11,0.45), 0 6px 18px rgba(245,158,11,0.3)",
                "0 0 30px rgba(245,158,11,0.75), 0 6px 22px rgba(245,158,11,0.4)",
                "0 0 18px rgba(245,158,11,0.45), 0 6px 18px rgba(245,158,11,0.3)",
              ],
            } : {}}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: "relative", overflow: "hidden",
              width: "92%", padding: "17px 0", borderRadius: 14, border: "none",
              background: valid ? "linear-gradient(135deg, #FBBF24 0%, #F59E0B 50%, #D97706 100%)" : "rgba(255,255,255,0.07)",
              color: valid ? "#3a1d00" : "rgba(255,255,255,0.25)",
              fontSize: 16, fontWeight: 900, letterSpacing: 2, textTransform: "uppercase",
              cursor: valid ? "pointer" : "default",
            }}
          >
            {/* shimmer sweep */}
            {valid && (
              <motion.span
                aria-hidden
                style={{ position: "absolute", top: 0, bottom: 0, width: "45%", background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)", filter: "blur(3px)" }}
                animate={{ x: ["-160%", "320%"] }}
                transition={{ duration: 1.8, repeat: Infinity, repeatDelay: 1.4, ease: "easeInOut" }}
              />
            )}
            <span style={{ position: "relative" }}>{rtl ? "← " : ""}{t("onboarding.start")}{rtl ? "" : " →"}</span>
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: 2, color: "#A5B4FC", marginBottom: 10, textTransform: "uppercase" }}>
      {children}
    </div>
  );
}
