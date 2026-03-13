import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import Concepts from './pages/Concepts';
import Ideas from './pages/Ideas';
import EndInterview from './pages/EndInterview';
import Summary from './pages/Summary';
import Synthesis from './pages/Synthesis';

function PasswordGate({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(
    () => sessionStorage.getItem('auth') === '1'
  );
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.toLowerCase().trim() === 'this is real') {
      sessionStorage.setItem('auth', '1');
      setAuthenticated(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  };

  if (authenticated) return <>{children}</>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="text-center max-w-sm w-full">
        <p className="font-ui text-[10px] text-stone-500 uppercase tracking-[0.3em] mb-8">
          Climate & Reality TV
        </p>
        <input
          type="password"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder=""
          autoFocus
          className={`w-full bg-transparent border-b ${
            error ? 'border-red-500/50' : 'border-white/10'
          } text-white text-center font-body text-lg py-3 outline-none focus:border-amber-500/40 transition-colors placeholder:text-stone-700`}
        />
        <button
          type="submit"
          className="mt-6 font-ui text-[10px] text-stone-500 tracking-wider uppercase hover:text-amber-400 transition-colors"
        >
          Enter
        </button>
      </form>
    </div>
  );
}

function App() {
  return (
    <PasswordGate>
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
    </PasswordGate>
  );
}

export default App;
