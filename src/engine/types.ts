export type PieceType = "I" | "O" | "T" | "S" | "Z" | "J" | "L";

// 0 = spawn, 1 = R (cw), 2 = 180, 3 = L (ccw)
export type RotationState = 0 | 1 | 2 | 3;

export type Coord = { row: number; col: number };

export type GameStatus = "idle" | "playing" | "paused" | "over";

export type GameMode = "marathon" | "sprint" | "ultra" | "daily";

export interface ActivePiece {
  type: PieceType;
  rotation: RotationState;
  row: number; // top-left of the piece's 4x4 box
  col: number;
}

// A board cell is null (empty) or a PieceType (locked block keeps its color)
export type BoardCell = PieceType | null;

export interface ScoreState {
  score: number;
  level: number;
  lines: number;
  combo: number;
  backToBack: boolean;
  piecesPlaced: number;
}

// End-of-run summary used to evaluate achievements and record stats.
export interface GameSummary {
  mode: GameMode;
  score: number;
  lines: number;
  maxLevel: number;
  timeMs: number;
  tetrises: number; // 4-line clears
  tSpins: number; // any T-spin
  maxCombo: number; // longest chain of consecutive line-clearing locks
  finishedGoal: boolean; // mode objective met (e.g. Sprint 40 lines)
}

export interface GameSnapshot {
  board: BoardCell[][]; // [row][col], row 0 = top
  active: ActivePiece | null;
  ghostRow: number | null; // top row of the ghost piece box
  hold: PieceType | null;
  canHold: boolean;
  queue: PieceType[]; // next pieces (front = soonest)
  status: GameStatus;
  mode: GameMode;
  elapsedMs: number;
  scoreState: ScoreState;
  lastClear: ClearEvent | null;
  clearingRows: number[] | null; // rows mid-flash, not yet removed from board
}

export interface ClearEvent {
  rows: number[]; // cleared row indices
  count: number; // 1..4
  tSpin: "none" | "mini" | "full";
  backToBack: boolean;
  combo: number;
  points: number;
}
