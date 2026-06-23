import type { CSSProperties } from "react";
import * as Flags from "country-flag-icons/react/3x2";

type FlagComponent = React.FC<{ title?: string; style?: CSSProperties }>;
const FLAGS = Flags as unknown as Record<string, FlagComponent>;

// Renders a real SVG country flag (bundled locally — no CDN), for any ISO
// country code. Falls back to a neutral globe when the code is unknown.
export function Flag({ code, width = 22, radius = 3, style }: { code: string; width?: number; radius?: number; style?: CSSProperties }) {
  const C = code ? FLAGS[code.toUpperCase()] : undefined;
  const box: CSSProperties = {
    width,
    height: width * (2 / 3),
    borderRadius: radius,
    objectFit: "cover",
    boxShadow: "0 0 0 1px rgba(0,0,0,0.25)",
    flexShrink: 0,
    ...style,
  };
  if (!C) {
    return (
      <span style={{ ...box, display: "inline-grid", placeItems: "center", background: "rgba(255,255,255,0.08)", fontSize: width * 0.6 }}>
        🌐
      </span>
    );
  }
  return <C title={code} style={box} />;
}
