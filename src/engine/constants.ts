import type { PieceType, RotationState, Coord } from "./types";

export const COLS = 10;
export const ROWS = 20;
export const SPAWN_COL = 3;
export const SPAWN_ROW = 0;

// Lock delay shrinks as levels climb. A flat delay would come to dominate each
// piece once gravity is fast, making the game feel slower the further you get.
export const LOCK_DELAY_MS = 500;
export const LOCK_DELAY_MIN_MS = 150;
export const LOCK_DELAY_STEP_MS = 40; // subtracted per level
export const MAX_LOCK_RESETS = 15;
export const CLEAR_DELAY_MS = 300;
export const LINES_PER_LEVEL = 10;

// Gravity ramp: starts slow (~1s/row) and speeds up smoothly as lines are
// cleared, never faster than this floor. Tunable to taste.
export const GRAVITY_MIN_MS = 90;

// Piece shapes as filled coordinates within a 4x4 box, per rotation state.
// Standard SRS spawn orientations.
export const SHAPES: Record<PieceType, Coord[][]> = {
  I: [
    [{ row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 1, col: 3 }],
    [{ row: 0, col: 2 }, { row: 1, col: 2 }, { row: 2, col: 2 }, { row: 3, col: 2 }],
    [{ row: 2, col: 0 }, { row: 2, col: 1 }, { row: 2, col: 2 }, { row: 2, col: 3 }],
    [{ row: 0, col: 1 }, { row: 1, col: 1 }, { row: 2, col: 1 }, { row: 3, col: 1 }],
  ],
  O: [
    [{ row: 0, col: 1 }, { row: 0, col: 2 }, { row: 1, col: 1 }, { row: 1, col: 2 }],
    [{ row: 0, col: 1 }, { row: 0, col: 2 }, { row: 1, col: 1 }, { row: 1, col: 2 }],
    [{ row: 0, col: 1 }, { row: 0, col: 2 }, { row: 1, col: 1 }, { row: 1, col: 2 }],
    [{ row: 0, col: 1 }, { row: 0, col: 2 }, { row: 1, col: 1 }, { row: 1, col: 2 }],
  ],
  T: [
    [{ row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 }],
    [{ row: 0, col: 1 }, { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 2, col: 1 }],
    [{ row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 2, col: 1 }],
    [{ row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 1 }],
  ],
  S: [
    [{ row: 0, col: 1 }, { row: 0, col: 2 }, { row: 1, col: 0 }, { row: 1, col: 1 }],
    [{ row: 0, col: 1 }, { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 2, col: 2 }],
    [{ row: 1, col: 1 }, { row: 1, col: 2 }, { row: 2, col: 0 }, { row: 2, col: 1 }],
    [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 1 }],
  ],
  Z: [
    [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 1 }, { row: 1, col: 2 }],
    [{ row: 0, col: 2 }, { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 2, col: 1 }],
    [{ row: 1, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 1 }, { row: 2, col: 2 }],
    [{ row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 2, col: 0 }],
  ],
  J: [
    [{ row: 0, col: 0 }, { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 }],
    [{ row: 0, col: 1 }, { row: 0, col: 2 }, { row: 1, col: 1 }, { row: 2, col: 1 }],
    [{ row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 2, col: 2 }],
    [{ row: 0, col: 1 }, { row: 1, col: 1 }, { row: 2, col: 0 }, { row: 2, col: 1 }],
  ],
  L: [
    [{ row: 0, col: 2 }, { row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 }],
    [{ row: 0, col: 1 }, { row: 1, col: 1 }, { row: 2, col: 1 }, { row: 2, col: 2 }],
    [{ row: 1, col: 0 }, { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 2, col: 0 }],
    [{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 1 }, { row: 2, col: 1 }],
  ],
};

export const ALL_PIECES: PieceType[] = ["I", "O", "T", "S", "Z", "J", "L"];

// SRS wall-kick tables. Offsets are [colOffset, rowOffsetUp] (rowOffsetUp positive = up).
type KickKey = `${RotationState}->${RotationState}`;
type Kick = [number, number];

export const KICKS_JLSTZ: Record<KickKey, Kick[]> = {
  "0->1": [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  "1->0": [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  "1->2": [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  "2->1": [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  "2->3": [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  "3->2": [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  "3->0": [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
  "0->3": [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
} as Record<KickKey, Kick[]>;

export const KICKS_I: Record<KickKey, Kick[]> = {
  "0->1": [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  "1->0": [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  "1->2": [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
  "2->1": [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  "2->3": [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  "3->2": [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  "3->0": [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
  "0->3": [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
} as Record<KickKey, Kick[]>;

export function kickKey(from: RotationState, to: RotationState): KickKey {
  return `${from}->${to}` as KickKey;
}

// Scoring tables (multiplied by level).
export const LINE_POINTS = [0, 100, 300, 500, 800]; // index = lines cleared
export const TSPIN_POINTS = { mini: 100, full: 400 };
export const TSPIN_LINE_POINTS = {
  full: [400, 800, 1200, 1600],
  mini: [100, 200, 0, 0],
};
export const SOFT_DROP_POINT = 1;
export const HARD_DROP_POINT = 2;
export const COMBO_POINT = 50;
