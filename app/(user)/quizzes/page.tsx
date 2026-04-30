import QuizPageComponent from "@/components/quiz/quizzes-page";
import { Zap } from "lucide-react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "All Programming Quizzes",
  description:
    "Browse 600+ programming quiz questions on JavaScript, React, TypeScript, Python, SQL and more. Pick your challenge and start competing.",
  alternates: { canonical: "/quizzes" },
};
export default function QuizPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#080b14] transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-6 py-14 md:py-32">
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500/20" />
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400 tracking-[0.2em] uppercase">
              System /{" "}
              <span className="text-sky-600 dark:text-sky-400">Categories</span>
            </span>
          </div>
          <div className="relative inline-block">
            <h1 className="relative z-10 p-4 text-3xl md:text-5xl font-black text-slate-900 dark:text-white uppercase italic tracking-tighter">
              Neural{" "}
              <span className="text-sky-600 dark:text-sky-400">Sectors</span>
            </h1>
            <div className="absolute inset-0 bg-slate-100 dark:bg-sky-500/5 -skew-x-12 border-l-4 border-sky-600 dark:border-sky-400" />
          </div>
          <p className="mt-6 text-sm text-slate-500 dark:text-slate-400 font-mono max-w-xl leading-relaxed uppercase tracking-wide">
            <span className="text-sky-600 dark:text-sky-400 mr-2">//</span>
            Select an interface to begin knowledge extraction. 600+ modules
            available for deployment.
          </p>
        </div>
        <div className="relative z-10">
          <QuizPageComponent />
        </div>
      </div>
    </div>
  );
}
