import { useReveal } from '@/hooks/useReveal';
import { Rocket, Package, Sparkles, Shield, Github, Download, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';

const FEATURES = [
  {
    icon: Rocket,
    title: '一键安装',
    desc: '运行 install.bat，自动编译 + 写入 PATH，无需手动配置。',
  },
  {
    icon: Package,
    title: '主流语言全覆盖',
    desc: '编译器 + pip 高速下载：Go、Rust、Python、Node.js、Zig、NASM、LDC、DMD 等。',
  },
  {
    icon: Sparkles,
    title: '清华镜像加速',
    desc: '默认使用清华大学 TUNA 开源镜像站，国内下载极速。',
  },
  {
    icon: Shield,
    title: '轻量 · 纯 C + TCC',
    desc: '由 Tiny C Compiler 编写，可移植性高，编译产物极简。',
  },
];

const CODE_BLOCKS = [
  {
    label: '安装工具链',
    cmd: 'opencdk apt install go',
    output: '✓ 从清华镜像下载 go-1.22.5-windows-amd64.msi\n✓ 解压至工具链目录\n✓ 写入环境变量 PATH\n✓ 验证: go version → go1.22.5\n✓ Go 工具链就绪，开干吧！',
  },
  {
    label: 'Pip 加速下载',
    cmd: 'opencdk pip install pandas',
    output: '✓ 注入清华 PyPI 镜像 (-i https://pypi.tuna.tsinghua.edu.cn/simple)\n✓ 下载 pandas 2.2.2\n✓ 下载 numpy python-dateutil pytz tzdata six\n✓ 全部安装完成，耗时 1.8s',
  },
  {
    label: '初始化项目',
    cmd: 'opencdk init rust',
    output: '✓ 创建 Cargo.toml\n✓ 创建 src/main.rs (fn main() { println!("night-shift ✨"); })\n✓ 创建 .gitignore (target/)\n✓ 下一步: cd demo && cargo run',
  },
  {
    label: '环境诊断',
    cmd: 'opencdk doctor',
    output: '✓ 系统: Windows 11 x64 23H2\n✓ TCC: 已安装 (v0.9.27)\n✓ 可用工具链: go, rust, nasm, node, zig\n✓ 清华镜像延迟: 19ms (正常)\n✓ 建议: 安装 set.bat 将 opencdk 加入 PATH',
  },
];

export default function OpenCDKSpotlight() {
  const { ref, visible } = useReveal<HTMLDivElement>({ threshold: 0.1 });

  return (
    <section id="opencdk" className="relative py-32 md:py-40">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/2 top-1/3 h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-amber/5 blur-[120px]" />
        <div className="absolute right-10 top-40 h-[300px] w-[300px] rounded-full bg-moon/5 blur-[100px]" />
      </div>

      <div ref={ref} className="container relative">
        <div
          className={cn(
            'mx-auto max-w-3xl text-center transition-all duration-1000',
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          )}
        >
          <p className="mono-label text-amber/70">§ 03.5 — Spotlight</p>
          <h2 className="mt-3 display-serif text-4xl font-light leading-tight text-parchment md:text-6xl">
            OpenCDK — <span className="italic text-gradient-amber">开源轻量化编程语言下载器</span>
          </h2>
          <p className="mt-6 text-lg leading-relaxed text-parchment/70">
            Open Code Development Kit · 一键下载、安装、配置主流编程语言工具链的命令行工具。
            默认使用清华大学 TUNA 开源镜像站，国内下载速度快，开箱即用。
          </p>
          <p className="mt-4 mono-label text-parchment/50">
            本项目由 <span className="text-amber/70">Tiny C Compiler</span> 编写，可移植、可扩展，善用勿恶。
          </p>
        </div>

        <div
          className={cn(
            'mt-16 grid gap-4 transition-all duration-1000 md:grid-cols-2 lg:grid-cols-4',
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          )}
          style={{ transitionDelay: '150ms' }}
        >
          {FEATURES.map((f, i) => (
            <div
              key={f.title}
              className={cn(
                'group relative overflow-hidden rounded-2xl border border-parchment/10 bg-ink-800/40 p-6 transition-all duration-700 hover:-translate-y-1 hover:border-amber/30'
              )}
              style={{ transitionDelay: `${i * 100}ms` }}
            >
              <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 bg-radial-amber" />
              <div className="relative">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-amber/10 text-amber">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 display-serif text-xl font-light text-parchment">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-parchment/60">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div
          className={cn(
            'mt-14 grid gap-6 transition-all duration-1000 lg:grid-cols-[1fr_320px]',
            visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          )}
          style={{ transitionDelay: '300ms' }}
        >
          <CodeTabs />

          <div className="flex flex-col gap-4">
            <a
              href="https://github.com/Hedwig207/OpenCDK"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-amber/30 bg-gradient-to-br from-amber/10 via-amber/[0.04] to-transparent p-6 transition-all duration-500 hover:-translate-y-0.5 hover:border-amber/60 hover:shadow-glow-amber"
            >
              <div>
                <p className="mono-label text-amber/80">REPOSITORY</p>
                <h3 className="mt-2 display-serif text-2xl font-light text-parchment">GitHub · 源代码</h3>
                <p className="mt-1 text-sm text-parchment/60">C / Batch / Makefile · ⭐ 6</p>
              </div>
              <Github className="h-6 w-6 text-amber transition-transform duration-300 group-hover:rotate-6" />
            </a>

            <a
              href="https://github.com/Hedwig207/OpenCDK"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative flex items-center justify-between overflow-hidden rounded-2xl border border-parchment/10 bg-ink-800/60 p-6 transition-all duration-500 hover:-translate-y-0.5 hover:border-moon/40"
            >
              <div>
                <p className="mono-label text-moon/80">DOWNLOAD</p>
                <h3 className="mt-2 display-serif text-2xl font-light text-parchment">克隆仓库</h3>
                <p className="mt-1 text-sm text-parchment/60">git clone · Windows（推荐 11）</p>
              </div>
              <Download className="h-5 w-5 text-moon transition-transform duration-300 group-hover:translate-y-0.5" />
            </a>

            <div className="rounded-2xl border border-parchment/10 bg-ink-900/60 p-6">
              <p className="mono-label text-slate-mist">QUICK START</p>
              <ol className="mt-4 space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="font-mono text-[0.65rem] leading-5 text-amber/70">01</span>
                  <span className="text-parchment/80">
                    克隆仓库后，双击 <code className="font-mono text-xs text-amber bg-amber/10 px-1.5 py-0.5 rounded">build.bat</code> 编译
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-mono text-[0.65rem] leading-5 text-amber/70">02</span>
                  <span className="text-parchment/80">
                    运行 <code className="font-mono text-xs text-amber bg-amber/10 px-1.5 py-0.5 rounded">set.bat</code> 加入 PATH
                  </span>
                </li>
                <li className="flex gap-3">
                  <span className="font-mono text-[0.65rem] leading-5 text-amber/70">03</span>
                  <span className="text-parchment/80">
                    <code className="font-mono text-xs text-amber bg-amber/10 px-1.5 py-0.5 rounded">opencdk apt install go</code> 开始使用
                  </span>
                </li>
              </ol>
              <div className="mt-5 rounded-xl border border-amber/20 bg-amber/5 px-3 py-2">
                <p className="mono-label text-[0.6rem] text-amber/70">REQUIRED</p>
                <p className="mt-1 font-mono text-[0.7rem] leading-relaxed text-parchment/70">
                  Windows 11 · Tiny C Compiler · curl + tar（系统自带）
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 flex items-center justify-center gap-3 text-slate-fog/40">
          <span className="h-px w-16 bg-gradient-to-r from-transparent to-parchment/20" />
          <Terminal className="h-4 w-4" />
          <span className="font-mono text-[0.65rem] uppercase tracking-[0.2em]">night-shift · opencdk-tcc</span>
          <Terminal className="h-4 w-4" />
          <span className="h-px w-16 bg-gradient-to-l from-transparent to-parchment/20" />
        </div>
      </div>
    </section>
  );
}

import { useState, useEffect } from 'react';

function CodeTabs() {
  const { ref, visible } = useReveal<HTMLDivElement>({ threshold: 0.1 });
  const [active, setActive] = useCodeTabState(0);
  const current = CODE_BLOCKS[active];

  return (
    <div
      ref={ref}
      className={cn(
        'relative overflow-hidden rounded-2xl border border-parchment/10 bg-ink-900/80 transition-all duration-500',
        visible ? 'opacity-100' : 'opacity-0'
      )}
    >
      <div className="flex items-center justify-between border-b border-parchment/10 bg-ink-950/50 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        </div>
        <div className="flex gap-1">
          {CODE_BLOCKS.map((c, i) => (
            <button
              key={c.label}
              onClick={() => setActive(i)}
              className={cn(
                'rounded-lg px-3 py-1 font-mono text-[0.65rem] uppercase tracking-wide transition-all duration-300',
                active === i
                  ? 'bg-amber/15 text-amber border border-amber/30'
                  : 'text-parchment/40 hover:text-parchment/70 hover:bg-parchment/5 border border-transparent'
              )}
            >
              $ {c.label}
            </button>
          ))}
        </div>
        <div className="font-mono text-[0.6rem] text-slate-fog/40">~/.opencdk</div>
      </div>

      <div key={active} className="p-5 md:p-7 animate-fade-in">
        <div className="flex items-start gap-2">
          <span className="font-mono text-xs text-amber">$</span>
          <code className="font-mono text-sm text-parchment">{current.cmd}</code>
        </div>
        <pre className="mt-4 font-mono text-xs leading-relaxed text-slate-mist/70 whitespace-pre-wrap">
{current.output}
        </pre>
      </div>

      <div className="flex items-center justify-between border-t border-parchment/10 bg-ink-950/50 px-4 py-2">
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="font-mono text-[0.6rem] text-slate-fog/50">清华 TUNA 镜像 · 在线</span>
        </div>
        <span className="font-mono text-[0.6rem] text-slate-fog/40">opencdk · tcc-build</span>
      </div>
    </div>
  );
}

function useCodeTabState(initial: number) {
  const [active, setActive] = useState(initial);
  useEffect(() => {
    const t = setInterval(() => {
      setActive((x) => (x + 1) % CODE_BLOCKS.length);
    }, 4500);
    return () => clearInterval(t);
  }, []);
  return [active, setActive] as const;
}
