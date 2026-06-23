import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useMetaStore } from "./state/metaStore";
import i18n, { applyDirection, ensureLanguageLoaded } from "./i18n";
import { Splash } from "./components/screens/Splash";
import { Onboarding } from "./components/screens/Onboarding";
import { Menu } from "./components/screens/Menu";
import { ModeSelect } from "./components/screens/ModeSelect";
import { Game } from "./components/screens/Game";
import { Leaderboard } from "./components/screens/Leaderboard";
import { Achievements } from "./components/screens/Achievements";
import { Settings } from "./components/screens/Settings";
import { AchievementToast } from "./components/AchievementToast";

export default function App() {
  const { screen, settings } = useMetaStore();

  // Apply theme + language + direction whenever they change.
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", settings.theme);
  }, [settings.theme]);

  useEffect(() => {
    void ensureLanguageLoaded(settings.language).finally(() => void i18n.changeLanguage(settings.language));
    applyDirection(settings.language);
  }, [settings.language]);

  const screens: Record<string, JSX.Element> = {
    splash: <Splash />,
    onboarding: <Onboarding />,
    menu: <Menu />,
    modeSelect: <ModeSelect />,
    game: <Game />,
    leaderboard: <Leaderboard />,
    achievements: <Achievements />,
    settings: <Settings />,
  };

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
          {screens[screen]}
        </motion.div>
      </AnimatePresence>

      {/* Global achievement toast — appears over any screen */}
      <AchievementToast />
    </div>
  );
}
