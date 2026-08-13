import { useEffect, useState } from 'react';
import { NIGHT_HOURS } from '@/lib/consts';

/**
 * 判断当前是否处于夜班时段（22:00-06:00，跨午夜）
 * 每分钟轮询一次，跨过临界点会自动更新
 */
export function useNightMode() {
  const [isNight, setIsNight] = useState(false);
  const [currentHour, setCurrentHour] = useState(0);

  useEffect(() => {
    const check = () => {
      const h = new Date().getHours();
      setCurrentHour(h);
      // 22:00 及以后，或 06:00 之前
      setIsNight(h >= NIGHT_HOURS.start || h < NIGHT_HOURS.end);
    };
    check();
    const id = window.setInterval(check, 60 * 1000);
    return () => window.clearInterval(id);
  }, []);

  return { isNight, currentHour };
}
