import { cn } from '@/lib/utils';

type LogoProps = {
  className?: string;
  showWordmark?: boolean;
  /** 闪烁动画 — 用于 hero 与页脚强调 */
  animate?: boolean;
};

/**
 * OwlByte 几何 Logo
 * 设计语言：双圆眼 + 棱面喙 + 字节方块
 * 不使用图片资源，全部 SVG 矢量绘制
 */
export default function OwlLogo({ className, showWordmark = true, animate = false }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <span className="relative inline-flex h-9 w-9 items-center justify-center">
        <svg
          viewBox="0 0 48 48"
          className="h-9 w-9"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          {/* 外圈 — 头部轮廓 */}
          <circle
            cx="24"
            cy="24"
            r="22"
            stroke="currentColor"
            strokeOpacity="0.35"
            strokeWidth="1"
            className="text-parchment"
          />
          {/* 双眼外圈 */}
          <circle cx="16.5" cy="20" r="6.5" className="fill-amber" />
          <circle cx="31.5" cy="20" r="6.5" className="fill-amber" />
          {/* 双眼瞳孔 */}
          <circle cx="17.5" cy="20.5" r="2.6" className="fill-ink-900" />
          <circle cx="30.5" cy="20.5" r="2.6" className="fill-ink-900" />
          {/* 瞳孔高光 */}
          <circle cx="18.4" cy="19.6" r="0.7" className="fill-parchment" />
          <circle cx="31.4" cy="19.6" r="0.7" className="fill-parchment" />
          {/* 喙 — 三角 */}
          <path d="M24 24 L21 28.5 L24 30 L27 28.5 Z" className="fill-moon" />
          {/* 字节方块装饰 */}
          <rect x="20" y="34" width="2" height="2" className="fill-moon" fillOpacity="0.8" />
          <rect x="24" y="34" width="2" height="2" className="fill-amber" />
          <rect x="28" y="34" width="2" height="2" className="fill-moon" fillOpacity="0.8" />
        </svg>
        {animate && (
          <span className="absolute inset-0 rounded-full ring-1 ring-amber/40 animate-pulse-ring" />
        )}
      </span>
      {showWordmark && (
        <span className="display-serif text-lg font-semibold tracking-tight text-parchment">
          Owl<span className="text-amber">Byte</span>
        </span>
      )}
    </div>
  );
}
