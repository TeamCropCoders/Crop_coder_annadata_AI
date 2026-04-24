import { LeafIcon, SunIcon } from "./Icons.jsx";

export default function Navbar() {
  return (
    <nav className="border-b border-mud/10 bg-leaf px-4 py-4 text-beige shadow-soft md:px-8">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-beige text-leaf">
            <LeafIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="font-display text-2xl font-bold">AnnadataAI</p>
            <p className="text-xs text-beige/80">Farmer-first crop intelligence</p>
          </div>
        </div>
        <div className="hidden items-center gap-2 rounded-full bg-beige/15 px-4 py-2 text-sm md:flex">
          <SunIcon className="h-4 w-4" />
          <span>Simple advice for better sowing</span>
        </div>
      </div>
    </nav>
  );
}
