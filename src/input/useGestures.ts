import { useEffect, useRef } from "react";
import { useGameStore } from "../state/gameStore";

const SWIPE_THRESHOLD = 24; // px to register a directional move
const TAP_MAX_MOVE = 10;
const TAP_MAX_TIME = 250;
const HARD_DROP_VELOCITY = 1.1; // px/ms downward = hard drop

// Touch gestures on the play area:
//  - horizontal drag: move left/right per threshold step
//  - slow downward drag: soft drop
//  - fast downward flick: hard drop
//  - tap: rotate CW
//  - swipe up: hold
export function useGestures(ref: React.RefObject<HTMLElement>, enabled: boolean) {
  const s = useGameStore();
  const state = useRef({ x: 0, y: 0, t: 0, lastX: 0, lastY: 0, moved: false });

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    const onStart = (e: TouchEvent) => {
      const tch = e.touches[0];
      state.current = { x: tch.clientX, y: tch.clientY, t: performance.now(), lastX: tch.clientX, lastY: tch.clientY, moved: false };
    };

    const onMove = (e: TouchEvent) => {
      e.preventDefault();
      const tch = e.touches[0];
      const dx = tch.clientX - state.current.lastX;
      const dy = tch.clientY - state.current.lastY;

      if (Math.abs(dx) >= SWIPE_THRESHOLD && Math.abs(dx) > Math.abs(dy)) {
        s.move(dx > 0 ? 1 : -1);
        state.current.lastX = tch.clientX;
        state.current.moved = true;
      } else if (dy >= SWIPE_THRESHOLD && Math.abs(dy) > Math.abs(dx)) {
        s.softDrop();
        state.current.lastY = tch.clientY;
        state.current.moved = true;
      }
    };

    const onEnd = (e: TouchEvent) => {
      const tch = e.changedTouches[0];
      const dt = performance.now() - state.current.t;
      const totalDx = tch.clientX - state.current.x;
      const totalDy = tch.clientY - state.current.y;
      const dist = Math.hypot(totalDx, totalDy);
      const vy = totalDy / Math.max(dt, 1);

      if (totalDy < -SWIPE_THRESHOLD && Math.abs(totalDy) > Math.abs(totalDx)) {
        s.hold();
        return;
      }
      if (vy > HARD_DROP_VELOCITY && totalDy > SWIPE_THRESHOLD * 2) {
        s.hardDrop();
        return;
      }
      if (!state.current.moved && dist < TAP_MAX_MOVE && dt < TAP_MAX_TIME) {
        s.rotate(1);
      }
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
    };
  }, [ref, enabled, s]);
}
