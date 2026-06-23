import type { ActivePiece, BoardCell, Coord, PieceType, RotationState } from "./types";
import { COLS, ROWS, SHAPES } from "./constants";

export function createEmptyBoard(): BoardCell[][] {
  return Array.from({ length: ROWS }, () => Array<BoardCell>(COLS).fill(null));
}

// Absolute cell coordinates for a piece at a given position/rotation.
export function pieceCells(
  type: PieceType,
  rotation: RotationState,
  row: number,
  col: number
): Coord[] {
  return SHAPES[type][rotation].map((c) => ({ row: row + c.row, col: col + c.col }));
}

export function activeCells(p: ActivePiece): Coord[] {
  return pieceCells(p.type, p.rotation, p.row, p.col);
}

// Is the piece valid at this position (in bounds + no overlap)?
export function isValid(
  board: BoardCell[][],
  type: PieceType,
  rotation: RotationState,
  row: number,
  col: number
): boolean {
  for (const cell of pieceCells(type, rotation, row, col)) {
    if (cell.col < 0 || cell.col >= COLS) return false;
    if (cell.row >= ROWS) return false;
    if (cell.row >= 0 && board[cell.row][cell.col] !== null) return false;
  }
  return true;
}

// Lock the piece into a copy of the board.
export function lockPiece(board: BoardCell[][], p: ActivePiece): BoardCell[][] {
  const next = board.map((r) => r.slice());
  for (const cell of activeCells(p)) {
    if (cell.row >= 0 && cell.row < ROWS && cell.col >= 0 && cell.col < COLS) {
      next[cell.row][cell.col] = p.type;
    }
  }
  return next;
}

// Find full rows.
export function fullRows(board: BoardCell[][]): number[] {
  const rows: number[] = [];
  for (let r = 0; r < ROWS; r++) {
    if (board[r].every((c) => c !== null)) rows.push(r);
  }
  return rows;
}

// Remove given rows and drop everything above down.
export function clearRows(board: BoardCell[][], rows: number[]): BoardCell[][] {
  if (rows.length === 0) return board;
  const remove = new Set(rows);
  const kept = board.filter((_, r) => !remove.has(r));
  const cleared: BoardCell[][] = [];
  for (let i = 0; i < rows.length; i++) {
    cleared.push(Array<BoardCell>(COLS).fill(null));
  }
  return [...cleared, ...kept];
}

// Lowest valid row (ghost / hard drop landing) for a piece.
export function dropRow(
  board: BoardCell[][],
  type: PieceType,
  rotation: RotationState,
  row: number,
  col: number
): number {
  let r = row;
  while (isValid(board, type, rotation, r + 1, col)) r++;
  return r;
}
