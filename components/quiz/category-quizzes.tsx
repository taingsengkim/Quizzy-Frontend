"use client";

import { useGetQuizzesByCategoryQuery } from "@/lib/features/quizzes/quizzesSlice";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Loader2, User, Users, X } from "lucide-react";
import { useState } from "react";

interface Quiz {
  id: number;
  title: string;
  description: string;
  duration: number;
  questions?: unknown[];
}

interface Props {
  categoryId: number;
}

export default function CategoryQuizzesClient({ categoryId }: Props) {
  const { data: quizzes, isLoading } = useGetQuizzesByCategoryQuery(categoryId);
  const router = useRouter();
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);

  if (isLoading) {
    return (
      <div
        className="flex flex-col items-center justify-center 
                    min-h-[400px] gap-2 
                    bg-white dark:bg-transparent 
                    text-gray-500 dark:text-slate-500 
                    transition-colors"
      >
        <Loader2 className="w-8 h-8 animate-spin text-sky-500 dark:text-sky-400" />

        <p
          className="font-mono text-xs uppercase tracking-widest 
                    text-gray-500 dark:text-slate-400"
        >
          Loading Quizzes...
        </p>
      </div>
    );
  }

  if (!quizzes || quizzes.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 font-mono">
          No quizzes found in this sector.
        </p>
      </div>
    );
  }

  const handleSinglePlayer = async () => {
    if (!selectedQuiz) return;
    try {
      const res = await fetch("/api/auth/check");
      if (!res.ok) throw new Error("Not logged in");
      const data = await res.json();
      if (data.loggedIn) {
        router.push(`/quizzes/play/${selectedQuiz.id}`);
      } else {
        router.push("/login");
      }
    } catch {
      router.push("/login");
    }
  };

  const handleMultiplayer = () => {
    if (!selectedQuiz) return;
    router.push(`/quizzes/multiplayer/${selectedQuiz.id}`);
  };

  return (
    <div className="bg-white dark:bg-[#05080f]">
      <div className="max-w-6xl mx-auto px-6 py-20 text-white">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-black dark:text-white">
            Available Quizzes
          </h1>
          <p className="text-slate-400 text-sm mt-2">
            Select a module to begin your evaluation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes?.content?.map((quiz: Quiz) => {
            const isEmpty = quiz.questions?.length === 0;

            return (
              <Card
                key={quiz.id}
                onClick={() => {
                  if (isEmpty) return;
                  setSelectedQuiz(quiz);
                }}
                className={`group relative overflow-hidden border transition-all duration-300 font-mono
    ${
      isEmpty
        ? "bg-slate-100 border-slate-200 cursor-not-allowed opacity-50 dark:bg-[#05070a] dark:border-slate-900/60"
        : "bg-white border-slate-200 cursor-pointer hover:border-sky-400 hover:-translate-y-1.5 hover:shadow-lg dark:bg-[#070b14] dark:border-slate-800/70 dark:hover:border-sky-500/60 dark:hover:shadow-[0_0_50px_rgba(14,165,233,0.12)]"
    }`}
              >
                <div className="absolute top-0 right-0 w-10 h-10 border-t-2 border-r-2 border-sky-500 opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-none" />
                <CardContent className="p-6 relative z-10 flex flex-col h-full">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          isEmpty
                            ? "bg-slate-300 dark:bg-slate-700"
                            : "bg-sky-500 animate-pulse shadow-[0_0_8px_#38bdf8]"
                        }`}
                      />

                      <span className="text-[10px] font-black uppercase tracking-widest text-sky-600 dark:text-sky-400">
                        {isEmpty ? "OFFLINE" : "SYSTEM_READY"}
                      </span>
                    </div>
                    <div className="bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[9px] text-slate-500 font-bold uppercase dark:bg-black/40 dark:border-slate-800 dark:text-slate-500">
                      {quiz.duration} MNS
                    </div>
                  </div>
                  <h2
                    className={`text-xl font-black leading-tight uppercase italic tracking-tighter transition-colors
        ${
          isEmpty
            ? "text-slate-400 dark:text-slate-600"
            : "text-slate-900 dark:text-white group-hover:text-sky-500"
        }`}
                  >
                    {quiz.title}
                  </h2>
                  <div className="mt-4 p-3 bg-slate-50 border-l-2 border-slate-200 rounded-r-md dark:bg-black/30 dark:border-slate-800">
                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed font-mono italic dark:text-slate-400">
                      {isEmpty
                        ? ">> ERROR: DATA MODULE UNAVAILABLE"
                        : `>> ${quiz.description}`}
                    </p>
                  </div>
                  <div className="mt-auto pt-6 flex items-center justify-between">
                    {!isEmpty ? (
                      <>
                        <div className="text-[10px] font-black text-sky-600 dark:text-sky-400 uppercase tracking-[0.2em] flex items-center gap-2">
                          <span className="opacity-70 group-hover:opacity-100 transition">
                            EXECUTE
                          </span>
                          <div className="h-[1px] w-4 bg-sky-500/50 group-hover:w-8 transition-all" />
                        </div>

                        <span className="text-[9px] text-slate-500 font-bold bg-slate-100 border border-slate-200 px-1.5 py-0.5 rounded dark:bg-black/40 dark:border-slate-800">
                          Q_{quiz.questions?.length || 0}
                        </span>
                      </>
                    ) : (
                      <span className="text-[9px] text-slate-400 dark:text-slate-700 font-black uppercase tracking-widest">
                        AUTH_REQUIRED
                      </span>
                    )}
                  </div>
                </CardContent>
                <div className="absolute inset-0 pointer-events-none opacity-[0.02] group-hover:opacity-[0.06] transition-opacity bg-[linear-gradient(45deg,#38bdf8_1px,transparent_1px),linear-gradient(-45deg,#38bdf8_1px,transparent_1px)] bg-[length:20px_20px]" />
              </Card>
            );
          })}
        </div>
      </div>
      {selectedQuiz && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center 
             bg-black/60 dark:bg-black/80 
             backdrop-blur-md px-4
             animate-in fade-in duration-200"
          onClick={() => setSelectedQuiz(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl p-8 border shadow-2xl
               bg-white dark:bg-[#0f172a]
               border-slate-200 dark:border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="space-y-1">
                <p
                  className="text-[10px] font-mono uppercase tracking-widest 
                      text-sky-600 dark:text-sky-400/70"
                >
                  Select mode
                </p>

                <h2
                  className="text-xl font-bold leading-tight 
                       text-slate-900 dark:text-white"
                >
                  {selectedQuiz.title}
                </h2>

                <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  {selectedQuiz.duration} mins ·{" "}
                  {selectedQuiz.questions?.length || 0} questions
                </p>
              </div>

              <button
                onClick={() => setSelectedQuiz(null)}
                className="text-slate-500 hover:text-slate-900 
                   dark:hover:text-white 
                   hover:bg-slate-100 dark:hover:bg-white/5 
                   rounded-lg p-1 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleSinglePlayer}
                className="cursor-pointer group flex flex-col items-start text-left p-5 rounded-xl
                   border transition-all duration-200
                   bg-white dark:bg-[#0f172a]
                   border-slate-200 dark:border-slate-800
                   hover:border-sky-500/60
                   hover:bg-slate-50 dark:hover:bg-[#111827]
                   hover:shadow-lg"
              >
                <div
                  className="w-10 h-10 rounded-lg mb-3 flex items-center justify-center
                     bg-sky-100 dark:bg-sky-500/10
                     group-hover:bg-sky-200 dark:group-hover:bg-sky-500/20 transition"
                >
                  <User className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                </div>

                <p
                  className="text-sm font-bold text-slate-900 dark:text-white 
                      group-hover:text-sky-500 dark:group-hover:text-sky-400"
                >
                  Single player
                </p>

                <p className="text-[11px] text-slate-500 mt-1">
                  Login required
                </p>
              </button>
              <button
                onClick={handleMultiplayer}
                className="group cursor-pointer relative flex flex-col items-start text-left p-5 rounded-xl
                   border transition-all duration-200
                   bg-white dark:bg-[#0f172a]
                   border-sky-200 dark:border-sky-500/30
                   hover:border-sky-500
                   hover:bg-slate-50 dark:hover:bg-[#111827]
                   hover:shadow-lg"
              >
                <span
                  className="absolute -top-2.5 left-3 text-[10px] font-mono uppercase
                     bg-sky-100 dark:bg-sky-500/15
                     text-sky-600 dark:text-sky-300
                     px-2 py-0.5 rounded-full border
                     border-sky-200 dark:border-sky-500/20"
                >
                  No login needed
                </span>

                <div
                  className="w-10 h-10 rounded-lg mb-3 flex items-center justify-center
                     bg-sky-100 dark:bg-sky-500/10
                     group-hover:bg-sky-200 dark:group-hover:bg-sky-500/20 transition"
                >
                  <Users className="w-5 h-5 text-sky-600 dark:text-sky-400" />
                </div>

                <p
                  className="text-sm font-bold text-slate-900 dark:text-white 
                      group-hover:text-sky-500 dark:group-hover:text-sky-400"
                >
                  Multiplayer
                </p>

                <p className="text-[11px] text-slate-500 mt-1">
                  Play instantly
                </p>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
