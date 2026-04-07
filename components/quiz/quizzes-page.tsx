"use client";

import { useGetCategoriesQuery } from "@/lib/features/categories/categoriesSlice";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Code, Terminal, Box, Zap } from "lucide-react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function QuizzesPage() {
  const { data: categories, isLoading } = useGetCategoriesQuery();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500/50" />
        <span className="text-[10px] font-mono tracking-[0.4em] text-slate-500 uppercase">
          Syncing_Data...
        </span>
      </div>
    );
  }

  return (
    <main className="max-w-6xl mx-auto px-6 py-12 ">
      <div className="relative mb-12">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500/20" />
          <span className="text-[10px] font-mono text-slate-500 tracking-widest uppercase">
            System / Categories
          </span>
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
          Neural <span className="text-sky-400">Sectors</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories?.map((cat) => (
          <Link
            key={cat.id}
            href={`/quizzes/${cat.id}`}
            className="group relative rounded-4xl relative group cursor-pointer bg-[#0f172a] border-slate-800 hover:border-sky-500/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(56,189,248,0.1)] overflow-hidden"
          >
            <Card className="h-full bg-[#0d121f]/40 border-slate-800/60 backdrop-blur-sm group-hover:border-sky-500/40 transition-all duration-500 overflow-hidden">
              <div
                className={`absolute top-0 right-0 w-24 h-24 blur-[50px] opacity-20 transition-colors ${cat.totalQuiz > 0 ? "bg-emerald-500" : "bg-slate-500"}`}
              />

              <CardContent className="p-8 relative z-10">
                <div className="flex justify-between items-start mb-8">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-sky-400 group-hover:scale-110 transition-transform duration-500">
                    <Box className="w-5 h-5" />
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-mono text-slate-600 uppercase tracking-tighter">
                      Availability
                    </p>
                    <p
                      className={`text-[10px] font-mono font-bold ${cat.totalQuiz > 0 ? "text-emerald-400" : "text-slate-500"}`}
                    >
                      {cat.totalQuiz > 0 ? "ONLINE" : "EMPTY"}
                    </p>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-sky-400 transition-colors">
                  {cat.name}
                </h2>

                <div className="flex items-center gap-4 mt-6">
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-500 uppercase">
                      <span>Index: 0{cat.id}</span>
                      <span>{cat.totalQuiz} Quizzes</span>
                    </div>
                    <div className="h-[2px] w-full bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-sky-500 transition-all duration-1000 group-hover:bg-violet-500"
                        style={{ width: cat.totalQuiz > 0 ? "100%" : "10%" }}
                      />
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-full border border-slate-800 flex items-center justify-center group-hover:border-sky-500 group-hover:bg-sky-500/10 transition-all">
                    <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-sky-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </main>
  );
}
