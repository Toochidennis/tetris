import { create } from "zustand";
import { FALLBACK_COUNTRIES, FALLBACK_LANGUAGES, initCountryCache, initLanguageCache, type CountryOption, type LanguageOption } from "../data/catalog";

interface CatalogStore {
  countries: CountryOption[];
  languages: LanguageOption[];
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;
  stale: boolean;
  load: () => Promise<void>;
}

export const useCatalogStore = create<CatalogStore>((set, get) => ({
  countries: FALLBACK_COUNTRIES,
  languages: FALLBACK_LANGUAGES,
  status: "idle",
  error: null,
  stale: false,
  load: async () => {
    if (get().status === "loading" || get().status === "ready") return;
    set({ status: "loading", error: null });
    try {
      const [countriesResult, languagesResult] = await Promise.allSettled([initCountryCache(), initLanguageCache()]);
      const countries = countriesResult.status === "fulfilled" ? countriesResult.value.data : get().countries;
      const languages = languagesResult.status === "fulfilled" ? languagesResult.value.data : get().languages;
      const errors = [countriesResult, languagesResult].filter((result): result is PromiseRejectedResult => result.status === "rejected");
      set({ countries, languages, stale: countriesResult.status === "fulfilled" && countriesResult.value.stale || languagesResult.status === "fulfilled" && languagesResult.value.stale, status: errors.length ? "error" : "ready", error: errors[0] ? (errors[0].reason instanceof Error ? errors[0].reason.message : "Unable to load catalogs") : null });
    } catch (error) {
      set({ status: "error", error: error instanceof Error ? error.message : "Unable to load catalogs" });
    }
  },
}));
