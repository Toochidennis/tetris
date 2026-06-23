import { useEffect } from "react";
import { useGameStore } from "../state/gameStore";

// Desktop fallback controls.
export function useKeyboard(enabled: boolean) {
  const s = useGameStore();
  useEffect(() => {
    if (!enabled) return;
    const down = (e: KeyboardEvent) => {
      switch (e.code) {
        case "ArrowLeft": s.move(-1); break;
        case "ArrowRight": s.move(1); break;
        case "ArrowDown": s.softDrop(); break;
        case "Space": e.preventDefault(); s.hardDrop(); break;
        case "ArrowUp":
        case "KeyX": s.rotate(1); break;
        case "KeyZ": s.rotate(-1); break;
        case "KeyC": s.hold(); break;
      }
    };
    window.addEventListener("keydown", down);
    return () => window.removeEventListener("keydown", down);
  }, [enabled, s]);
}
