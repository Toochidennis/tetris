import type {
  ActivePiece,
  BoardCell,
  ClearEvent,
  GameMode,
  GameSnapshot,
  GameStatus,
  GameSummary,
  PieceType,
  RotationState,
  ScoreState,
} from "./types";
import {
  KICKS_I,
  KICKS_JLSTZ,
  LINES_PER_LEVEL,
  LOCK_DELAY_MS,
  LOCK_DELAY_MIN_MS,
  LOCK_DELAY_STEP_MS,
  CLEAR_DELAY_MS,
  GRAVITY_MIN_MS,
  MAX_LOCK_RESETS,
  SPAWN_COL,
  SPAWN_ROW,
  kickKey,
  HARD_DROP_POINT,
} from "./constants";
import { Bag } from "./bag";
import {
  clearRows,
  createEmptyBoard,
  dropRow,
  fullRows,
  isValid,
  lockPiece,
} from "./board";
import { computeClearPoints, detectTSpin } from "./scoring";

export interface ModeConfig {
  mode: GameMode;
  lineGoal?: number; // sprint
  timeLimitMs?: number; // ultra
  levelCap?: number; // marathon
  gravityScale?: number; // multiplies the fall interval (<1 = faster); default 1
  gravityMinMs?: number; // fastest fall interval for this mode; default GRAVITY_MIN_MS
}

const NEXT_QUEUE_SIZE = 5;

export class TetrisEngine {
  private board: BoardCell[][] = createEmptyBoard();
  private bag: Bag;
  private active: ActivePiece | null = null;
  private hold: PieceType | null = null;
  private canHold = true;
  private status: GameStatus = "idle";
  private mode: GameMode;
  private config: ModeConfig;

  private elapsedMs = 0;
  private gravityAcc = 0;
  private lockAcc = 0;
  private lockResets = 0;
  private grounded = false;
  private rotatedLast = false;
  private clearingRows: number[] | null = null;
  private clearAcc = 0;

  // Per-run feat counters (for achievements / summary).
  private tetrises = 0;
  private tSpins = 0;
  private maxCombo = 0;
  private goalReached = false;

  private score: ScoreState = {
    score: 0,
    level: 1,
    lines: 0,
    combo: -1,
    backToBack: false,
    piecesPlaced: 0,
  };
  private lastClear: ClearEvent | null = null;
  private seed: number;

  constructor(config: ModeConfig, seed: number) {
    this.config = config;
    this.mode = config.mode;
    this.seed = seed;
    this.bag = new Bag(seed);
  }

  start() {
    this.board = createEmptyBoard();
    this.bag = new Bag(this.seed);
    this.hold = null;
    this.canHold = true;
    this.elapsedMs = 0;
    this.gravityAcc = 0;
    this.lockAcc = 0;
    this.lockResets = 0;
    this.grounded = false;
    this.rotatedLast = false;
    this.score = {
      score: 0,
      level: 1,
      lines: 0,
      combo: -1,
      backToBack: false,
      piecesPlaced: 0,
    };
    this.lastClear = null;
    this.clearingRows = null;
    this.clearAcc = 0;
    this.tetrises = 0;
    this.tSpins = 0;
    this.maxCombo = 0;
    this.goalReached = false;
    this.status = "playing";
    this.spawn();
  }

  pause() {
    if (this.status === "playing") this.status = "paused";
  }
  resume() {
    if (this.status === "paused") this.status = "playing";
  }

  // Fractional level: grows with every cleared line (not just every 10) so the
  // difficulty curves climb bit by bit. Clamped to the mode's level cap
  // (Marathon plateaus at 15; Sprint/Ultra keep climbing).
  private fracLevel(): number {
    const cap = this.config.levelCap ?? Infinity;
    return Math.min(cap + 0.999, 1 + this.score.lines / LINES_PER_LEVEL);
  }

  // Lock delay tapers with level so it never dwarfs the fall itself.
  private lockDelayMs(): number {
    const taper = LOCK_DELAY_MS - (this.fracLevel() - 1) * LOCK_DELAY_STEP_MS;
    return Math.max(LOCK_DELAY_MIN_MS, taper);
  }

  private gravityIntervalMs(): number {
    // Smooth, line-by-line ramp, floored so it never becomes literally instant.
    const fracLevel = this.fracLevel();
    const decay = Math.max(0.05, 0.8 - (fracLevel - 1) * 0.007);
    const seconds = Math.pow(decay, fracLevel - 1);
    const interval = seconds * 1000 * (this.config.gravityScale ?? 1);
    return Math.max(this.config.gravityMinMs ?? GRAVITY_MIN_MS, interval);
  }

  private spawn(fromHold = false) {
    const type = fromHold ? this.hold! : this.bag.next();
    const piece: ActivePiece = {
      type,
      rotation: 0,
      row: SPAWN_ROW,
      col: SPAWN_COL,
    };
    if (!isValid(this.board, piece.type, piece.rotation, piece.row, piece.col)) {
      // top out
      this.active = null;
      this.status = "over";
      return;
    }
    this.active = piece;
    this.grounded = false;
    this.lockAcc = 0;
    this.lockResets = 0;
    this.rotatedLast = false;
    if (!fromHold) this.canHold = true;
  }

  // Main time step.
  tick(dtMs: number) {
    if (this.status !== "playing") return;
    this.elapsedMs += dtMs;

    // Mode end conditions.
    if (this.config.timeLimitMs && this.elapsedMs >= this.config.timeLimitMs) {
      this.goalReached = true; // survived the full Ultra duration
      this.status = "over";
      return;
    }

    // Clearing phase: rows flash for CLEAR_DELAY_MS before being removed.
    if (this.clearingRows !== null) {
      this.clearAcc += dtMs;
      if (this.clearAcc >= CLEAR_DELAY_MS) {
        this.board = clearRows(this.board, this.clearingRows);
        this.clearingRows = null;
        this.clearAcc = 0;
        this.spawn();
      }
      return;
    }

    if (!this.active) return;

    const canFall = isValid(
      this.board,
      this.active.type,
      this.active.rotation,
      this.active.row + 1,
      this.active.col
    );

    if (canFall) {
      this.grounded = false;
      this.gravityAcc += dtMs;
      const interval = this.gravityIntervalMs();
      while (this.gravityAcc >= interval) {
        this.gravityAcc -= interval;
        if (
          isValid(
            this.board,
            this.active.type,
            this.active.rotation,
            this.active.row + 1,
            this.active.col
          )
        ) {
          this.active.row += 1;
          this.rotatedLast = false;
        } else {
          break;
        }
      }
    } else {
      // grounded: run lock delay
      this.grounded = true;
      this.lockAcc += dtMs;
      if (this.lockAcc >= this.lockDelayMs()) {
        this.lockActive();
      }
    }
  }

  move(dir: -1 | 1) {
    if (this.status !== "playing" || !this.active) return;
    if (isValid(this.board, this.active.type, this.active.rotation, this.active.row, this.active.col + dir)) {
      this.active.col += dir;
      this.rotatedLast = false;
      this.resetLockOnMove();
    }
  }

  softDrop() {
    if (this.status !== "playing" || !this.active) return;
    if (isValid(this.board, this.active.type, this.active.rotation, this.active.row + 1, this.active.col)) {
      this.active.row += 1;
      // No score for soft drop — moving the piece shouldn't change the score.
      this.rotatedLast = false;
      this.gravityAcc = 0;
    }
  }

  hardDrop() {
    if (this.status !== "playing" || !this.active) return;
    const landing = dropRow(
      this.board,
      this.active.type,
      this.active.rotation,
      this.active.row,
      this.active.col
    );
    const dist = landing - this.active.row;
    this.active.row = landing;
    this.score.score += dist * HARD_DROP_POINT;
    this.rotatedLast = false;
    this.lockActive();
  }

  rotate(dir: 1 | -1) {
    if (this.status !== "playing" || !this.active) return;
    const from = this.active.rotation;
    const to = (((from + dir) % 4) + 4) % 4 as RotationState;
    const table = this.active.type === "I" ? KICKS_I : KICKS_JLSTZ;
    if (this.active.type === "O") {
      this.active.rotation = to;
      return;
    }
    const kicks = table[kickKey(from, to)];
    for (const [dx, dyUp] of kicks) {
      const nCol = this.active.col + dx;
      const nRow = this.active.row - dyUp; // dyUp positive = up = row decreases
      if (isValid(this.board, this.active.type, to, nRow, nCol)) {
        this.active.rotation = to;
        this.active.col = nCol;
        this.active.row = nRow;
        this.rotatedLast = true;
        this.resetLockOnMove();
        return;
      }
    }
  }

  holdPiece() {
    if (this.status !== "playing" || !this.active || !this.canHold) return;
    const cur = this.active.type;
    if (this.hold === null) {
      this.hold = cur;
      this.spawn(false);
    } else {
      const swap = this.hold;
      this.hold = cur;
      this.active = { type: swap, rotation: 0, row: SPAWN_ROW, col: SPAWN_COL };
      this.grounded = false;
      this.lockAcc = 0;
      this.lockResets = 0;
    }
    this.canHold = false;
  }

  private resetLockOnMove() {
    if (this.grounded && this.lockResets < MAX_LOCK_RESETS) {
      this.lockAcc = 0;
      this.lockResets += 1;
    }
  }

  private lockActive() {
    if (!this.active) return;
    const tSpin = detectTSpin(this.board, this.active, this.rotatedLast);
    this.board = lockPiece(this.board, this.active);
    this.score.piecesPlaced += 1;

    const rows = fullRows(this.board);
    const lineCount = rows.length;

    if (lineCount > 0) {
      this.score.combo += 1;
      this.maxCombo = Math.max(this.maxCombo, this.score.combo + 1); // chain length
    } else {
      this.score.combo = -1;
    }
    const combo = Math.max(0, this.score.combo);

    if (lineCount === 4) this.tetrises += 1;
    if (tSpin !== "none") this.tSpins += 1;

    const { points, isDifficult } = computeClearPoints(
      lineCount,
      tSpin,
      this.score.level,
      combo,
      this.score.backToBack
    );

    if (lineCount > 0 || tSpin !== "none") {
      this.score.backToBack = isDifficult ? true : lineCount > 0 ? false : this.score.backToBack;
    }

    this.score.score += points;

    if (lineCount > 0) {
      const prevLines = this.score.lines;
      this.score.lines += lineCount;
      const cap = this.config.levelCap ?? Infinity;
      this.score.level = Math.min(
        cap,
        1 + Math.floor(this.score.lines / LINES_PER_LEVEL)
      );
      this.lastClear = {
        rows,
        count: lineCount,
        tSpin,
        backToBack: this.score.backToBack,
        combo,
        points,
      };
      // Sprint goal: skip animation on win
      if (this.config.lineGoal && prevLines < this.config.lineGoal && this.score.lines >= this.config.lineGoal) {
        this.board = clearRows(this.board, rows);
        this.goalReached = true;
        this.status = "over";
        this.active = null;
        return;
      }
      // Start clearing phase — rows flash before being removed
      this.clearingRows = rows;
      this.clearAcc = 0;
      this.active = null;
    } else {
      this.lastClear = null;
      this.spawn();
    }
  }

  // Build an immutable-ish snapshot for the UI layer.
  snapshot(): GameSnapshot {
    const ghostRow =
      this.active != null
        ? dropRow(this.board, this.active.type, this.active.rotation, this.active.row, this.active.col)
        : null;
    return {
      board: this.board.map((r) => r.slice()),
      active: this.active ? { ...this.active } : null,
      ghostRow,
      hold: this.hold,
      canHold: this.canHold,
      queue: this.bag.peek(NEXT_QUEUE_SIZE),
      status: this.status,
      mode: this.mode,
      elapsedMs: this.elapsedMs,
      scoreState: { ...this.score },
      lastClear: this.lastClear,
      clearingRows: this.clearingRows ? [...this.clearingRows] : null,
    };
  }

  getStatus() {
    return this.status;
  }

  // End-of-run summary for stats + achievement evaluation.
  summary(): GameSummary {
    return {
      mode: this.mode,
      score: this.score.score,
      lines: this.score.lines,
      maxLevel: this.score.level,
      timeMs: this.elapsedMs,
      tetrises: this.tetrises,
      tSpins: this.tSpins,
      maxCombo: this.maxCombo,
      finishedGoal: this.goalReached,
    };
  }
}

export const MODE_CONFIGS: Record<GameMode, ModeConfig> = {
  // Gravity scaled so level 1 starts at ~112ms/row (2.5x slower than ultra).
  // The floor scales by the same factor, so the level ramp keeps its shape.
  marathon: { mode: "marathon", levelCap: 15, gravityScale: 0.1125, gravityMinMs: 10 },
  sprint: { mode: "sprint", lineGoal: 40, gravityScale: 0.1125, gravityMinMs: 10 },
  ultra: { mode: "ultra", timeLimitMs: 120_000, gravityScale: 0.04, gravityMinMs: 45 }, // very fast falls from the start
  daily: { mode: "daily" },
};
