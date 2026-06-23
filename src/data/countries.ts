import * as Flags from "country-flag-icons/react/3x2";

// English country names from the platform's Intl data — no extra dependency.
const regionNames =
  typeof Intl !== "undefined" && "DisplayNames" in Intl
    ? new Intl.DisplayNames(["en"], { type: "region" })
    : null;

function nameFor(code: string): string {
  try {
    return regionNames?.of(code) ?? code;
  } catch {
    return code;
  }
}

// Every country that has a flag, paired with its name, sorted A→Z.
export const COUNTRIES: [string, string][] = Object.keys(Flags)
  .filter((c) => /^[A-Z]{2}$/.test(c))
  .map((code) => [code, nameFor(code)] as [string, string])
  .sort((a, b) => a[1].localeCompare(b[1]));
