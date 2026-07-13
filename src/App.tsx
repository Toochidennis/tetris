import { lazy, Suspense, useEffect, type ComponentType, type LazyExoticComponent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMetaStore, type Screen } from "./state/metaStore";
import i18n, { applyDirection, ensureLanguageLoaded } from "./i18n";
import { AchievementToast } from "./components/AchievementToast";
import { useCatalogStore } from "./state/catalogStore";

const screens: Record<Screen, LazyExoticComponent<ComponentType>> = {
  splash: lazy(() => import("./components/screens/Splash").then((m) => ({ default: m.Splash }))),
  onboarding: lazy(() => import("./components/screens/Onboarding").then((m) => ({ default: m.Onboarding }))),
  menu: lazy(() => import("./components/screens/Menu").then((m) => ({ default: m.Menu }))),
  modeSelect: lazy(() => import("./components/screens/ModeSelect").then((m) => ({ default: m.ModeSelect }))),
  game: lazy(() => import("./components/screens/Game").then((m) => ({ default: m.Game }))),
  leaderboard: lazy(() => import("./components/screens/Leaderboard").then((m) => ({ default: m.Leaderboard }))),
  achievements: lazy(() => import("./components/screens/Achievements").then((m) => ({ default: m.Achievements }))),
  settings: lazy(() => import("./components/screens/Settings").then((m) => ({ default: m.Settings }))),
};

function ScreenFallback() {
  return (
    <div style={{ height: "100%", display: "grid", placeItems: "center", color: "var(--text-muted)", fontWeight: 800 }}>
      BlockFall
    </div>
  );
}

export default function App() {
  const { screen, settings } = useMetaStore();
  const loadCatalogs = useCatalogStore((state) => state.load);
  const languages = useCatalogStore((state) => state.languages);
  const ActiveScreen = screens[screen];

  // Apply theme + language + direction whenever they change.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", settings.theme);
  }, [settings.theme]);

  useEffect(() => { void loadCatalogs(); }, [loadCatalogs]);

  useEffect(() => {
    void ensureLanguageLoaded(settings.language).finally(() => void i18n.changeLanguage(settings.language));
    applyDirection(settings.language, languages.find((language) => language.code === settings.language)?.direction);
  }, [settings.language, languages]);

  return (
    <div style={{ height: "100dvh", maxWidth: 520, margin: "0 auto", position: "relative", overflow: "hidden", background: "#050816" }}>
      {/* No mode="wait": screens crossfade concurrently (both absolutely positioned),
          so the next screen never waits on the previous one's exit to complete.
          This avoids the layout-animation deadlock and the bg flash between screens. */}
      <AnimatePresence initial={false}>
        <motion.div
          key={screen}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: settings.reducedMotion ? 0 : 0.26 }}
          style={{ position: "absolute", inset: 0 }}
        >
          <Suspense fallback={<ScreenFallback />}>
            <ActiveScreen />
          </Suspense>
        </motion.div>
      </AnimatePresence>

      {/* Global achievement toast — appears over any screen */}
      <AchievementToast />
    </div>
  );
}
