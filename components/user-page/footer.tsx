import React from "react";
import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="relative z-10 w-full border-t border-slate-200 dark:border-white/5 bg-white dark:bg-[#080b14] transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-16">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-12">
          {/* Main Organizer Section */}
          <div className="space-y-8 max-w-sm">
            <div className="space-y-4">
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-sky-600 dark:text-sky-400 font-bold">
                Presented By
              </p>
              <div className="flex items-center gap-6">
                <a
                  href="https://www.istad.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-transform hover:scale-105"
                >
                  <img
                    src="/istad.png"
                    alt="ISTAD Logo"
                    className="h-16 md:h-20 w-auto object-contain dark:brightness-125"
                  />
                </a>

                <div className="h-12 w-[1px] bg-slate-200 dark:bg-slate-800" />
                <Link href="/" className="transition-transform hover:scale-105">
                  <img
                    src="/quizzy-logo.png"
                    alt="Quizzy Logo"
                    className="h-16 md:h-20 w-auto object-contain dark:brightness-125 rounded-full"
                  />
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-display text-lg font-bold text-slate-900 dark:text-white">
                ISTAD Center
              </h3>
              <p className="font-mono text-xs text-slate-500 dark:text-slate-400 leading-relaxed uppercase">
                <span className="text-sky-500 dark:text-sky-400">// </span>
                Science and Technology Advanced Development. Developing digital
                talent for the future of Cambodia.
              </p>
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 md:gap-20">
            <div className="space-y-5">
              <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-900 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800 pb-2">
                Project
              </h4>
              <ul className="space-y-3">
                {["Quizzes", "Leaderboard", "Instant Play"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="font-mono text-xs text-slate-500 hover:text-sky-500 dark:hover:text-sky-400 transition-colors uppercase"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-5">
              <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-900 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800 pb-2">
                Legal
              </h4>
              <ul className="space-y-3">
                {["Privacy Policy", "Terms of Service"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="font-mono text-xs text-slate-500 hover:text-sky-500 dark:hover:text-sky-400 transition-colors uppercase"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-5">
              <h4 className="font-mono text-[10px] uppercase tracking-[0.2em] text-slate-900 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800 pb-2">
                Social
              </h4>
              <ul className="space-y-3">
                {["GitHub", "Facebook", "Telegram"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="font-mono text-xs text-slate-500 hover:text-sky-500 dark:hover:text-sky-400 transition-colors uppercase"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-20 pt-8 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)] animate-pulse" />
            <span className="font-mono text-[10px] text-slate-400 tracking-widest uppercase">
              ISTAD_ORGANIZED // © {new Date().getFullYear()} QUIZZY_V1.0
            </span>
          </div>

          <div className="flex items-center gap-6">
            <span className="font-mono text-[10px] text-slate-500 hover:text-sky-400 transition-colors cursor-default">
              BUILD_THE_FUTURE
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
