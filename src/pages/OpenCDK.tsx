import { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import OpenCDKSpotlight from '@/components/OpenCDKSpotlight';

export default function OpenCDKPage() {
  // 进入页面后平滑滚到顶部
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  return (
    <div className="relative">
      <Navbar />
      <main>
        <OpenCDKSpotlight />
      </main>
      <Footer />
    </div>
  );
}
