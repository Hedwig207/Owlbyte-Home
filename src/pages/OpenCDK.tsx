import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OpenCDKSpotlight from '@/components/OpenCDKSpotlight';

export default function OpenCDKPage() {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <div className="relative">
      <Navbar />
      <main className="pt-28">
        <div className="container">
          <div className="mb-10 flex items-center gap-4 flex-wrap">
            <Link
              to="/project"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-parchment/15 bg-ink-800/60 px-4 text-sm text-parchment/80 transition-all duration-300 hover:border-amber/40 hover:bg-amber/5 hover:text-amber"
            >
              <ArrowLeft className="h-4 w-4" />
              作品列表
            </Link>
            <Link
              to="/"
              className="inline-flex h-10 items-center gap-2 rounded-full border border-parchment/15 bg-ink-800/60 px-4 text-sm text-parchment/80 transition-all duration-300 hover:border-moon/40 hover:bg-moon/5 hover:text-moon"
            >
              回到首页
            </Link>
          </div>
        </div>
        <OpenCDKSpotlight />
      </main>
      <Footer />
    </div>
  );
}
