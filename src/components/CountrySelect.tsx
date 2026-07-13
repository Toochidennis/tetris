import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flag } from "./Flag";
import type { CountryOption } from "../data/catalog";

// Custom country dropdown — unlike a native <select>, this can render real SVG
// flags in every row. Opens downward, scrolls, closes on outside-click / Escape.
export function CountrySelect({
  value,
  options,
  onChange,
}: {
  value: string;
  options: CountryOption[];
  onChange: (code: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((country) => country.code === value);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Reset the search each time the panel opens.
  useEffect(() => { if (!open) setQuery(""); }, [open]);

  const q = query.trim().toLowerCase();
  const filtered = q
    ? options.filter(({ code, name }) => name.toLowerCase().includes(q) || code.toLowerCase().includes(q))
    : options;

  return (
    <div ref={ref} style={{ position: "relative" }}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 12,
          padding: "13px 14px", borderRadius: 12, cursor: "pointer",
          border: `1.5px solid ${open ? "#8B5CF6" : "rgba(255,255,255,0.12)"}`,
          background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 16,
          boxShadow: open ? "0 0 0 3px rgba(139,92,246,0.18)" : "none",
          transition: "border-color 160ms, box-shadow 160ms",
        }}
      >
        <Flag code={value} width={26} />
        <span style={{ flex: 1, textAlign: "start", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {selected?.name ?? value}
        </span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.18 }} style={{ color: "#A5B4FC", fontSize: 11, lineHeight: 1 }}>
          ▼
        </motion.span>
      </button>

      {/* Panel (drops downward) */}
      <AnimatePresence>
        {open && (
          <motion.div
            role="listbox"
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
            style={{
              position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 40,
              maxHeight: 300, display: "flex", flexDirection: "column",
              borderRadius: 12, background: "#0d0b1a",
              border: "1.5px solid rgba(139,92,246,0.45)",
              boxShadow: "0 16px 36px rgba(0,0,0,0.55), 0 0 18px rgba(139,92,246,0.25)",
              overflow: "hidden",
            }}
          >
            {/* search */}
            <div style={{ padding: 8, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search country…"
                style={{
                  width: "100%", padding: "9px 12px", borderRadius: 9, outline: "none",
                  border: "1px solid rgba(255,255,255,0.12)", background: "rgba(255,255,255,0.05)",
                  color: "#fff", fontSize: 14,
                }}
              />
            </div>

            {/* list */}
            <div style={{ overflowY: "auto", padding: 6 }}>
            {filtered.length === 0 && (
              <div style={{ padding: "14px 10px", color: "#7c83a3", fontSize: 13, textAlign: "center" }}>No matches</div>
            )}
            {filtered.map(({ code, name }) => {
              const sel = code === value;
              const hot = hover === code;
              return (
                <button
                  key={code}
                  type="button"
                  role="option"
                  aria-selected={sel}
                  onMouseEnter={() => setHover(code)}
                  onMouseLeave={() => setHover((h) => (h === code ? null : h))}
                  onClick={() => { onChange(code); setOpen(false); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 10px", borderRadius: 9, border: "none", cursor: "pointer",
                    background: sel ? "rgba(139,92,246,0.3)" : hot ? "rgba(255,255,255,0.06)" : "transparent",
                    color: "#fff", fontSize: 15, textAlign: "start",
                    transition: "background 120ms",
                  }}
                >
                  <Flag code={code} width={24} />
                  <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{name}</span>
                  {sel && <span style={{ color: "#a78bfa", fontWeight: 800 }}>✓</span>}
                </button>
              );
            })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
