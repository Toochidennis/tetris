import { memo, useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import type { GameSnapshot, PieceType } from "../engine/types";
import { COLS, ROWS, SHAPES } from "../engine/constants";
import { cellStyle } from "./pieceColors";

type DisplayCell = { type: PieceType | null; ghost: boolean };

function buildDisplay(snap: GameSnapshot): DisplayCell[][] {
  const grid: DisplayCell[][] = snap.board.map((row) =>
    row.map((c) => ({ type: c, ghost: false }))
  );
  if (snap.active) {
    const { type, rotation, row, col } = snap.active;
    for (const c of SHAPES[type][rotation]) {
      const r = row + c.row;
      const cc = col + c.col;
      if (r >= 0 && r < ROWS && cc >= 0 && cc < COLS) {
        grid[r][cc] = { type, ghost: false };
      }
    }
  }
  return grid;
}

// Glass shards — 4 triangles meeting at an off-centre crack point, each scatters
// outward + falls. Transforms are % of the cell, so they scale with board size.
const SHARDS: { clip: string; x: string; y: string; rot: number }[] = [
  { clip: "polygon(0% 0%, 100% 0%, 45% 52%)",     x: "-22%", y: "-58%", rot: -38 },
  { clip: "polygon(100% 0%, 100% 100%, 45% 52%)", x: "88%",  y: "42%",  rot: 52 },
  { clip: "polygon(100% 100%, 0% 100%, 45% 52%)", x: "-8%",  y: "118%", rot: 26 },
  { clip: "polygon(0% 100%, 0% 0%, 45% 52%)",     x: "-86%", y: "48%",  rot: -52 },
];

function ShatterCell({ type }: { type: PieceType }) {
  const s = cellStyle(type, false);
  return (
    <div style={{ position: "relative", width: "100%", height: "100%", pointerEvents: "none" }}>
      {SHARDS.map((sh, i) => (
        <motion.div
          key={i}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
          animate={{ x: sh.x, y: sh.y, rotate: sh.rot, opacity: [1, 1, 0] }}
          transition={{ duration: 0.32, ease: "easeOut", times: [0, 0.55, 1] }}
          style={{ position: "absolute", inset: 0, ...s, borderRadius: 0, clipPath: sh.clip }}
        />
      ))}
    </div>
  );
}

const Cell = memo(function Cell({
  cell, squash, shatter, fall,
}: { cell: DisplayCell; squash: boolean; shatter: boolean; fall: number }) {
  if (cell.type === null) {
    return <div style={{ background: "var(--grid-cell-empty)", borderRadius: 3 }} />;
  }
  if (shatter) {
    return <ShatterCell type={cell.type} />;
  }
  if (fall > 0) {
    // Drop in from above with a slight overshoot/bounce.
    return (
      <motion.div
        initial={{ y: `-${fall * 100}%` }}
        animate={{ y: "0%" }}
        transition={{ duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
        style={cellStyle(cell.type, false)}
      />
    );
  }
  if (squash) {
    return (
      <motion.div
        style={{ ...cellStyle(cell.type, false), transformOrigin: "bottom center" }}
        initial={false}
        animate={{ scaleY: [1, 0.66, 1.08, 1], scaleX: [1, 1.18, 0.96, 1] }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      />
    );
  }
  return <div style={cellStyle(cell.type, false)} />;
});

const GRID_GAP = 2;
const GRID_PAD = 6;

export function Board({ snap, reducedMotion = false }: { snap: GameSnapshot; reducedMotion?: boolean }) {
  const grid = useMemo(() => buildDisplay(snap), [snap]);

  const prevPieces = useRef(snap.scoreState.piecesPlaced);
  const prevBoard = useRef(snap.board);
  const prevClearing = useRef<number[] | null>(snap.clearingRows);
  const [squash, setSquash] = useState<{ keys: Set<string>; nonce: number }>({ keys: new Set(), nonce: 0 });
  const [collapse, setCollapse] = useState<{ drop: Map<number, number>; nonce: number } | null>(null);

  // Squash on plain lock (no line clear).
  useEffect(() => {
    const pieces = snap.scoreState.piecesPlaced;
    if (!reducedMotion && pieces > prevPieces.current && !snap.clearingRows) {
      const keys = new Set<string>();
      const prev = prevBoard.current;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          if (snap.board[r][c] !== null && prev[r]?.[c] == null) keys.add(`${r}-${c}`);
        }
      }
      if (keys.size > 0 && keys.size <= 4) setSquash(s => ({ keys, nonce: s.nonce + 1 }));
    }
    prevPieces.current = pieces;
    prevBoard.current = snap.board;
  }, [snap, reducedMotion]);

  useEffect(() => {
    if (squash.keys.size === 0) return;
    const t = setTimeout(() => setSquash(s => ({ keys: new Set(), nonce: s.nonce })), 240);
    return () => clearTimeout(t);
  }, [squash.nonce, squash.keys.size]);

  // Detect the collapse frame (clearing rows were just removed) and compute how
  // far each surviving row falls = number of cleared rows that were below it.
  useEffect(() => {
    const was = prevClearing.current;
    const now = snap.clearingRows;
    if (!reducedMotion && was && was.length && !now) {
      const cleared = was;
      const drop = new Map<number, number>();
      for (let orig = 0; orig < ROWS; orig++) {
        if (cleared.includes(orig)) continue;
        const below = cleared.reduce((n, cr) => n + (cr > orig ? 1 : 0), 0);
        if (below > 0) drop.set(orig + below, below); // key by post-collapse row
      }
      if (drop.size) setCollapse(c => ({ drop, nonce: (c?.nonce ?? 0) + 1 }));
    }
    prevClearing.current = now;
  }, [snap, reducedMotion]);

  useEffect(() => {
    if (!collapse) return;
    const t = setTimeout(() => setCollapse(null), 340);
    return () => clearTimeout(t);
  }, [collapse?.nonce]);

  const clearing = snap.clearingRows;
  const shatterRows = !reducedMotion && clearing ? new Set(clearing) : null;
  const tetris = (clearing?.length ?? 0) >= 4;

  // Dynamic light beam cast below the active piece, in its own color.
  const beam = useMemo(() => {
    if (!snap.active) return null;
    const { type, rotation, row, col } = snap.active;
    const cells = SHAPES[type][rotation];
    const cols = cells.map(c => col + c.col);
    const rows = cells.map(c => row + c.row);
    const minCol = Math.max(0, Math.min(...cols));
    const maxCol = Math.min(COLS - 1, Math.max(...cols));
    const maxRow = Math.max(...rows);
    return {
      left: `${(minCol / COLS) * 100}%`,
      width: `${((maxCol - minCol + 1) / COLS) * 100}%`,
      top: `${((maxRow + 1) / ROWS) * 100}%`,
      glow: `var(--p-${type}-glow)`,
    };
  }, [snap.active]);

  const baseShadow = "0 0 20px rgba(139,92,246,0.32), inset 0 0 26px rgba(0,0,0,0.6)";

  return (
    <motion.div
      animate={!reducedMotion ? {
        boxShadow: [
          "0 0 16px rgba(139,92,246,0.3), inset 0 0 26px rgba(0,0,0,0.6)",
          "0 0 30px rgba(56,189,248,0.42), inset 0 0 26px rgba(0,0,0,0.6)",
          "0 0 16px rgba(139,92,246,0.3), inset 0 0 26px rgba(0,0,0,0.6)",
        ],
      } : undefined}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      style={{
        position: "relative",
        display: "grid",
        gridTemplateColumns: `repeat(${COLS}, 1fr)`,
        gridTemplateRows: `repeat(${ROWS}, 1fr)`,
        gap: GRID_GAP,
        padding: GRID_PAD,
        width: "100%",
        height: "100%",
        background: "linear-gradient(180deg, rgba(18,16,34,0.72), rgba(8,7,18,0.82))",
        border: "1.5px solid rgba(139,92,246,0.5)",
        borderRadius: 14,
        boxShadow: baseShadow,
        backgroundImage:
          "linear-gradient(var(--grid-line) 1px, transparent 1px), linear-gradient(90deg, var(--grid-line) 1px, transparent 1px)",
        touchAction: "none",
      }}
    >
      {/* Active-piece light beam */}
      {!reducedMotion && beam && (
        <div style={{ position: "absolute", inset: GRID_PAD, pointerEvents: "none", zIndex: 1, mixBlendMode: "screen", overflow: "hidden", borderRadius: 8 }}>
          <motion.div
            style={{
              position: "absolute",
              left: beam.left, width: beam.width, top: beam.top, bottom: 0,
              background: `linear-gradient(to bottom, ${beam.glow}, transparent 78%)`,
            }}
            initial={false}
            animate={{ opacity: [0.45, 0.7, 0.45] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      )}

      {grid.flatMap((row, r) =>
        row.map((cell, c) => {
          const shatter = !!shatterRows?.has(r) && cell.type != null;
          const fall = !shatter && collapse?.drop.get(r) ? collapse.drop.get(r)! : 0;
          // Falling cells remount (keyed by nonce) so the drop-in plays once.
          const key = fall > 0 ? `${r}-${c}-f${collapse!.nonce}` : `${r}-${c}`;
          return (
            <Cell key={key} cell={cell} squash={squash.keys.has(`${r}-${c}`)} shatter={shatter} fall={fall} />
          );
        })
      )}

      {/* Brief white glint along each breaking row for impact */}
      {shatterRows && (
        <div
          style={{
            position: "absolute", inset: 0, boxSizing: "border-box", padding: GRID_PAD,
            display: "grid", gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)`,
            gap: GRID_GAP, pointerEvents: "none", zIndex: 2,
          }}
        >
          {[...shatterRows].map(r => (
            <motion.div
              key={`glint-${r}`}
              initial={{ opacity: 0.85, scaleY: 1 }}
              animate={{ opacity: 0, scaleY: 0.3 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
              style={{
                gridColumn: "1 / -1", gridRow: `${r + 1}`, borderRadius: 4,
                background: "var(--text-primary)",
                boxShadow: `0 0 ${tetris ? 28 : 16}px var(--accent-glow)`,
              }}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
