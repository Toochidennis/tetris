// Typed accessors for theme token names, so components can reference
// CSS variables without typos. Values resolve at runtime via CSS.
export const token = {
  bgBase: "var(--bg-base)",
  bgPanel: "var(--bg-panel)",
  textPrimary: "var(--text-primary)",
  textMuted: "var(--text-muted)",
  accent: "var(--accent)",
  accentGlow: "var(--accent-glow)",
  success: "var(--success)",
  danger: "var(--danger)",
} as const;

export const pieceVar = (t: string) => `var(--p-${t})`;
