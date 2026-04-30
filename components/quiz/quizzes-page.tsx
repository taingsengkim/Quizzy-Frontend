"use client";

import { useGetCategoriesQuery } from "@/lib/features/categories/categoriesSlice";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowRight,
  Loader2,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState, useMemo } from "react";
import Image from "next/image";

const PAGE_SIZE = 9;

type StatusFilter = "all" | "active" | "pending";
type SortFilter =
  | "default"
  | "name_asc"
  | "name_desc"
  | "quizzes_desc"
  | "quizzes_asc";

export default function QuizzesPage() {
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [committedSearch, setCommittedSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortFilter>("default");
  const { data, isLoading, isFetching } = useGetCategoriesQuery({
    page,
    size: PAGE_SIZE,
    search: committedSearch || undefined,
  });
  const sorted = useMemo(() => {
    let list = [...(data?.content ?? [])];
    if (status === "active") list = list.filter((c) => c.totalQuiz > 0);
    if (status === "pending") list = list.filter((c) => c.totalQuiz === 0);
    if (sort === "name_asc") list.sort((a, b) => a.name.localeCompare(b.name));
    if (sort === "name_desc") list.sort((a, b) => b.name.localeCompare(a.name));
    if (sort === "quizzes_desc")
      list.sort((a, b) => (b.totalQuiz ?? 0) - (a.totalQuiz ?? 0));
    if (sort === "quizzes_asc")
      list.sort((a, b) => (a.totalQuiz ?? 0) - (b.totalQuiz ?? 0));
    return list;
  }, [data, status, sort]);

  const commitSearch = () => {
    setCommittedSearch(searchInput.trim());
    setPage(0);
  };

  const clearSearch = () => {
    setSearchInput("");
    setCommittedSearch("");
    setPage(0);
  };

  const clearFilters = () => {
    setSearchInput("");
    setCommittedSearch("");
    setStatus("all");
    setSort("default");
    setPage(0);
  };

  const hasActiveFilters =
    committedSearch || status !== "all" || sort !== "default";
  const totalPages = data?.totalPages ?? 1;
  const totalElements = data?.totalElements ?? 0;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 bg-white dark:bg-[#080b14] transition-colors duration-300">
        <div className="relative">
          <div className="absolute inset-0 rounded-full border-2 border-slate-100 dark:border-sky-500/10" />
          <Loader2 className="w-10 h-10 animate-spin text-sky-600 dark:text-sky-400 dark:drop-shadow-[0_0_8px_rgba(56,189,248,0.5)]" />
        </div>

        <div className="flex flex-col items-center gap-1">
          <span className="text-xs font-mono tracking-[0.3em] text-slate-500 dark:text-sky-400/70 uppercase animate-pulse">
            Syncing Data
          </span>
          <div className="flex gap-1">
            <span className="w-1 h-1 rounded-full bg-sky-500/20 animate-[bounce_1s_infinite_100ms]" />
            <span className="w-1 h-1 rounded-full bg-sky-500/40 animate-[bounce_1s_infinite_200ms]" />
            <span className="w-1 h-1 rounded-full bg-sky-500/60 animate-[bounce_1s_infinite_300ms]" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 transition-colors duration-300">
      {/* ── Search Bar Section ── */}
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && commitSearch()}
            placeholder="Search sectors by name..."
            className="w-full bg-slate-50 dark:bg-[#0a0f1d] border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-9 py-2.5 text-sm font-mono text-slate-900 dark:text-slate-200 focus:outline-none focus:border-sky-500 transition-all"
          />
        </div>
        <button
          onClick={commitSearch}
          disabled={isFetching}
          className="px-6 py-2.5 bg-sky-600 dark:bg-sky-500 hover:bg-sky-700 dark:hover:bg-sky-400 active:scale-95 disabled:opacity-50 text-white text-sm font-mono font-semibold rounded-xl transition-all flex items-center justify-center gap-2"
        >
          {isFetching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          Search
        </button>
      </div>

      {/* ── Filters & Sort ── */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#0a0f1d] border border-slate-200 dark:border-slate-800 rounded-xl p-1">
          {(["all", "active", "pending"] as StatusFilter[]).map((v) => (
            <button
              key={v}
              onClick={() => {
                setStatus(v);
                setPage(0);
              }}
              className={`px-4 py-1.5 rounded-lg text-[11px] font-mono font-bold uppercase tracking-wider transition-all duration-200 ${
                status === v
                  ? "bg-white dark:bg-slate-800 text-sky-600 dark:text-sky-400 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        <div className="relative">
          <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as SortFilter);
              setPage(0);
            }}
            className="appearance-none bg-slate-100 dark:bg-[#0a0f1d] border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-10 py-2 text-[11px] font-mono text-slate-600 dark:text-slate-300 focus:outline-none focus:border-sky-500 transition-colors cursor-pointer"
          >
            <option value="default">Default order</option>
            <option value="name_asc">Name A → Z</option>
            <option value="name_desc">Name Z → A</option>
            <option value="quizzes_desc">Most quizzes first</option>
            <option value="quizzes_asc">Fewest quizzes first</option>
          </select>
        </div>

        <span className="ml-auto text-[10px] font-mono text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em]">
          {sorted.length} / {totalElements} Units
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {sorted.map((cat) => {
          const progressWidth = cat?.totalQuiz
            ? Math.min(cat.totalQuiz * 10, 100)
            : 5;
          return (
            <Link
              key={cat.id}
              href={`/quizzes/${cat.id}`}
              className="group block h-full"
            >
              <Card className="h-full bg-white dark:bg-[#0a0f1d] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden transition-all duration-300 group-hover:border-sky-500 group-hover:shadow-[0_0_20px_rgba(56,189,248,0.1)] relative">
                <div className="absolute top-0 inset-x-0 h-[2px] bg-sky-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

                <CardContent className="p-0 flex flex-col h-full">
                  <div className="p-4 pb-0">
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/50">
                      <Image
                        src={cat.imageUrl}
                        alt={cat.name}
                        fill
                        className="object-cover transition-all duration-500 contrast-[1.1] saturate-[1.2] brightness-[1.0] group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/5 dark:bg-sky-500/5 pointer-events-none" />
                      <div className="absolute top-3 right-3">
                        <div
                          className={`px-2 py-1 rounded-md text-[9px] font-black font-mono border backdrop-blur-md ${
                            cat.totalQuiz > 0
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                          }`}
                        >
                          {cat.totalQuiz > 0 ? "● ACTIVE" : "○ VOID"}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="p-5 flex flex-col flex-grow">
                    <div className="mb-4">
                      <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-sky-500 transition-colors">
                        {cat.name}
                      </h2>
                      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2 font-mono leading-relaxed">
                        {cat.description ||
                          "System descriptor missing. Initialization required."}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-100 dark:border-slate-800/50 mb-4">
                      <div>
                        <p className="text-[9px] font-mono text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                          Sector ID
                        </p>
                        <p className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                          #0{cat.id}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] font-mono text-slate-400 dark:text-slate-600 uppercase tracking-widest">
                          Modules
                        </p>
                        <p className="text-xs font-mono font-bold text-sky-600 dark:text-sky-400">
                          {cat.totalQuiz || 0}
                        </p>
                      </div>
                    </div>
                    <div className="mt-auto">
                      <div className="flex justify-between items-end mb-1.5">
                        <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-slate-600 uppercase">
                          Integrity
                        </span>
                        <span className="text-[10px] font-mono text-sky-600 dark:text-sky-400">
                          {progressWidth}%
                        </span>
                      </div>
                      <div className="h-1 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-sky-500 transition-all duration-1000 ease-out"
                          style={{ width: `${progressWidth}%` }}
                        />
                      </div>
                    </div>
                    <div className="mt-5 flex items-center justify-between group/btn">
                      <span className="text-[10px] font-mono text-slate-400 dark:text-slate-700 tracking-tighter italic">
                        READY_FOR_DEPLOYMENT
                      </span>
                      <div className="flex items-center gap-2 text-[10px] font-black font-mono text-sky-600 dark:text-sky-400 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                        ENTER <ArrowRight className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-10">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="px-4 py-2 text-[10px] font-mono font-bold uppercase bg-white dark:bg-[#0a0f1d] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 hover:border-sky-500 disabled:opacity-30 transition-all"
          >
            PREV
          </button>
          <div className="px-4 py-2 text-[10px] font-mono text-slate-400 border border-transparent">
            {page + 1} / {totalPages}
          </div>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            className="px-4 py-2 text-[10px] font-mono font-bold uppercase bg-white dark:bg-[#0a0f1d] border border-slate-200 dark:border-slate-800 rounded-lg text-slate-500 hover:border-sky-500 disabled:opacity-30 transition-all"
          >
            NEXT
          </button>
        </div>
      )}
    </div>
  );
}
