import React, { useState, useEffect } from 'react';
import { translations } from './i18n/translations';
import LanguageSelector from './components/LanguageSelector';
import RouteSummary from './components/RouteSummary';
import { MapPin, Cpu, Car, Layers } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState('rw');
  const t = translations[lang];

  const [nodes, setNodes] = useState([]);
  const [originId, setOriginId] = useState('1'); // Default Kibagabaga
  const [destinationId, setDestinationId] = useState('3'); // Default Gisozi
  const [routeResult, setRouteResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_BASE = 'http://localhost:5000/api/navigation';

  useEffect(() => {
    fetch(`${API_BASE}/network`)
      .then((res) => res.json())
      .then((data) => setNodes(data.nodes || []))
      .catch((err) => console.error('Error fetching network:', err));
  }, []);

  const handleCalculateRoute = () => {
    setLoading(true);
    fetch(`${API_BASE}/route?originId=${originId}&destinationId=${destinationId}`)
      .then((res) => res.json())
      .then((data) => {
        setRouteResult(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      {/* Header Bar */}
      <header className="h-16 border-b border-slate-800 bg-slate-900/80 backdrop-blur px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide">{t.title}</h1>
            <p className="text-xs text-slate-400">Rwanda Intelligent Routing Prototype</p>
          </div>
        </div>
        <LanguageSelector currentLang={lang} onSelectLang={setLang} />
      </header>

      {/* Main Container */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* Left Control Panel */}
        <div className="lg:col-span-4 p-6 bg-slate-900 border-r border-slate-800 flex flex-col justify-between space-y-6">
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {t.origin}
              </label>
              <select
                value={originId}
                onChange={(e) => setOriginId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:border-emerald-500"
              >
                {nodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-rose-400" /> {t.destination}
              </label>
              <select
                value={destinationId}
                onChange={(e) => setDestinationId(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-sm focus:outline-none focus:border-emerald-500"
              >
                {nodes.map((node) => (
                  <option key={node.id} value={node.id}>
                    {node.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={handleCalculateRoute}
              disabled={loading}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg shadow-lg shadow-emerald-900/30 transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Calculating...' : t.calculate}
            </button>

            <RouteSummary routeData={routeResult} t={t} />
          </div>

          <div className="p-3 bg-slate-950/60 rounded-lg border border-slate-800/80 text-xs text-slate-500 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Deployment Mode: Vehicle Dedicated Hardware Unit / Infotainment</span>
          </div>
        </div>

        {/* Map View Simulation Area */}
        <div className="lg:col-span-8 bg-slate-950 p-6 flex flex-col items-center justify-center relative">
          <div className="w-full h-full min-h-[450px] border border-slate-800 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col items-center justify-center p-8 text-center relative overflow-hidden">
            <Layers className="w-16 h-16 text-slate-800 mb-4 animate-pulse" />
            <h3 className="text-xl font-bold text-slate-300 mb-2">Live Kigali Geospatial Route Network</h3>
            <p className="text-sm text-slate-500 max-w-md">
              Monitors road conditions (Tarmac, Stone, Unpaved), BK Arena/Amahoro event closures, and traffic police reports in real time[cite: 2, 5, 7].
            </p>

            {routeResult && (
              <div className="mt-8 p-4 bg-slate-900/90 border border-slate-700 rounded-xl max-w-lg w-full text-left font-mono text-xs text-slate-300">
                <div className="text-emerald-400 font-bold mb-2">Fastest Route Computed Node Sequence:</div>
                <div className="bg-slate-950 p-2.5 rounded border border-slate-800 text-emerald-300">
                  {routeResult.fastestRoute.path.join(' ➔ ')}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}