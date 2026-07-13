export interface CountryOption { code: string; name: string; emoji?: string; image?: string; }
export interface LanguageOption { code: string; label: string; flag: string; name: string; locale: string; direction: "ltr" | "rtl"; isDefault: boolean; }

export const FALLBACK_COUNTRIES: CountryOption[] = [];
export const FALLBACK_LANGUAGES: LanguageOption[] = [];

interface ApiCountry { code?: unknown; name?: unknown; emoji?: unknown; image?: unknown; }
interface ApiLanguage { code?: unknown; name?: unknown; native_name?: unknown; locale?: unknown; direction?: unknown; flag?: unknown; is_default?: unknown; is_active?: unknown; }
interface ApiEnvelope { success?: unknown; message?: unknown; data?: unknown; }

const baseUrl = (import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL)?.replace(/\/$/, "");
const apiKey = import.meta.env.VITE_API_KEY;
const LANGUAGE_CACHE_TTL = 4 * 24 * 60 * 60 * 1000;
const COUNTRY_CACHE_KEY = "blockfall-countries-v1";
const LANGUAGE_DB_NAME = "blockfall-catalog";
const LANGUAGE_STORE_NAME = "languages";

function isActive(value: unknown): boolean { return value === true || value === 1 || value === "1"; }

function flagCode(value: unknown): string {
  if (typeof value === "string" && /^[A-Z]{2}$/i.test(value)) return value.toUpperCase();
  if (typeof value === "string") {
    const regional = [...value].map((char) => char.codePointAt(0) ?? 0).filter((point) => point >= 0x1f1e6 && point <= 0x1f1ff);
    if (regional.length >= 2) return regional.slice(0, 2).map((point) => String.fromCharCode(point - 0x1f1e6 + 65)).join("");
  }
  return "US";
}

async function request<T>(path: string): Promise<T[]> {
  if (!baseUrl) throw new Error("API base URL is not configured");
  const response = await fetch(`${baseUrl}${path}`, { headers: { Accept: "application/json", ...(apiKey ? { "x-api-key": apiKey } : {}) } });
  if (!response.ok) throw new Error(`Catalog request failed (${response.status})`);
  const envelope = await response.json() as ApiEnvelope;
  if (envelope.success !== true || !Array.isArray(envelope.data)) throw new Error(typeof envelope.message === "string" ? envelope.message : "Catalog response was invalid");
  return envelope.data as T[];
}

function normalizeCountries(rows: ApiCountry[]): CountryOption[] {
  return rows.map((row) => ({ code: String(row.code ?? "").toUpperCase(), name: String(row.name ?? ""), emoji: typeof row.emoji === "string" ? row.emoji : undefined, image: typeof row.image === "string" ? row.image : undefined }))
    .filter((row) => row.code && row.name).sort((a, b) => a.name.localeCompare(b.name));
}

function normalizeLanguages(rows: ApiLanguage[]): LanguageOption[] {
  return rows.filter((row) => isActive(row.is_active)).map((row) => {
    const code = String(row.code ?? "").toLowerCase();
    return { code, label: String(row.native_name ?? row.name ?? code), name: String(row.name ?? code), flag: flagCode(row.flag), locale: String(row.locale ?? code), direction: row.direction === "rtl" ? "rtl" as const : "ltr" as const, isDefault: isActive(row.is_default) };
  }).filter((row) => /^[a-z]{2,3}$/.test(row.code)).sort((a, b) => Number(b.isDefault) - Number(a.isDefault) || a.label.localeCompare(b.label));
}

function readCountryCache(): CountryOption[] | null {
  try { return JSON.parse(localStorage.getItem(COUNTRY_CACHE_KEY) ?? "null") as CountryOption[] | null; } catch { return null; }
}
function writeCountryCache(data: CountryOption[]): void { try { localStorage.setItem(COUNTRY_CACHE_KEY, JSON.stringify(data)); } catch { /* storage is optional */ } }

function openLanguageDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") return reject(new Error("IndexedDB is unavailable"));
    const request = indexedDB.open(LANGUAGE_DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(LANGUAGE_STORE_NAME);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Unable to open language cache"));
  });
}

async function readLanguageCache(): Promise<{ savedAt: number; data: LanguageOption[] } | null> {
  try {
    const db = await openLanguageDb();
    return await new Promise((resolve, reject) => { const tx = db.transaction(LANGUAGE_STORE_NAME, "readonly"); const get = tx.objectStore(LANGUAGE_STORE_NAME).get("catalog"); get.onsuccess = () => resolve(get.result ?? null); get.onerror = () => reject(get.error); });
  } catch { return null; }
}
async function writeLanguageCache(data: LanguageOption[]): Promise<void> {
  try { const db = await openLanguageDb(); await new Promise<void>((resolve, reject) => { const tx = db.transaction(LANGUAGE_STORE_NAME, "readwrite"); tx.objectStore(LANGUAGE_STORE_NAME).put({ savedAt: Date.now(), data }, "catalog"); tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); }); } catch { /* IndexedDB is optional */ }
}

export async function initCountryCache(): Promise<{ data: CountryOption[]; stale: boolean }> {
  const cached = readCountryCache();
  if (cached?.length) return { data: cached, stale: false };
  try {
    const data = normalizeCountries(await request<ApiCountry>("/public/games/countries"));
    if (!data.length) throw new Error("Country response was empty");
    writeCountryCache(data);
    return { data, stale: false };
  } catch (error) {
    if (cached?.length) return { data: cached, stale: true };
    throw error;
  }
}

export async function initLanguageCache(): Promise<{ data: LanguageOption[]; stale: boolean }> {
  const cached = await readLanguageCache();
  const fresh = cached?.data?.length && Date.now() - cached.savedAt < LANGUAGE_CACHE_TTL;
  if (fresh) return { data: cached.data, stale: false };
  try {
    const data = normalizeLanguages(await request<ApiLanguage>("/public/games/languages"));
    if (!data.length) throw new Error("Language response was empty");
    await writeLanguageCache(data);
    return { data, stale: false };
  } catch (error) {
    if (cached?.data?.length) return { data: cached.data, stale: true };
    throw error;
  }
}
