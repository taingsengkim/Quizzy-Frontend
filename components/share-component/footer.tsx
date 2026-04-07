import React from "react";

export default function Footer() {
  return (
    <footer className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 py-8 border-t border-white/4 flex flex-wrap items-center justify-between gap-4">
      <span className="font-display text-base font-extrabold text-white">
        quiz<span className="text-sky-400">zy</span>
        <span className="text-violet-500">_</span>
      </span>
      <span className="font-mono text-xs text-slate-700">
        <span className="text-sky-400">// </span>built for developers, by
        developers
      </span>
      <div className="flex gap-6">
        {["privacy", "terms", "api", "github"].map((l) => (
          <a
            key={l}
            href="#"
            className="font-mono text-xs text-slate-700 hover:text-slate-400 transition-colors"
          >
            {l}
          </a>
        ))}
      </div>
    </footer>
  );
}
