import type { PieceType } from "./types";
import { ALL_PIECES } from "./constants";
import { Rng } from "./rng";

// 7-bag randomizer driven by a seeded RNG.
export class Bag {
  private rng: Rng;
  private current: PieceType[] = [];

  constructor(seed: number) {
    this.rng = new Rng(seed);
  }

  private refill() {
    this.current = this.rng.shuffle([...ALL_PIECES]);
  }

  next(): PieceType {
    if (this.current.length === 0) this.refill();
    return this.current.shift()!;
  }

  // Peek the next n pieces without consuming the real stream order.
  peek(n: number): PieceType[] {
    while (this.current.length < n) {
      this.current.push(...this.rng.shuffle([...ALL_PIECES]));
    }
    return this.current.slice(0, n);
  }
}
