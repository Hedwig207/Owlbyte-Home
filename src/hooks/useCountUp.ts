import { useEffect, useRef, useState } from 'react';

/**
 * 数字滚动计数器：进入视口时从 0 滚动到目标值
 */
export function useCountUp(target: number, options?: { duration?: number; startOn?: boolean }) {
  const { duration = 1600, startOn = true } = options ?? {};
  const [value, setValue] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    if (!startOn || startedRef.current) return;
    startedRef.current = true;

    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // easeOutExpo
      const eased = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setValue(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration, startOn]);

  return value;
}
