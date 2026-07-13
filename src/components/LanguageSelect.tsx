import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Flag } from "./Flag";
import type { LanguageOption } from "../data/catalog";

// Custom language dropdown — shows each language's native name + flag (no codes),
// drops downward, closes on outside-click / Escape.
export function LanguageSelect({ value, options, onChange }: { value: string; options: LanguageOption[]; onChange: (code: string) => void }) {
  const [open, setOpen] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((l) => l.code === value) ?? options.find((l) => l.code === "en") ?? options[0];

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

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          width: "100%", display: "flex", alignItems: "center", gap: 12,
          padding: "12px 14px", borderRadius: 11, cursor: "pointer",
          border: `1.5px solid ${open ? "#38BDF8" : "rgba(255,255,255,0.12)"}`,
          background: "rgba(255,255,255,0.05)", color: "#fff", fontSize: 15,
          boxShadow: open ? "0 0 0 3px rgba(56,189,248,0.18)" : "none",
          transition: "border-color 160ms, box-shadow 160ms",
        }}
      >
        <Flag code={selected?.flag} width={24} />
        <span style={{ flex: 1, textAlign: "start" }}>{selected?.label ?? value}</span>
        <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.18 }} style={{ color: "#A5B4FC", fontSize: 11, lineHeight: 1 }}>▼</motion.span>
      </button>

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
              maxHeight: 264, overflowY: "auto", padding: 6,
              borderRadius: 12, background: "#0d0b1a",
              border: "1.5px solid rgba(56,189,248,0.4)",
              boxShadow: "0 16px 36px rgba(0,0,0,0.55), 0 0 18px rgba(56,189,248,0.2)",
            }}
          >
            {options.map((l) => {
              const sel = l.code === value;
              const hot = hover === l.code;
              return (
                <button
                  key={l.code}
                  type="button"
                  role="option"
                  aria-selected={sel}
                  onMouseEnter={() => setHover(l.code)}
                  onMouseLeave={() => setHover((h) => (h === l.code ? null : h))}
                  onClick={() => { onChange(l.code); setOpen(false); }}
                  style={{
                    width: "100%", display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 10px", borderRadius: 9, border: "none", cursor: "pointer",
                    background: sel ? "rgba(56,189,248,0.28)" : hot ? "rgba(255,255,255,0.06)" : "transparent",
                    color: "#fff", fontSize: 15, textAlign: "start", transition: "background 120ms",
                  }}
                >
                  <Flag code={l.flag} width={22} />
                  <span style={{ flex: 1 }}>{l.label}</span>
                  {sel && <span style={{ color: "#7dd3fc", fontWeight: 800 }}>✓</span>}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
