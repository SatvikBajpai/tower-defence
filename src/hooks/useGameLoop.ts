import { useEffect, useRef, useCallback } from 'react';

export function useGameLoop(
  callback: (dt: number, time: number) => void,
  active: boolean = true,
) {
  const cbRef = useRef(callback);
  cbRef.current = callback;
  const lastTime = useRef(0);
  const rafId = useRef(0);

  const loop = useCallback((time: number) => {
    if (lastTime.current === 0) lastTime.current = time;
    const dt = Math.min((time - lastTime.current) / 1000, 0.05);
    lastTime.current = time;
    cbRef.current(dt, time);
    rafId.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    if (!active) return;
    lastTime.current = 0;
    rafId.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafId.current);
  }, [active, loop]);
}
