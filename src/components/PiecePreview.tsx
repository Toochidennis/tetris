import { SHAPES } from "../engine/constants";
import type { PieceType } from "../engine/types";
import { cellStyle } from "./pieceColors";

export function PiecePreview({ type, size = 16 }: { type: PieceType; size?: number }) {
  const cells = SHAPES[type][0];
  const minR = Math.min(...cells.map((c) => c.row));
  const maxR = Math.max(...cells.map((c) => c.row));
  const minC = Math.min(...cells.map((c) => c.col));
  const maxC = Math.max(...cells.map((c) => c.col));
  const rows = maxR - minR + 1;
  const cols = maxC - minC + 1;
  const grid: boolean[][] = Array.from({ length: rows }, () =>
    Array<boolean>(cols).fill(false)
  );
  for (const c of cells) grid[c.row - minR][c.col - minC] = true;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${cols}, ${size}px)`,
        gridTemplateRows: `repeat(${rows}, ${size}px)`,
        gap: 2,
      }}
    >
      {grid.flatMap((row, r) =>
        row.map((on, c) => (
          <div key={`${r}-${c}`} style={on ? cellStyle(type) : { background: "transparent" }} />
        ))
      )}
    </div>
  );
}
