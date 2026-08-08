# BlockFall

BlockFall is a mobile-first HTML5 falling-block puzzle game built with React, TypeScript, Vite, Zustand, Framer Motion, and CSS theming. It includes a standalone TypeScript game engine, multiple play modes, mobile gestures, profile/settings persistence, localization, and PWA assets.

## Live Demo

[Play BlockFall](https://blockfall.linkskool.com)

## Overview

This project separates the falling-block game rules from the React UI. The engine handles board state, pieces, scoring, rotation, gravity, and mode rules, while React renders screens, HUD, settings, onboarding, leaderboard UI, and mobile controls.

The app is designed for mobile portrait play first, with keyboard support for desktop testing and play.

## Features

- Mobile-first falling-block puzzle gameplay
- Pure TypeScript engine with no React dependency
- 7 tetrominoes, SRS rotation, wall kicks, hold, ghost piece, soft drop, and hard drop
- 7-bag randomizer with seeded RNG support
- Scoring with line clears, level progression, combo/back-to-back state, and T-spin handling
- Marathon, Sprint, Ultra, and Daily mode structure
- Touch gestures and on-screen controls
- Keyboard controls for desktop
- Profile and settings persistence with Zustand/localStorage
- Mock leaderboard service and local profile service behind service interfaces
- Theme system using CSS variables
- Internationalization with locale files and RTL support
- PWA manifest, icons, sitemap, robots file, and service worker entry

## Tech Stack

- React
- TypeScript
- Vite
- Zustand
- Framer Motion
- i18next / react-i18next
- Tailwind CSS / PostCSS
- vite-plugin-pwa
- CSS variables
- LocalStorage

## Screenshots

Screenshots are not currently committed to the repository.

Recommended additions:

```txt
docs/screenshots/menu.png
docs/screenshots/gameplay.png
docs/screenshots/settings.png
```

Then reference them here:

```md
![BlockFall menu screen](docs/screenshots/menu.png)
![BlockFall gameplay screen](docs/screenshots/gameplay.png)
![BlockFall settings screen](docs/screenshots/settings.png)
```

## Controls

### Touch

- Swipe left/right to move
- Swipe down for soft drop
- Fast flick down for hard drop
- Tap to rotate
- Swipe up to hold
- On-screen buttons are also available

### Keyboard

- Left/Right: move
- Down: soft drop
- Space: hard drop
- Up or `X`: rotate clockwise
- `Z`: rotate counter-clockwise
- `C`: hold

## Architecture

```txt
src/
  engine/                 # Pure TypeScript game rules and scoring
  state/                  # Zustand stores and persistence
  state/services/         # Leaderboard/profile service interfaces and implementations
  components/             # Board, HUD, previews, selectors, particles, screen components
  components/screens/     # Splash, onboarding, menu, mode select, gameplay, settings, leaderboard
  input/                  # Keyboard and gesture hooks
  i18n/                   # i18next setup and locale JSON files
  theme/                  # Theme tokens and CSS variables
  data/                   # Country/language catalog loading
  pwa.ts                  # Service worker registration
```

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Environment Variables

The app can run with local/mock services. If API-backed services are enabled, copy the example file:

```bash
cp .env.example .env.local
```

Available variables:

```txt
VITE_API_BASE_URL
VITE_API_KEY
VITE_ASSET_BASE_URL
```

Do not commit real API keys or production `.env` files.

## Available Scripts

```bash
npm run dev
```

Start the Vite development server.

```bash
npm run build
```

Type-check and create a production build.

```bash
npm run preview
```

Preview the production build locally.

```bash
npm run typecheck
```

Run TypeScript checks.

## Deployment

The live project is available at:

[https://blockfall.linkskool.com](https://blockfall.linkskool.com)

This is a static Vite app. Build with:

```bash
npm run build
```

Deploy the generated `dist/` folder to a static hosting provider.

## Future Improvements

- Add committed screenshots or a short gameplay GIF
- Add automated CI for build/typecheck
- Add unit tests around key engine rules if not already covered by the local test strategy
- Review production API configuration before public releases
- Add code splitting if bundle size becomes a concern
