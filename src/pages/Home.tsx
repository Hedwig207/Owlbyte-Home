import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import Manifesto from '@/components/Manifesto';
import Founder from '@/components/Founder';
import Capabilities from '@/components/Capabilities';
import Products from '@/components/Products';
import Community from '@/components/Community';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="relative">
      <Navbar />
      <main>
        <Hero />
        <Manifesto />
        <Founder />
        <Capabilities />
        <Products />
        <Community />
      </main>
      <Footer />
    </div>
  );
}
