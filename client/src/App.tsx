import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import Concepts from './pages/Concepts';
import Ideas from './pages/Ideas';
import EndInterview from './pages/EndInterview';
import Summary from './pages/Summary';
import Synthesis from './pages/Synthesis';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0a0a0a]">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/interview/:id/notes" element={<Notes />} />
          <Route path="/interview/:id/concepts" element={<Concepts />} />
          <Route path="/interview/:id/ideas" element={<Ideas />} />
          <Route path="/interview/:id/end" element={<EndInterview />} />
          <Route path="/interview/:id/summary" element={<Summary />} />
          <Route path="/synthesis" element={<Synthesis />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
