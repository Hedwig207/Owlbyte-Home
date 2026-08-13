// 月相计算：基于已知新月时刻 + 朔望月周期
// 算法：John Conway 简化版，精度 ±1 天，装饰用途足够

export type MoonPhaseName =
  | '新月' | '蛾眉月' | '上弦月' | '盈凸月'
  | '满月' | '亏凸月' | '下弦月' | '残月';

export interface MoonPhase {
  /** 0..7，0=新月，4=满月 */
  phase: number;
  /** 月亮照亮比例 0..1 */
  illumination: number;
  /** 中文名 */
  name: MoonPhaseName;
  /** 月龄（天） */
  age: number;
}

const SYNODIC_MONTH = 29.530588671; // 朔望月平均周期（天）
const PHASE_NAMES: MoonPhaseName[] = [
  '新月', '蛾眉月', '上弦月', '盈凸月',
  '满月', '亏凸月', '下弦月', '残月',
];

// 已知参考新月：2000-01-06 18:14 UTC（J2000 历元附近的朔）
const REFERENCE_NEW_MOON_MS = Date.UTC(2000, 0, 6, 18, 14, 0);

/**
 * 计算指定日期的月相
 */
export function getMoonPhase(date: Date = new Date()): MoonPhase {
  const diffMs = date.getTime() - REFERENCE_NEW_MOON_MS;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const age = ((diffDays % SYNODIC_MONTH) + SYNODIC_MONTH) % SYNODIC_MONTH;

  // phase: 0..7（每段约 3.69 天）
  const phase = Math.floor((age / SYNODIC_MONTH) * 8) % 8;
  const illumination = (1 - Math.cos((age / SYNODIC_MONTH) * 2 * Math.PI)) / 2;

  return {
    phase,
    illumination: Math.round(illumination * 100) / 100,
    name: PHASE_NAMES[phase],
    age: Math.round(age * 10) / 10,
  };
}
