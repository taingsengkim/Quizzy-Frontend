"use client";

import { useGetCategoriesQuery } from "@/lib/features/categories/categoriesSlice";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Zap, Loader2 } from "lucide-react";
import Link from "next/link";

export default function QuizzesPage() {
  const { data: categories, isLoading } = useGetCategoriesQuery();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-sky-500/50" />
        <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">
          Syncing Data...
        </span>
      </div>
    );
  }

  return (
    <div className=" grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {categories?.map((cat) => {
        const progressWidth = cat?.totalQuiz
          ? Math.min(cat.totalQuiz * 10, 100)
          : 5;

        return (
          <Link
            key={cat.id}
            href={`/quizzes/${cat.id}`}
            className="group relative block"
          >
            <Card className="h-full bg-[#0a0f1d] border border-slate-800/60 rounded-2xl shadow-lg overflow-hidden transition-transform duration-300 group-hover:-translate-y-1 group-hover:border-sky-500">
              <CardContent className="p-6 relative z-10 flex flex-col justify-between h-full">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl group-hover:border-sky-500 transition-colors">
                    <img
                      src={cat.imageUrl}
                      alt={cat?.name}
                      className="w-16 h-16 object-contain"
                    />
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono text-slate-500 uppercase">
                      Availability
                    </p>
                    <p
                      className={`text-sm font-bold font-mono ${
                        cat.totalQuiz > 0
                          ? "text-emerald-400"
                          : "text-slate-500"
                      }`}
                    >
                      {cat.totalQuiz > 0 ? "ACTIVE" : "PENDING"}
                    </p>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-white mb-2 group-hover:text-sky-400 transition-colors">
                  {cat.name}
                </h2>
                <p className="text-sm text-slate-400 line-clamp-3 mb-4 group-hover:text-slate-200 transition-colors">
                  {cat.description ||
                    "Sector analysis unavailable. Initialize link to explore modules."}
                </p>
                <div className="flex justify-between items-center text-xs text-slate-400 mb-2">
                  <span>
                    Sector_ID:{" "}
                    <span className="text-sky-400 font-bold">0x0{cat.id}</span>
                  </span>
                  <span>
                    Modules:{" "}
                    <span className="text-white font-bold">
                      {cat.totalQuiz || 0}
                    </span>
                  </span>
                </div>
                <div className="relative h-1 w-full bg-slate-800 rounded-full overflow-hidden mb-4">
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-sky-500 to-violet-500 transition-all duration-500"
                    style={{ width: `${progressWidth}%` }}
                  />
                </div>

                <div className="flex justify-end">
                  <div className="flex items-center justify-center w-8 h-8 bg-slate-900 border border-slate-800 rounded-lg group-hover:bg-sky-500 group-hover:border-sky-400 transition-all">
                    <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white transition-transform duration-300" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
