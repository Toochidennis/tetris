import type { PieceType } from "../engine/types";

// Glassy neon block: translucent tinted body, bright specular gloss, glowing rim.
export function cellStyle(type: PieceType, ghost = false): React.CSSProperties {
  const base = `var(--p-${type})`;
  const glow = `var(--p-${type}-glow)`;
  if (ghost) {
    return {
      background: "transparent",
      border: `2px solid ${base}`,
      opacity: 0.28,
      borderRadius: 4,
      boxShadow: `inset 0 0 6px ${glow}`,
    };
  }
  return {
    borderRadius: 4,
    border: `1px solid color-mix(in srgb, ${glow} 85%, transparent)`,
    background: [
      // diagonal specular gloss streak (top-left -> fades)
      "linear-gradient(135deg, rgba(255,255,255,0.6) 0%, rgba(255,255,255,0.12) 16%, transparent 44%)",
      // translucent tinted glass body (lets the grid show through faintly)
      `linear-gradient(160deg, color-mix(in srgb, ${glow} 72%, transparent) 0%, color-mix(in srgb, ${base} 60%, transparent) 52%, color-mix(in srgb, ${base} 80%, transparent) 100%)`,
    ].join(", "),
    boxShadow: [
      `0 0 10px ${glow}`,                                    // outer bloom
      `inset 0 0 8px color-mix(in srgb, ${glow} 55%, transparent)`, // inner glow
      "inset 0 2px 3px rgba(255,255,255,0.55)",              // top specular edge
      "inset 0 -4px 6px rgba(0,0,0,0.3)",                    // bottom shade
    ].join(", "),
  };
}
