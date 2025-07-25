import { useState, useEffect, useRef } from 'react';
const BACK_URL = import.meta.env.VITE_RESTFEED_BACK;

function Quotes() {
  const [currentQuote, setCurrentQuote] = useState(null);
  const [history, setHistory] = useState([]);
  const historyRef = useRef(null);

  useEffect(() => {
    fetchCurrent();
    fetchHistory();
  }, []);

  const fetchCurrent = async () => {
    // para local:
    //const res = await fetch('http://localhost:3001/quotes/current');
    //para railway:
    const res = await fetch(`${BACK_URL}/quotes/current`);
    const data = await res.json();
    setCurrentQuote(data);
  };

  const fetchHistory = async () => {
    // para local:
    // const res = await fetch('http://localhost:3001/quotes/history');
    //para railway:
    const res = await fetch(`${BACK_URL}/quotes/history`);
    const data = await res.json();
    setHistory(data);
  };

  if (!currentQuote) return <p>Loading...</p>;

  const scrollToHistory = () => {
    if (historyRef.current) {
      historyRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="font-sans text-black w-screen">
      {/* Cita actual full screen */}
      <section className="relative h-screen flex flex-col justify-center items-center text-black mx-auto bg-[#2CC4E0]">
        <p className="text-2xl md:text-4xl lg:text-6xl font-bold leading-relaxed tracking-tight mb-8 text-center max-w-5xl">
          {currentQuote.text}
        </p>
        <p className="text-xl font-bold text-gray-100">
          {currentQuote.author || 'Anónimo'}
        </p>
        <p className="text-xl text-gray-600 mt-3">
          {currentQuote.selected_at
            ? new Date(currentQuote.selected_at).toLocaleString()
            : ''}
        </p>

        {/* Flecha hacia abajo */}
        <button
          onClick={scrollToHistory}
          aria-label="Ir al histórico de frases"
          className="absolute bottom-6 right-6 text-gray-100 hover:text-black focus:outline-none"
        >
          {/* Flecha SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 animate-bounce"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
      </section>

      {/* Histórico con scroll */}
      <section
        ref={historyRef}
        className="bg-gray-200 mx-auto max-h-[60vh] overflow-y-auto"
      >
        <h2 className="pt-8 text-black text-xs tracking-widest mb-5 font-bold text-center">
          Previously
        </h2>
        <ul className="space-y-6">
          {history.map((q) => (
            <li
              key={q.id}
              className="text-black p-6 rounded-md shadow-sm"
            >
              <p className="text-xl font-extrabold leading-snug">{q.text}</p>
              <p className="text-sm font-bold text-gray-900 mt-2">
                — {q.author || 'Anónimo'} ·{' '}
              <time dateTime={q.selected_at}>
              {new Date(q.selected_at).toLocaleString()}
            </time>
              </p>
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default Quotes;
