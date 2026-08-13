import { getMoonPhase, type MoonPhase } from '@/lib/moonPhase';
import { cn } from '@/lib/utils';

interface Props {
  phase?: MoonPhase;
  className?: string;
  size?: number;
}

/**
 * SVG 月相图标：根据 phase 渲染月牙/半月/满月
 * 用 mask 实现阴影部分
 */
export default function MoonPhaseGlyph({ phase, className, size = 18 }: Props) {
  const moon = phase ?? getMoonPhase();
  // illumination 0..1 → 椭圆 rx（0..r）
  const r = 7;
  const cx = 8;
  const cy = 8;
  // 通过 illumination 计算阴影椭圆的水平半径
  // illumination=0 (新月) → 整个暗；illumination=1 (满月) → 整个亮
  const litWidth = moon.illumination * 2 * r;
  // 判断盈亏：phase < 4 = 渐盈（右侧亮）；> 4 = 渐亏（左侧亮）
  const isWaxing = moon.phase < 4;

  return (
    <span
      className={cn('inline-flex items-center justify-center', className)}
      title={`${moon.name} · 照亮 ${Math.round(moon.illumination * 100)}% · 月龄 ${moon.age} 天`}
      aria-label={moon.name}
    >
      <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <clipPath id={`moon-clip-${moon.phase}`}>
            <circle cx={cx} cy={cy} r={r} />
          </clipPath>
        </defs>
        {/* 月底（暗色圆） */}
        <circle cx={cx} cy={cy} r={r} fill="currentColor" className="text-ink-700" />
        {/* 月光（亮色椭圆） */}
        <g clipPath={`url(#moon-clip-${moon.phase})`}>
          {moon.illumination > 0 && (
            <ellipse
              cx={cx}
              cy={cy}
              rx={litWidth / 2}
              ry={r}
              fill="currentColor"
              className="text-moon"
              // 渐亏月：把亮椭圆偏移到左侧
              transform={isWaxing ? undefined : `translate(${cx - litWidth / 2 - cx + (2 * r - litWidth) / 2}, 0)`}
            />
          )}
        </g>
        {/* 边框 */}
        <circle cx={cx} cy={cy} r={r} stroke="currentColor" strokeWidth="0.5" className="text-parchment/30" fill="none" />
      </svg>
    </span>
  );
}
