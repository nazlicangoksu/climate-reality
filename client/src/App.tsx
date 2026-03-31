import { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Notes from './pages/Notes';
import Concepts from './pages/Concepts';
import Ideas from './pages/Ideas';
import EndInterview from './pages/EndInterview';
import Summary from './pages/Summary';
import Synthesis from './pages/Synthesis';
import Brainstorm from './pages/Brainstorm';

type AuthLevel = 'none' | 'brainstorm' | 'admin';

function getAuthLevel(): AuthLevel {
  return (sessionStorage.getItem('auth-level') as AuthLevel) || 'none';
}

function PasswordGate({ children, requiredLevel }: { children: React.ReactNode; requiredLevel: AuthLevel }) {
  const [level, setLevel] = useState<AuthLevel>(getAuthLevel);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const meetsLevel = (current: AuthLevel, required: AuthLevel) => {
    const order: AuthLevel[] = ['none', 'brainstorm', 'admin'];
    return order.indexOf(current) >= order.indexOf(required);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const pw = input.toLowerCase().trim();
    let newLevel: AuthLevel = 'none';
    if (pw === 'producer390') {
      newLevel = 'admin';
    } else if (pw === 'itsreal') {
      newLevel = 'brainstorm';
    }

    if (newLevel !== 'none') {
      sessionStorage.setItem('auth-level', newLevel);
      setLevel(newLevel);
      setInput('');
    } else {
      setError(true);
      setTimeout(() => setError(false), 1500);
    }
  };

  if (meetsLevel(level, requiredLevel)) return <>{children}</>;

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
    <BrowserRouter>
      <div className="min-h-screen bg-[#0a0a0a]">
        <Routes>
          {/* Brainstorm-level access (password: itsreal) */}
          <Route path="/brainstorm" element={
            <PasswordGate requiredLevel="brainstorm"><Brainstorm /></PasswordGate>
          } />
          <Route path="/concepts" element={
            <PasswordGate requiredLevel="brainstorm"><Concepts /></PasswordGate>
          } />

          {/* Admin-level access (password: producer390) */}
          <Route path="/" element={
            <PasswordGate requiredLevel="admin"><Dashboard /></PasswordGate>
          } />
          <Route path="/interview/:id/notes" element={
            <PasswordGate requiredLevel="admin"><Notes /></PasswordGate>
          } />
          <Route path="/interview/:id/concepts" element={
            <PasswordGate requiredLevel="admin"><Concepts /></PasswordGate>
          } />
          <Route path="/interview/:id/ideas" element={
            <PasswordGate requiredLevel="admin"><Ideas /></PasswordGate>
          } />
          <Route path="/interview/:id/end" element={
            <PasswordGate requiredLevel="admin"><EndInterview /></PasswordGate>
          } />
          <Route path="/interview/:id/summary" element={
            <PasswordGate requiredLevel="admin"><Summary /></PasswordGate>
          } />
          <Route path="/synthesis" element={
            <PasswordGate requiredLevel="admin"><Synthesis /></PasswordGate>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
