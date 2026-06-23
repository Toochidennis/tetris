import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { useMetaStore } from "../../state/metaStore";
import { leaderboardService } from "../../state/services";
import type { LeaderboardEntry } from "../../state/services";
import type { GameMode } from "../../engine/types";
import { ArcadeBackground } from "../ArcadeBackground";
import { Avatar, AVATAR_META } from "../Avatars";
import { Flag } from "../Flag";

const TABS: GameMode[] = ["marathon", "sprint", "ultra", "daily"];

const MEDAL = {
  1: { color: "#FFC400", glow: "rgba(255,196,0,0.6)", label: "1" },
  2: { color: "#C7CEDA", glow: "rgba(199,206,218,0.55)", label: "2" },
  3: { color: "#E08C46", glow: "rgba(224,140,70,0.55)", label: "3" },
} as const;

// Deterministic avatar for players whose profile we don't hold locally.
function avatarFor(username: string) {
  let h = 0;
  for (const c of username) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h % AVATAR_META.length;
}

// Lightweight count-up for scores.
function useCountUp(value: number, ms = 600) {
  const [disp, setDisp] = useState(value);
  const fromRef = useRef(0);
  const rafRef = useRef(0);
  useEffect(() => {
    const from = fromRef.current;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / ms);
      const e = 1 - Math.pow(1 - p, 3);
      const v = Math.round(from + (value - from) * e);
      setDisp(v);
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
      else fromRef.current = value;
    };
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, ms]);
  return disp;
}

function Score({ value, style }: { value: number; style?: React.CSSProperties }) {
  const v = useCountUp(value);
  return <span className="tabular" style={style}>{v.toLocaleString()}</span>;
}

export function Leaderboard() {
  const { t } = useTranslation();
  const { setScreen, profile } = useMetaStore();
  const [mode, setMode] = useState<GameMode>("marathon");
  const [rows, setRows] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    const unsub = leaderboardService.subscribe(mode, (entries) => setRows(entries.slice(0, 100)));
    return unsub;
  }, [mode]);

  const myRow = profile ? rows.find((r) => r.username === profile.username) : undefined;
  const myAvatar = profile?.avatarId ?? 0;

  const podium = rows.slice(0, 3);
  const list = rows.slice(3, 30);

  // Avatar id for an entry: the logged-in user keeps their chosen avatar;
  // otherwise use the backend-supplied avatar, falling back to a derived one.
  const avatarId = (r: LeaderboardEntry) =>
    profile && r.username === profile.username ? myAvatar : (r.avatarId ?? avatarFor(r.username));

  return (
    <div style={{ position: "relative", height: "100%", background: "#050816", overflow: "hidden" }}>
      <ArcadeBackground />

      <div style={{ position: "relative", zIndex: 1, height: "100%", display: "flex", flexDirection: "column", padding: "14px 14px 0" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
          <button
            onClick={() => setScreen("menu")}
            className="glass"
            style={{ width: 38, height: 38, borderRadius: 11, display: "grid", placeItems: "center", color: "#A5B4FC", fontSize: 17, cursor: "pointer" }}
            aria-label={t("common.back", "Back")}
          >←</button>
          <h1 style={{
            margin: 0, flex: 1, textAlign: "center", fontSize: 19, fontWeight: 900, letterSpacing: 2.5, textTransform: "uppercase",
            background: "linear-gradient(90deg, #a78bfa, #38BDF8)",
            WebkitBackgroundClip: "text", backgroundClip: "text", WebkitTextFillColor: "transparent",
            filter: "drop-shadow(0 0 12px rgba(167,139,250,0.55))",
          }}>
            {t("leaderboard.title", "Leaderboard")}
          </h1>
          <div style={{ width: 38, display: "grid", placeItems: "center", fontSize: 10, color: "#22C55E" }}>
            <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 1.8, repeat: Infinity }}>●</motion.span>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 6, padding: 4, borderRadius: 14, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(139,92,246,0.25)", marginBottom: 14 }}>
          {TABS.map((m) => {
            const active = m === mode;
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                style={{ position: "relative", flex: 1, padding: "8px 4px", borderRadius: 10, border: "none", background: "transparent", cursor: "pointer", color: active ? "#fff" : "#7c83a3", fontSize: 12, fontWeight: 800, letterSpacing: 0.5, textTransform: "uppercase" }}
              >
                {active && (
                  <motion.span
                    layoutId="tabhl"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    style={{ position: "absolute", inset: 0, borderRadius: 10, background: "linear-gradient(135deg, #8B5CF6, #6d28d9)", boxShadow: "0 0 16px rgba(139,92,246,0.65)", zIndex: 0 }}
                  />
                )}
                <span style={{ position: "relative", zIndex: 1 }}>{t(`modes.${m}`)}</span>
              </button>
            );
          })}
        </div>

        {/* Mode-keyed content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}
          >
            {/* Podium */}
            {podium.length >= 3 && (
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 8, marginBottom: 14 }}>
                <PodiumCard rank={2} entry={podium[1]} avatar={avatarId(podium[1])} />
                <PodiumCard rank={1} entry={podium[0]} avatar={avatarId(podium[0])} />
                <PodiumCard rank={3} entry={podium[2]} avatar={avatarId(podium[2])} />
              </div>
            )}

            {/* List */}
            <div style={{ flex: 1, minHeight: 0, overflowY: "auto", display: "flex", flexDirection: "column", gap: 7, paddingBottom: 8 }}>
              {list.map((r, i) => (
                <ListRow key={r.id} r={r} avatar={avatarId(r)} me={r.username === profile?.username} index={i} youLabel={t("leaderboard.you", "You")} />
              ))}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Your position */}
        {profile && (
          <YourPosition
            rank={myRow?.rank}
            username={profile.username}
            avatar={myAvatar}
            score={myRow?.score ?? profile.bestScores[mode] ?? 0}
            label={t("leaderboard.you", "Your Position")}
          />
        )}
      </div>
    </div>
  );
}

function PodiumCard({ rank, entry, avatar }: { rank: 1 | 2 | 3; entry: LeaderboardEntry; avatar: number }) {
  const m = MEDAL[rank];
  const first = rank === 1;
  const avSize = first ? 56 : 44;
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: first ? 0.05 : rank * 0.08, type: "spring", stiffness: 220, damping: 20 }}
      style={{
        position: "relative", flex: first ? 1.15 : 1, minWidth: 0,
        display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
        padding: first ? "16px 8px 12px" : "12px 6px 10px",
        borderRadius: 16,
        background: `linear-gradient(180deg, ${m.color}26, rgba(10,8,22,0.6))`,
        border: `1.5px solid ${m.color}`,
        boxShadow: `0 0 20px ${m.glow}, inset 0 0 18px ${m.color}1c`,
        marginBottom: first ? 0 : 8,
      }}
    >
      {first && (
        <motion.div
          animate={{ y: [0, -3, 0] }} transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ position: "absolute", top: -14, fontSize: 20, filter: "drop-shadow(0 0 6px gold)" }}
        >👑</motion.div>
      )}
      {/* avatar ring */}
      <div style={{ position: "relative", width: avSize, height: avSize, borderRadius: 999, display: "grid", placeItems: "center", background: "rgba(0,0,0,0.35)", border: `2px solid ${m.color}`, boxShadow: `0 0 14px ${m.glow}` }}>
        <Avatar id={avatar} size={avSize - 14} />
        <div style={{ position: "absolute", bottom: -8, width: 20, height: 20, borderRadius: 999, display: "grid", placeItems: "center", background: m.color, color: "#1a1205", fontSize: 11, fontWeight: 900, boxShadow: `0 0 10px ${m.glow}` }}>
          {m.label}
        </div>
      </div>
      <div style={{ marginTop: 8, fontSize: first ? 14 : 12.5, fontWeight: 800, color: "#fff", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {entry.username}
      </div>
      <Score value={entry.score} style={{ fontSize: first ? 17 : 14, fontWeight: 900, color: m.color, textShadow: `0 0 10px ${m.glow}` }} />
    </motion.div>
  );
}

function ListRow({ r, avatar, me, index, youLabel }: { r: LeaderboardEntry; avatar: number; me: boolean; index: number; youLabel: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.02 * index, duration: 0.25 }}
      whileHover={{ boxShadow: me ? "0 0 22px rgba(139,92,246,0.6)" : "0 0 16px rgba(56,189,248,0.35)" }}
      style={{
        display: "flex", alignItems: "center", gap: 11, padding: "9px 12px", borderRadius: 12,
        background: me ? "linear-gradient(135deg, rgba(139,92,246,0.28), rgba(10,8,22,0.55))" : "rgba(255,255,255,0.04)",
        border: `1px solid ${me ? "rgba(139,92,246,0.8)" : "rgba(255,255,255,0.08)"}`,
        backdropFilter: "blur(8px)",
      }}
    >
      <div className="tabular" style={{ width: 22, textAlign: "center", fontWeight: 800, fontSize: 13, color: "#7c83a3" }}>{r.rank}</div>
      <div style={{ width: 30, height: 30, borderRadius: 999, display: "grid", placeItems: "center", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(255,255,255,0.12)", flexShrink: 0 }}>
        <Avatar id={avatar} size={20} />
      </div>
      <Flag code={r.countryCode} width={20} />
      <div style={{ flex: 1, minWidth: 0, fontWeight: 700, fontSize: 13.5, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {r.username}{me && <span style={{ color: "#c4b5fd", fontWeight: 600 }}> · {youLabel}</span>}
      </div>
      <Score value={r.score} style={{ fontWeight: 800, fontSize: 13.5, color: "#fff" }} />
    </motion.div>
  );
}

function YourPosition({ rank, username, avatar, score, label }: { rank?: number; username: string; avatar: number; score: number; label: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2, type: "spring", stiffness: 240, damping: 22 }}
      style={{ flexShrink: 0, margin: "8px -14px 0", padding: "10px 16px calc(12px + env(safe-area-inset-bottom))" }}
    >
      <div style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: 2, color: "#c4b5fd", textAlign: "center", marginBottom: 6, textTransform: "uppercase" }}>
        {label}
      </div>
      <motion.div
        animate={{ boxShadow: ["0 0 16px rgba(139,92,246,0.45)", "0 0 30px rgba(139,92,246,0.75)", "0 0 16px rgba(139,92,246,0.45)"] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        style={{
          display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", borderRadius: 14,
          background: "linear-gradient(135deg, rgba(139,92,246,0.42), rgba(56,189,248,0.16))",
          border: "1.5px solid rgba(139,92,246,0.9)",
        }}
      >
        <div className="tabular" style={{ minWidth: 30, textAlign: "center", fontWeight: 900, fontSize: 16, color: "#fff" }}>
          {rank ?? "—"}
        </div>
        <div style={{ width: 36, height: 36, borderRadius: 999, display: "grid", placeItems: "center", background: "rgba(0,0,0,0.35)", border: "2px solid #8B5CF6", boxShadow: "0 0 12px rgba(139,92,246,0.7)", flexShrink: 0 }}>
          <Avatar id={avatar} size={24} />
        </div>
        <div style={{ flex: 1, minWidth: 0, fontWeight: 800, fontSize: 15, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {username}
        </div>
        <Score value={score} style={{ fontWeight: 900, fontSize: 16, color: "#FFC400", textShadow: "0 0 10px rgba(255,196,0,0.5)" }} />
      </motion.div>
    </motion.div>
  );
}
