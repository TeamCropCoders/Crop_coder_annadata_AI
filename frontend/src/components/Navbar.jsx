import { LeafIcon, SunIcon } from "./Icons.jsx";

export default function Navbar({ language, languages, copy, onLanguageChange }) {
  return (
    <nav className="border-b border-mud/10 bg-leaf px-4 py-4 text-beige shadow-soft md:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-beige text-leaf">
            <LeafIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="font-display text-2xl font-bold">AnnadataAI</p>
            <p className="text-xs text-beige/80">{copy.navTagline}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 rounded-full bg-beige/15 px-3 py-2 text-sm">
            <span className="font-semibold">{copy.languageLabel}</span>
            <select
              value={language}
              onChange={(event) => onLanguageChange(event.target.value)}
              className="rounded-full border border-white/20 bg-leaf px-2 py-1 text-sm text-beige outline-none"
            >
              {languages.map((option) => (
                <option key={option.value} value={option.value} className="text-mud">
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <div className="hidden items-center gap-2 rounded-full bg-beige/15 px-4 py-2 text-sm md:flex">
            <SunIcon className="h-4 w-4" />
            <span>{copy.navBadge}</span>
          </div>
        </div>
      </div>
    </nav>
  );
}
