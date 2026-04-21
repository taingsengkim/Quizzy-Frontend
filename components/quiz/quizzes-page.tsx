"use client";

import { useGetCategoriesQuery } from "@/lib/features/categories/categoriesSlice";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Loader2, Search, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import Image from "next/image";

const PAGE_SIZE = 9;

export default function QuizzesPage() {
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "active" | "pending">("all");
  const { data, isLoading, isFetching } = useGetCategoriesQuery({
    page,
    size: PAGE_SIZE,
  });

  const filtered = useMemo(() => {
    let list = data?.content ?? [];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }
    if (filter === "active") list = list.filter((c) => c.totalQuiz > 0);
    if (filter === "pending") list = list.filter((c) => c.totalQuiz === 0);
    return list;
  }, [data, search, filter]);

  const handleSearch = (v: string) => {
    setSearch(v);
    setPage(0);
  };
  const handleFilter = (v: "all" | "active" | "pending") => {
    setFilter(v);
    setPage(0);
  };

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

  const totalPages = data?.totalPages ?? 1;
  const totalElements = data?.totalElements ?? 0;
  const isFirst = data?.first ?? true;
  const isLast = data?.last ?? true;

  return (
    <div className="space-y-6">
      {/* ── Search & Filter bar ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search sectors by name..."
            className="w-full bg-[#0a0f1d] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500 transition-colors"
          />
        </div>

        <div className="relative">
          <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <select
            value={filter}
            onChange={(e) =>
              handleFilter(e.target.value as "all" | "active" | "pending")
            }
            className="appearance-none bg-[#0a0f1d] border border-slate-800 rounded-xl pl-10 pr-8 py-2.5 text-sm font-mono text-slate-200 focus:outline-none focus:border-sky-500 transition-colors cursor-pointer"
          >
            <option value="all">All Sectors</option>
            <option value="active">Active only</option>
            <option value="pending">Pending only</option>
          </select>
        </div>
      </div>

      {/* ── Results count ── */}
      <p className="text-xs font-mono text-slate-500 uppercase tracking-widest">
        {totalElements} total sector{totalElements !== 1 ? "s" : ""}
        {isFetching && (
          <span className="ml-2 inline-flex items-center gap-1 text-sky-500">
            <Loader2 className="w-3 h-3 animate-spin" /> syncing...
          </span>
        )}
      </p>

      {/* ── Cards grid ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] gap-2">
          <span className="text-4xl">🔍</span>
          <p className="text-sm font-mono text-slate-500 uppercase tracking-widest">
            No sectors match your query
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((cat) => {
            const progressWidth = cat?.totalQuiz
              ? Math.min(cat.totalQuiz * 10, 100)
              : 5;

            return (
              <Link
                key={cat.id}
                href={`/quizzes/${cat.id}`}
                className="group relative block"
              >
                <Card className="h-full bg-[#0a0f1d] border border-slate-800 rounded-2xl overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:border-sky-500 relative">
                  <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-sky-400 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <CardContent className="p-6 flex flex-col h-full gap-0">
                    <div className="flex justify-between items-start mb-5">
                      <div className="w-25 h-25  bg-slate-900 border border-slate-800 group-hover:border-sky-500 rounded-[14px] flex items-center justify-center transition-colors duration-300 shrink-0">
                        <Image
                          src={cat.imageUrl}
                          alt={"img of " + cat.name}
                          width={150}
                          height={150}
                          className="h-20 w-20 rounded-lg object-cover"
                        />
                      </div>
                      <div
                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold font-mono tracking-wide border ${
                          cat.totalQuiz > 0
                            ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/20"
                            : "bg-slate-700/30 text-slate-500 border-slate-700/40"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            cat.totalQuiz > 0
                              ? "bg-emerald-400"
                              : "bg-slate-600"
                          }`}
                        />
                        {cat.totalQuiz > 0 ? "Active" : "Pending"}
                      </div>
                    </div>
                    <h2 className="text-[17px] font-bold text-slate-100 mb-2 group-hover:text-sky-400 transition-colors duration-300">
                      {cat.name}
                    </h2>
                    <p className="text-sm text-slate-500 line-clamp-2 mb-5 group-hover:text-slate-300 transition-colors duration-300 leading-relaxed">
                      {cat.description ||
                        "Sector analysis unavailable. Initialize link to explore modules."}
                    </p>
                    <div className="flex justify-between items-center text-[11px] font-mono mb-3">
                      <span className="text-slate-600">
                        ID:{" "}
                        <span className="text-sky-400 font-bold">
                          0x0{cat.id}
                        </span>
                      </span>
                      <span className="text-slate-600">
                        Modules:{" "}
                        <span className="text-slate-200 font-bold">
                          {cat.totalQuiz || 0}
                        </span>
                      </span>
                    </div>
                    <div className="h-[3px] w-full bg-slate-800 rounded-full overflow-hidden mb-5">
                      <div
                        className="h-full bg-gradient-to-r from-sky-500 to-violet-500 rounded-full transition-all duration-500"
                        style={{ width: `${progressWidth}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center mt-auto">
                      <span className="text-[11px] font-mono text-slate-700">
                        sector_{String(cat.id).padStart(3, "0")}
                      </span>
                      <div className="w-8 h-8 bg-slate-900 border border-slate-800 rounded-[10px] flex items-center justify-center group-hover:bg-sky-500 group-hover:border-sky-400 transition-all duration-300">
                        <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors duration-300" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      {/* ── Pagination — driven by API's totalPages / first / last ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            // disabled={isFirst || isFetching}
            className="px-4 py-2 text-xs font-mono uppercase tracking-widest bg-[#0a0f1d] border border-slate-800 rounded-xl text-slate-400 hover:border-sky-500 hover:text-sky-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            ← Prev
          </button>

          <span className="text-xs font-mono text-slate-500">
            Page <span className="text-sky-400 font-bold">{page + 1}</span> /{" "}
            {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            // disabled={isLast || isFetching}
            className="px-4 py-2 text-xs font-mono uppercase tracking-widest bg-[#0a0f1d] border border-slate-800 rounded-xl text-slate-400 hover:border-sky-500 hover:text-sky-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
