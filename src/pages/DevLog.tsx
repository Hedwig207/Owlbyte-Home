import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ScrollText, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function DevLog() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <div className="relative min-h-screen">
      <Navbar />
      <main className="pt-28 pb-24">
        <div className="container max-w-3xl">
          <Link
            to="/"
            className="mb-10 inline-flex h-10 items-center gap-2 rounded-full border border-parchment/15 bg-ink-800/60 px-4 text-sm text-parchment/80 transition-all duration-300 hover:border-amber/40 hover:bg-amber/5 hover:text-amber"
          >
            <ArrowLeft className="h-4 w-4" />
            回到首页
          </Link>

          <div className="rounded-3xl border border-parchment/10 bg-ink-900/40 p-10 text-center md:p-16">
            <div className="mx-auto mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber/10 text-amber">
              <ScrollText className="h-6 w-6" />
            </div>
            <p className="mono-label text-amber/70">§ 开发日志</p>
            <h1 className="mt-3 display-serif text-4xl font-light text-parchment md:text-5xl">
              守夜人值勤簿
            </h1>
            <p className="mx-auto mt-5 max-w-md text-sm leading-relaxed text-parchment/60">
              每一次提交、每一行注释、每一个夜里的微小改动，
              都将自动汇集在这里，成为 OwlByte 的成长轨迹。
            </p>
            <div className="mx-auto mt-8 flex max-w-xs items-center justify-center gap-2 rounded-full border border-amber/20 bg-amber/5 px-4 py-2">
              <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber" />
              <span className="mono-label text-amber/80">Phase D 即将上线</span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}