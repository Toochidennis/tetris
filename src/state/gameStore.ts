import { create } from "zustand";
import type { GameMode, GameSnapshot, GameSummary } from "../engine/types";
import { MODE_CONFIGS, TetrisEngine } from "../engine/engine";
import { hashSeed } from "../engine/rng";

interface GameStore {
  snapshot: GameSnapshot | null;
  engine: TetrisEngine | null;
  start: (mode: GameMode, seed?: number) => void;
  pause: () => void;
  resume: () => void;
  restart: () => void;
  getSummary: () => GameSummary | null;
  // input intents
  move: (dir: -1 | 1) => void;
  rotate: (dir: 1 | -1) => void;
  softDrop: () => void;
  hardDrop: () => void;
  hold: () => void;
  // internal
  _sync: () => void;
  _loopId: number | null;
  _last: number;
  _mode: GameMode | null;
  _seed: number;
}

function dailySeed(): number {
  const d = new Date();
  const key = `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
  return hashSeed(key);
}

export const useGameStore = create<GameStore>((set, get) => {
  function stopLoop() {
    const id = get()._loopId;
    if (id != null) cancelAnimationFrame(id);
    set({ _loopId: null });
  }

  function startLoop() {
    stopLoop();
    set({ _last: performance.now() });
    const step = (now: number) => {
      const { engine, _last } = get();
      const dt = Math.min(now - _last, 50); // clamp big gaps
      set({ _last: now });
      if (engine) {
        engine.tick(dt);
        get()._sync();
        if (engine.getStatus() === "over") {
          stopLoop();
          return;
        }
      }
      set({ _loopId: requestAnimationFrame(step) });
    };
    set({ _loopId: requestAnimationFrame(step) });
  }

  return {
    snapshot: null,
    engine: null,
    _loopId: null,
    _last: 0,
    _mode: null,
    _seed: 0,

    start: (mode, seed) => {
      const usedSeed = seed ?? (mode === "daily" ? dailySeed() : (Math.random() * 2 ** 31) | 0);
      const engine = new TetrisEngine(MODE_CONFIGS[mode], usedSeed);
      engine.start();
      set({ engine, _mode: mode, _seed: usedSeed, snapshot: engine.snapshot() });
      startLoop();
    },

    pause: () => {
      get().engine?.pause();
      stopLoop();
      get()._sync();
    },

    resume: () => {
      get().engine?.resume();
      startLoop();
      get()._sync();
    },

    restart: () => {
      const { _mode, _seed } = get();
      if (_mode) get().start(_mode, _mode === "daily" ? _seed : undefined);
    },

    getSummary: () => get().engine?.summary() ?? null,

    move: (dir) => {
      get().engine?.move(dir);
      get()._sync();
    },
    rotate: (dir) => {
      get().engine?.rotate(dir);
      get()._sync();
    },
    softDrop: () => {
      get().engine?.softDrop();
      get()._sync();
    },
    hardDrop: () => {
      get().engine?.hardDrop();
      get()._sync();
      if (get().engine?.getStatus() === "over") stopLoop();
    },
    hold: () => {
      get().engine?.holdPiece();
      get()._sync();
    },

    _sync: () => {
      const e = get().engine;
      if (e) set({ snapshot: e.snapshot() });
    },
  };
});
