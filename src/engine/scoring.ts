import type { ActivePiece, BoardCell } from "./types";
import {
  COLS,
  ROWS,
  LINE_POINTS,
  TSPIN_LINE_POINTS,
  TSPIN_POINTS,
  COMBO_POINT,
} from "./constants";
import { activeCells } from "./board";

export type TSpin = "none" | "mini" | "full";

// 3-corner T-spin detection. `rotatedLast` = the move that locked was a rotation.
export function detectTSpin(
  board: BoardCell[][],
  piece: ActivePiece,
  rotatedLast: boolean
): TSpin {
  if (piece.type !== "T" || !rotatedLast) return "none";

  // T center is at offset (row+1, col+1) of its 4x4 box in all states.
  const cr = piece.row + 1;
  const cc = piece.col + 1;
  const corners: [number, number][] = [
    [cr - 1, cc - 1],
    [cr - 1, cc + 1],
    [cr + 1, cc - 1],
    [cr + 1, cc + 1],
  ];
  const occupied = (r: number, c: number) => {
    if (c < 0 || c >= COLS || r >= ROWS) return true; // walls/floor count
    if (r < 0) return false;
    return board[r][c] !== null;
  };
  const filled = corners.filter(([r, c]) => occupied(r, c)).length;
  if (filled < 3) return "none";

  // Front corners depend on rotation (the two corners on the "pointing" side).
  const frontByRot: Record<number, number[]> = {
    0: [0, 1], // pointing up -> top corners are front
    1: [1, 3], // pointing right
    2: [2, 3], // pointing down
    3: [0, 2], // pointing left
  };
  const front = frontByRot[piece.rotation];
  const frontFilled = front.filter((i) => occupied(corners[i][0], corners[i][1])).length;
  return frontFilled === 2 ? "full" : "mini";
}

export interface ClearResult {
  points: number;
  isDifficult: boolean; // tetris or t-spin with lines -> chains back-to-back
}

export function computeClearPoints(
  lines: number,
  tSpin: TSpin,
  level: number,
  combo: number,
  backToBackActive: boolean
): ClearResult {
  let base = 0;
  let difficult = false;

  if (tSpin === "full") {
    base = lines > 0 ? TSPIN_LINE_POINTS.full[lines] : TSPIN_POINTS.full;
    difficult = lines > 0;
  } else if (tSpin === "mini") {
    base = lines > 0 ? TSPIN_LINE_POINTS.mini[lines] : TSPIN_POINTS.mini;
    difficult = lines > 0;
  } else {
    base = LINE_POINTS[lines] ?? 0;
    difficult = lines === 4; // tetris
  }

  let points = base * level;
  if (backToBackActive && difficult && points > 0) {
    points = Math.floor(points * 1.5);
  }
  if (combo > 0 && lines > 0) {
    points += COMBO_POINT * combo * level;
  }
  return { points, isDifficult: difficult };
}

// Count occupied cells per row to support fx; not heavy.
export function landingHeight(piece: ActivePiece): number {
  return Math.max(...activeCells(piece).map((c) => c.row));
}
