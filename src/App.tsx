import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '@/pages/Home';
import ProjectsPage from '@/pages/Projects';
import ProjectDetailPage from '@/pages/ProjectDetail';
import WatchmenPage from '@/pages/Watchmen';
import WatchmanHedwigPage from '@/pages/WatchmanHedwig';
import { useCursorGlow } from '@/hooks/useCursorGlow';

function CursorGlow() {
  useCursorGlow();
  return <div className="cursor-glow" aria-hidden="true" />;
}

export default function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <Router>
      <CursorGlow />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/project" element={<ProjectsPage />} />
        <Route path="/project/:id" element={<ProjectDetailPage />} />
        <Route path="/watchman" element={<WatchmenPage />} />
        <Route path="/watchman/hedwig" element={<WatchmanHedwigPage />} />
      </Routes>
    </Router>
  );
}
