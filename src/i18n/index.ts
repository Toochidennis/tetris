import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ar from "./locales/ar.json";
import zh from "./locales/zh.json";
import nl from "./locales/nl.json";
import en from "./locales/en.json";
import fr from "./locales/fr.json";
import de from "./locales/de.json";
import ha from "./locales/ha.json";
import hi from "./locales/hi.json";
import ig from "./locales/ig.json";
import id from "./locales/id.json";
import it from "./locales/it.json";
import ja from "./locales/ja.json";
import ko from "./locales/ko.json";
import ms from "./locales/ms.json";
import pt from "./locales/pt.json";
import ru from "./locales/ru.json";
import es from "./locales/es.json";
import sw from "./locales/sw.json";
import th from "./locales/th.json";
import tr from "./locales/tr.json";
import ur from "./locales/ur.json";

// Bundled translations (work fully offline). A backend can override/extend any
// of these at runtime via ensureLanguageLoaded() below.
const bundled: Record<string, { translation: Record<string, unknown> }> = {
  ar: { translation: ar }, zh: { translation: zh }, nl: { translation: nl },
  en: { translation: en }, fr: { translation: fr }, de: { translation: de },
  ha: { translation: ha }, hi: { translation: hi }, ig: { translation: ig },
  id: { translation: id }, it: { translation: it }, ja: { translation: ja },
  ko: { translation: ko }, ms: { translation: ms }, pt: { translation: pt },
  ru: { translation: ru }, es: { translation: es }, sw: { translation: sw },
  th: { translation: th }, tr: { translation: tr }, ur: { translation: ur },
};

export const RTL_LANGS: readonly string[] = ["ar", "ur"];
export const SUPPORTED_LANGS = Object.keys(bundled);

function defaultLang(): string {
  const nav = (navigator.language || "en").split("-")[0];
  return SUPPORTED_LANGS.includes(nav) ? nav : "en";
}

void i18n.use(initReactI18next).init({
  resources: bundled,
  lng: defaultLang(),
  fallbackLng: "en",
  supportedLngs: SUPPORTED_LANGS,
  interpolation: { escapeValue: false },
});

// ── API wiring seam ─────────────────────────────────────────────────────────
// Set VITE_I18N_URL to serve translations from a backend. When set, the first
// time a language is shown we fetch {base}/locales/<code>.json and merge it over
// the bundled copy (so you can update strings without shipping a new build).
// Unset => purely bundled, fully offline. No UI changes either way.
const I18N_URL = import.meta.env.VITE_I18N_URL?.replace(/\/$/, "");
const remoteLoaded = new Set<string>();

export async function ensureLanguageLoaded(lang: string): Promise<void> {
  if (!I18N_URL || remoteLoaded.has(lang)) return;
  remoteLoaded.add(lang); // mark first to avoid duplicate in-flight fetches
  try {
    const res = await fetch(`${I18N_URL}/locales/${lang}.json`);
    if (!res.ok) return;
    const data = await res.json();
    i18n.addResourceBundle(lang, "translation", data, true, true); // deep-merge, override
    if (i18n.language === lang) await i18n.changeLanguage(lang); // re-render with new strings
  } catch {
    remoteLoaded.delete(lang); // allow a retry next time
  }
}

export function applyDirection(lang: string, apiDirection?: "ltr" | "rtl") {
  const dir = apiDirection ?? (RTL_LANGS.includes(lang) ? "rtl" : "ltr");
  document.documentElement.setAttribute("dir", dir);
  document.documentElement.setAttribute("lang", lang);
}

export default i18n;
