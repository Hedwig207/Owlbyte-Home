/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: "1.5rem",
        lg: "2rem",
        xl: "3rem",
      },
    },
    extend: {
      colors: {
        // 夜行精密工坊调色板
        ink: {
          950: "#06080F",
          900: "#0A0E1A",
          800: "#121829",
          700: "#1B2236",
          600: "#262E45",
          500: "#36405C",
        },
        amber: {
          // 猫头鹰之眼 — 琥珀金
          DEFAULT: "#E8B65A",
          50: "#FBF1D9",
          100: "#F6E2B0",
          200: "#F0D084",
          300: "#ECBE63",
          400: "#E8B65A",
          500: "#D9A23F",
          600: "#B07D2C",
          700: "#83591F",
        },
        moon: {
          // 月光青
          DEFAULT: "#5FB8A8",
          50: "#D6F0EA",
          100: "#A9DBD0",
          200: "#7CC9B9",
          300: "#5FB8A8",
          400: "#4A9C8E",
          500: "#3A7E72",
        },
        parchment: {
          // 羊皮纸白
          DEFAULT: "#F4EAD5",
          50: "#FBF6EC",
          100: "#F4EAD5",
          200: "#E0D4B6",
          300: "#C2B58F",
        },
        slate: {
          // 次级文本
          mist: "#9AA3B8",
          fog: "#6B7488",
        },
      },
      fontFamily: {
        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],
        sans: ['Manrope', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      letterSpacing: {
        tightest: '-0.04em',
        tighter: '-0.03em',
        tight: '-0.015em',
        widewide: '0.15em',
        widestest: '0.3em',
      },
      fontSize: {
        '10xl': ['10rem', { lineHeight: '0.9', letterSpacing: '-0.04em' }],
        '11xl': ['14rem', { lineHeight: '0.85', letterSpacing: '-0.045em' }],
      },
      backgroundImage: {
        'radial-moon': 'radial-gradient(circle at 75% 25%, rgba(95,184,168,0.12), transparent 50%)',
        'radial-amber': 'radial-gradient(circle at 20% 80%, rgba(232,182,90,0.10), transparent 45%)',
        'noise': "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0.95 0 0 0 0 0.92 0 0 0 0 0.84 0 0 0 0.4 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        'scanline': "repeating-linear-gradient(0deg, rgba(244,234,213,0.025) 0px, rgba(244,234,213,0.025) 1px, transparent 1px, transparent 3px)",
      },
      boxShadow: {
        'glow-amber': '0 0 32px -4px rgba(232,182,90,0.45), 0 0 8px -2px rgba(232,182,90,0.35)',
        'glow-moon': '0 0 32px -4px rgba(95,184,168,0.35)',
        'inner-amber': 'inset 0 1px 0 0 rgba(255,255,255,0.25), inset 0 -2px 0 0 rgba(176,125,44,0.5)',
        'card': '0 1px 0 0 rgba(244,234,213,0.05) inset, 0 24px 48px -12px rgba(0,0,0,0.6)',
      },
      animation: {
        'fade-up': 'fadeUp 0.9s cubic-bezier(0.22, 1, 0.36, 1) both',
        'fade-in': 'fadeIn 1.2s ease both',
        'char-rise': 'charRise 0.7s cubic-bezier(0.22, 1, 0.36, 1) both',
        'blink': 'blink 4s ease-in-out infinite',
        'pulse-ring': 'pulseRing 2.4s ease-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'drift': 'drift 18s linear infinite',
        'shimmer': 'shimmer 3s linear infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(28px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        charRise: {
          '0%': { opacity: '0', transform: 'translateY(0.4em) rotateX(-40deg)' },
          '100%': { opacity: '1', transform: 'translateY(0) rotateX(0)' },
        },
        blink: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.35' },
        },
        pulseRing: {
          '0%': { transform: 'scale(0.8)', opacity: '0.7' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        drift: {
          '0%': { transform: 'translate3d(0,0,0)' },
          '100%': { transform: 'translate3d(-200px,0,0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
    },
  },
  plugins: [],
};
