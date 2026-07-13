import { motion, type Variants } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useMetaStore } from "../../state/metaStore";
import i18n, { applyDirection, ensureLanguageLoaded } from "../../i18n";
import type { ThemeName } from "../../state/metaStore";
import { ArcadeBackground } from "../ArcadeBackground";
import { LanguageSelect } from "../LanguageSelect";
import { useCatalogStore } from "../../state/catalogStore";

const THEMES: ThemeName[] = ["neon-dark", "classic", "minimal-light"];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.1 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 24 } },
};

export function Settings() {
  const { t } = useTranslation();
  const { setScreen, settings, setSettings, resetAll } = useMetaStore();
  const { languages, status, error } = useCatalogStore();

  const changeLang = (lng: string) => {
    setSettings({ language: lng });
    void ensureLanguageLoaded(lng).finally(() => void i18n.changeLanguage(lng));
    applyDirection(lng, languages.find((language) => language.code === lng)?.direction);
  };

  return (
    <div style={{ position: "relative", height: "100%", background: "#050816", overflow: "hidden" }}>
      <ArcadeBackground />

      <div style={{ position: "relative", zIndex: 1, height: "100%", overflowY: "auto", padding: "16px 16px 28px" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
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
            {t("settings.title", "Settings")}
          </h1>
          <div style={{ width: 38 }} />
        </div>

        <motion.div variants={container} initial="hidden" animate="show" style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Language */}
          <Card icon="🌐" color="#38BDF8" label={t("settings.language")} noBlur>
            <LanguageSelect value={settings.language} options={languages} onChange={changeLang} />
            {status === "loading" && <CatalogStatus>Loading languages…</CatalogStatus>}
            {status === "error" && <CatalogStatus>{error ?? "Using offline language list"}</CatalogStatus>}
          </Card>

          {/* Theme */}
          <Card icon="🎨" color="#8B5CF6" label={t("settings.theme")}>
            <Segmented
              groupId="theme"
              color="#8B5CF6"
              value={settings.theme}
              options={THEMES.map((th) => ({ value: th, label: th.replace("-", " ") }))}
              onChange={(v) => setSettings({ theme: v as ThemeName })}
            />
          </Card>

          {/* Handedness
          <Card icon="✋" color="#22C55E" label={t("settings.handedness")}>
            <Segmented
              groupId="hand"
              color="#22C55E"
              value={settings.handedness}
              options={(["left", "right"] as const).map((h) => ({ value: h, label: t(`settings.${h}`) }))}
              onChange={(v) => setSettings({ handedness: v as "left" | "right" })}
            />
          </Card> */}

          {/* SFX */}
          <Card icon="🔊" color="#F59E0B" label={t("settings.sfx")} value={`${Math.round(settings.sfxVolume * 100)}%`}>
            <Slider color="#F59E0B" value={settings.sfxVolume} onChange={(v) => setSettings({ sfxVolume: v })} />
          </Card>

          {/* Music */}
          <Card icon="🎵" color="#EC4899" label={t("settings.music")} value={`${Math.round(settings.musicVolume * 100)}%`}>
            <Slider color="#EC4899" value={settings.musicVolume} onChange={(v) => setSettings({ musicVolume: v })} />
          </Card>

          {/* Reduced motion */}
          <Card icon="✨" color="#38BDF8" label={t("settings.reducedMotion")} inline
            control={<Toggle color="#38BDF8" on={settings.reducedMotion} onClick={() => setSettings({ reducedMotion: !settings.reducedMotion })} />}
          />

          {/* Reset */}
          <motion.button
            variants={item}
            whileTap={{ scale: 0.97 }}
            whileHover={{ boxShadow: "0 0 22px rgba(239,68,68,0.5)" }}
            onClick={() => { resetAll(); setScreen("onboarding"); }}
            style={{
              marginTop: 4, padding: "14px 0", borderRadius: 13, cursor: "pointer",
              border: "1.5px solid rgba(239,68,68,0.7)",
              background: "linear-gradient(180deg, rgba(239,68,68,0.18), rgba(239,68,68,0.06))",
              color: "#fca5a5", fontSize: 14, fontWeight: 800, letterSpacing: 1, textTransform: "uppercase",
              boxShadow: "0 0 12px rgba(239,68,68,0.25)",
            }}
          >
            ⚠ {t("settings.resetProfile")}
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}

function CatalogStatus({ children }: { children: React.ReactNode }) {
  return <div style={{ marginTop: 6, color: "#7c83a3", fontSize: 11 }}>{children}</div>;
}


function Card({ icon, color, label, value, children, inline, control, noBlur }: {
  icon: string; color: string; label: string; value?: string;
  children?: React.ReactNode; inline?: boolean; control?: React.ReactNode; noBlur?: boolean;
}) {
  return (
    <motion.div
      variants={item}
      className={noBlur ? undefined : "glass"}
      style={{ position: "relative", zIndex: noBlur ? 30 : undefined, padding: 14, borderRadius: 16, border: `1px solid ${color}3a`, boxShadow: `0 0 14px ${color}1f, inset 0 0 16px ${color}0d`, ...(noBlur ? { background: "rgba(255,255,255,0.04)" } : {}) }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: inline ? 0 : 11 }}>
        <span style={{ width: 30, height: 30, borderRadius: 9, display: "grid", placeItems: "center", fontSize: 15, background: `${color}22`, border: `1px solid ${color}66`, boxShadow: `0 0 10px ${color}44` }}>
          {icon}
        </span>
        <span style={{ flex: 1, fontSize: 13.5, fontWeight: 700, letterSpacing: 0.5, color: "#fff" }}>{label}</span>
        {value && <span className="tabular" style={{ fontSize: 13, fontWeight: 800, color }}>{value}</span>}
        {inline && control}
      </div>
      {children}
    </motion.div>
  );
}

function Segmented({ groupId, color, value, options, onChange }: {
  groupId: string; color: string; value: string;
  options: { value: string; label: string }[]; onChange: (v: string) => void;
}) {
  return (
    <div style={{ display: "flex", gap: 4, padding: 4, borderRadius: 12, background: "rgba(0,0,0,0.25)" }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            onClick={() => onChange(o.value)}
            style={{ position: "relative", flex: 1, padding: "9px 4px", borderRadius: 9, border: "none", background: "transparent", cursor: "pointer", color: active ? "#fff" : "#7c83a3", fontSize: 12, fontWeight: 800, letterSpacing: 0.4, textTransform: "capitalize" }}
          >
            {active && (
              <motion.span
                layoutId={`seg-${groupId}`}
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
                style={{ position: "absolute", inset: 0, borderRadius: 9, background: `linear-gradient(135deg, ${color}, ${color}cc)`, boxShadow: `0 0 14px ${color}99`, zIndex: 0 }}
              />
            )}
            <span style={{ position: "relative", zIndex: 1 }}>{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function Slider({ color, value, onChange }: { color: string; value: number; onChange: (v: number) => void }) {
  const pct = Math.round(value * 100);
  return (
    <input
      type="range" min={0} max={1} step={0.05} value={value}
      onChange={(e) => onChange(+e.target.value)}
      style={{
        width: "100%", height: 8, borderRadius: 999, appearance: "none", WebkitAppearance: "none", outline: "none", cursor: "pointer",
        accentColor: color,
        background: `linear-gradient(90deg, ${color} ${pct}%, rgba(255,255,255,0.1) ${pct}%)`,
        boxShadow: `0 0 10px ${color}55`,
      }}
    />
  );
}

function Toggle({ color, on, onClick }: { color: string; on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      role="switch"
      aria-checked={on}
      style={{
        width: 50, height: 28, borderRadius: 999, border: "none", cursor: "pointer", padding: 3,
        background: on ? `linear-gradient(135deg, ${color}, ${color}aa)` : "rgba(255,255,255,0.12)",
        boxShadow: on ? `0 0 14px ${color}88` : "inset 0 0 6px rgba(0,0,0,0.4)",
        display: "flex", justifyContent: on ? "flex-end" : "flex-start", transition: "background 200ms",
      }}
    >
      <motion.span layout transition={{ type: "spring", stiffness: 500, damping: 32 }}
        style={{ width: 22, height: 22, borderRadius: 999, background: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.4)" }} />
    </button>
  );
}
