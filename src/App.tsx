import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import { useCursorGlow } from '@/hooks/useCursorGlow';

function CursorGlow() {
  useCursorGlow();
  return <div className="cursor-glow" aria-hidden="true" />;
}

export default function App() {
  // 确保根元素始终为 dark 主题（品牌首页设计为深色）
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <Router>
      <CursorGlow />
      <Routes>
        <Route path="/" element={<Home />} />
      </Routes>
    </Router>
  );
}
