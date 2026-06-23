// Supported UI languages: native label + flag (country code for the Flag SVG).
export interface Language {
  code: string;
  label: string; // native name shown in the picker
  flag: string;  // ISO country code for the flag icon
}

export const LANGUAGES: Language[] = [
  { code: "ar", label: "العربية", flag: "SA" },
  { code: "zh", label: "中文", flag: "CN" },
  { code: "nl", label: "Nederlands", flag: "NL" },
  { code: "en", label: "English", flag: "US" },
  { code: "fr", label: "Français", flag: "FR" },
  { code: "de", label: "Deutsch", flag: "DE" },
  { code: "ha", label: "Hausa", flag: "NG" },
  { code: "hi", label: "हिन्दी", flag: "IN" },
  { code: "ig", label: "Igbo", flag: "NG" },
  { code: "id", label: "Indonesia", flag: "ID" },
  { code: "it", label: "Italiano", flag: "IT" },
  { code: "ja", label: "日本語", flag: "JP" },
  { code: "ko", label: "한국어", flag: "KR" },
  { code: "ms", label: "Melayu", flag: "MY" },
  { code: "pt", label: "Português", flag: "BR" },
  { code: "ru", label: "Русский", flag: "RU" },
  { code: "es", label: "Español", flag: "MX" },
  { code: "sw", label: "Kiswahili", flag: "KE" },
  { code: "th", label: "ไทย", flag: "TH" },
  { code: "tr", label: "Türkçe", flag: "TR" },
  { code: "ur", label: "اردو", flag: "PK" },
];

// Languages that render right-to-left.
export const RTL_CODES = ["ar", "ur"];

export const isRTL = (code: string) => RTL_CODES.includes(code);
