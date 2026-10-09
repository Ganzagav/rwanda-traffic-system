import React from 'react';
import { Clock, Navigation, AlertTriangle, ShieldAlert } from 'lucide-react';

export default function RouteSummary({ routeData, t }) {
  if (!routeData) return null;

  const { fastestRoute, shortestRoute } = routeData;
  const timeSaved = shortestRoute.totalTimeMinutes - fastestRoute.totalTimeMinutes;

  return (
    <div className="space-y-4 text-slate-100">
      {/* Fastest Route Card */}
      <div className="p-4 rounded-xl bg-slate-800/90 border border-emerald-500/40 shadow-lg shadow-emerald-950/20">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
            <Navigation className="w-4 h-4" /> {t.fastestRoute}
          </span>
          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-emerald-500/20 text-emerald-300">
            Recommended
          </span>
        </div>
        <div className="flex items-baseline gap-4">
          <div className="text-3xl font-extrabold text-white">
            {fastestRoute.totalTimeMinutes} <span className="text-sm font-normal text-slate-400">min</span>
          </div>
          <div className="text-slate-400 text-sm">
            {fastestRoute.totalDistanceKm} km
          </div>
        </div>
      </div>

      {/* Shortest Distance Card */}
      <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <Clock className="w-4 h-4" /> {t.shortestRoute}
          </span>
        </div>
        <div className="flex items-baseline gap-4">
          <div className="text-2xl font-bold text-slate-300">
            {shortestRoute.totalTimeMinutes} <span className="text-sm font-normal text-slate-500">min</span>
          </div>
          <div className="text-slate-400 text-sm">
            {shortestRoute.totalDistanceKm} km
          </div>
        </div>
      </div>

      {/* Comparison Insight */}
      {timeSaved > 0 && (
        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
          <div>
            <strong>Smart Avoidance Active:</strong> Taking the fastest route saves you{' '}
            <span className="font-bold underline">{timeSaved} minutes</span> compared to the shortest route by bypassing heavy Kigali traffic segments.
          </div>
        </div>
      )}
    </div>
  );
}