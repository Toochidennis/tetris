# BlockFall — Mobile-First HTML5 Tetris (React + TypeScript)

A polished, mobile-first Tetris built with a **framework-agnostic TypeScript engine** and a thin React UI layer. This is a **working foundation** — playable end to end — structured so Claude Code can extend it into the full spec without rework.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production build
```

Open in a mobile viewport (DevTools device toolbar, 375×812) for the intended experience.

## Controls

**Touch (on the board):** swipe ◀ ▶ to move · swipe down = soft drop · fast flick down = hard drop · tap = rotate · swipe up = hold. On-screen buttons are also provided.
**Keyboard:** ← → move · ↓ soft drop · Space hard drop · ↑/X rotate CW · Z rotate CCW · C hold · Esc-style pause via the button.

## Architecture (read before editing)

- **`src/engine/`** — pure TypeScript, **zero React imports**. All game rules live here and are unit-testable in isolation. The engine is **seed-driven and deterministic** (mulberry32 PRNG) — same seed produces the same piece sequence, which powers daily challenges, replays, and future server-side verification.
- **`src/state/`** — Zustand stores. `gameStore` runs the rAF tick loop and exposes engine snapshots; `metaStore` holds profile/settings/navigation (persisted to localStorage).
- **`src/state/services/`** — **data behind interfaces.** `LeaderboardService` and `ProfileService` are interfaces; `MockLeaderboardService` (fake data + simulated realtime) and `LocalProfileService` (localStorage) are the live implementations. **To go to a real backend, write one class implementing the interface and change the two lines in `src/state/services/index.ts` — no UI changes.**
- **`src/components/`** — the board renders as a **CSS grid of divs** (not canvas), with memoized cells. HUD, screens, and previews live here.
- **`src/theme/` + `src/index.css`** — all colors are **CSS variables** under `[data-theme="..."]`. Three themes ship: `neon-dark` (default), `classic`, `minimal-light`. Components never use raw hex.
- **`src/i18n/`** — react-i18next. **English + Arabic (RTL)** ship to prove the pipeline and RTL mirroring; the other 19 languages are registered in `SUPPORTED_LANGS` and need locale JSON files with the same keys.

## What's IMPLEMENTED ✅

- Full engine: 7 tetrominoes, **SRS rotation + wall kicks** (JLSTZ + I tables), **7-bag** randomizer, gravity with frame-rate-independent accumulator, **lock delay** (500ms, 15-reset cap), **hold**, **ghost piece**, soft/hard drop.
- Scoring: line points × level, **T-spin detection** (3-corner) + bonuses, **back-to-back**, **combo** counter, level progression every 10 lines.
- Modes wired: **Marathon** (cap L15), **Sprint** (40 lines), **Ultra** (120s), **Daily** (date-seeded). Marathon is fully playable; Sprint/Ultra end conditions are in the engine.
- Screens: Splash → Onboarding (username + country, saved to localStorage) → Menu → Mode Select → Game (board + HUD + on-screen controls + pause + game-over with stats) → Leaderboard → Settings.
- **Leaderboard**: mock data (80 entries/mode), simulated realtime new entries every 30–60s, mode tabs, country flags, your row highlighted + pinned if outside the top 20, score submission from the results screen.
- **i18n + RTL**: language switch, direction flip for Arabic, locale-aware number formatting.
- **Theming**: 3 switchable themes via CSS variables.
- Mobile: touch gestures, on-screen buttons, handedness toggle, portrait layout, `touch-action: none` on the play area.
- Framer Motion screen transitions + modal springs, with a reduced-motion setting.

## What's LEFT for Claude Code (next phases) 🔧

Hand this repo + the original build brief to Claude Code and work these in order:

1. **Remaining 19 locales** — add `src/i18n/locales/<code>.json` for each `SUPPORTED_LANG` (same keys as `en.json`), register them in `src/i18n/index.ts`, and complete RTL files for `he`, `fa`, `ur`.
2. **Audio** — build `AudioManager` (SFX: move/rotate/lock/clear/tetris/level-up/game-over + music) wired to the volume settings. (No assets bundled — source royalty-free files.)
3. **Line-clear & effect animations** — flash + collapse on clear, tetris light-sweep + particles, hard-drop trail/shake, combo/B2B/T-spin pop-ups, level-up flourish (timings are specified in the brief).
4. **Profile screen** — stats, last-10-games sparkline, daily streak, achievement badges grid (engine can emit events for unlocks).
5. **Achievements + streak system** — ~12 achievements, streak tracking on the profile/menu.
6. **PWA** — add `vite-plugin-pwa`, manifest, icons, offline support.
7. **Engine unit tests** — formalize the smoke checks (SRS kicks, line clear, scoring, T-spin, bag distribution) with Vitest.
8. **DAS/ARR tuning UI** + colorblind patterns + text-size accessibility options.
9. **Real backend** (optional) — implement `SupabaseLeaderboardService` against the existing interface.

## Key files map

| Concern | File |
|---|---|
| Game rules orchestrator | `src/engine/engine.ts` |
| Piece shapes + SRS kicks | `src/engine/constants.ts` |
| Seeded RNG | `src/engine/rng.ts` |
| 7-bag | `src/engine/bag.ts` |
| Board/collision/clear | `src/engine/board.ts` |
| Scoring + T-spin | `src/engine/scoring.ts` |
| Loop + game state | `src/state/gameStore.ts` |
| Profile/settings/nav | `src/state/metaStore.ts` |
| Swap backend here | `src/state/services/index.ts` |
| Board rendering | `src/components/Board.tsx` |
| Themes/tokens | `src/index.css` |
