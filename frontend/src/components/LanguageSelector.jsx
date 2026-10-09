import React from 'react';
import { Globe } from 'lucide-react';

export default function LanguageSelector({ currentLang, onSelectLang }) {
  const languages = [
    { code: 'rw', label: 'Kinyarwanda' },
    { code: 'en', label: 'English' },
    { code: 'fr', label: 'Français' },
    { code: 'sw', label: 'Kiswahili' }
  ];

  return (
    <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700">
      <Globe className="w-4 h-4 text-emerald-400" />
      <select
        value={currentLang}
        onChange={(e) => onSelectLang(e.target.value)}
        className="bg-transparent text-slate-200 text-sm font-medium focus:outline-none cursor-pointer"
      >
        {languages.map((lang) => (
          <option key={lang.code} value={lang.code} className="bg-slate-800 text-white">
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
}