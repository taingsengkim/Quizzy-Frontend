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

  // Two separate states: what's typed vs what's been submitted
  const [searchInput, setSearchInput] = useState("");
  const [committedSearch, setCommittedSearch] = useState("");

  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortFilter>("default");

  // Search is sent to the server only when committed
  const { data, isLoading, isFetching } = useGetCategoriesQuery({
    page,
    size: PAGE_SIZE,
    search: committedSearch || undefined,
  });

  // Sort and status filter client-side (no need for a server round-trip)
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
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <Loader2 className="w-10 h-10 animate-spin text-sky-500/50" />
        <span className="text-xs font-mono tracking-widest text-slate-500 uppercase">
          Syncing Data...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Search bar with button ── */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && commitSearch()}
            placeholder="Search sectors by name..."
            className="w-full bg-[#0a0f1d] border border-slate-800 rounded-xl pl-10 pr-9 py-2.5 text-sm font-mono text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500 transition-colors"
          />
          {searchInput && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={commitSearch}
          disabled={isFetching}
          className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 active:scale-95 disabled:opacity-50 text-white text-sm font-mono font-semibold rounded-xl transition-all flex items-center gap-2"
        >
          {isFetching ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          Search
        </button>
      </div>

      {/* ── Filter + Sort bar ── */}
      <div className="flex flex-wrap gap-2 items-center">
        {/* Status pills */}
        <div className="flex items-center gap-1 bg-[#0a0f1d] border border-slate-800 rounded-xl p-1">
          {(["all", "active", "pending"] as StatusFilter[]).map((v) => (
            <button
              key={v}
              onClick={() => {
                setStatus(v);
                setPage(0);
              }}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-mono font-semibold uppercase tracking-wider transition-all duration-200 ${
                status === v
                  ? "bg-sky-500 text-white"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              {v}
            </button>
          ))}
        </div>

        {/* Sort dropdown */}
        <div className="relative">
          <SlidersHorizontal className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as SortFilter);
              setPage(0);
            }}
            className="appearance-none bg-[#0a0f1d] border border-slate-800 rounded-xl pl-9 pr-8 py-2 text-[11px] font-mono text-slate-300 focus:outline-none focus:border-sky-500 transition-colors cursor-pointer"
          >
            <option value="default">Default order</option>
            <option value="name_asc">Name A → Z</option>
            <option value="name_desc">Name Z → A</option>
            <option value="quizzes_desc">Most quizzes first</option>
            <option value="quizzes_asc">Fewest quizzes first</option>
          </select>
        </div>

        {/* Clear all */}
        {hasActiveFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-mono text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/30 bg-[#0a0f1d] transition-all"
          >
            <X className="w-3 h-3" /> Clear all
          </button>
        )}

        {/* Count */}
        <span className="ml-auto text-xs font-mono text-slate-500 uppercase tracking-widest">
          {sorted.length} / {totalElements} sector
          {totalElements !== 1 ? "s" : ""}
          {isFetching && (
            <span className="ml-2 inline-flex items-center gap-1 text-sky-500">
              <Loader2 className="w-3 h-3 animate-spin" /> syncing...
            </span>
          )}
        </span>
      </div>

      {/* Active search badge */}
      {committedSearch && (
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-500">Results for:</span>
          <span className="flex items-center gap-1.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 px-3 py-1 rounded-full">
            &quot;{committedSearch}&quot;
            <button onClick={clearSearch}>
              <X className="w-3 h-3" />
            </button>
          </span>
        </div>
      )}

      {/* ── Cards grid ── */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[30vh] gap-3">
          <span className="text-4xl">🔍</span>
          <p className="text-sm font-mono text-slate-500 uppercase tracking-widest">
            No sectors match your query
          </p>
          <button
            onClick={clearFilters}
            className="text-xs font-mono text-sky-400 hover:text-sky-300 underline underline-offset-4 transition-colors"
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {sorted.map((cat) => {
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
                      <div className="w-[52px] h-[52px] bg-slate-900 border border-slate-800 group-hover:border-sky-500 rounded-[14px] flex items-center justify-center transition-colors duration-300 shrink-0">
                        <Image
                          src={cat.imageUrl}
                          alt={"img of " + cat.name}
                          width={40}
                          height={40}
                          className="h-10 w-10 rounded-lg object-cover"
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

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-4">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
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
            className="px-4 py-2 text-xs font-mono uppercase tracking-widest bg-[#0a0f1d] border border-slate-800 rounded-xl text-slate-400 hover:border-sky-500 hover:text-sky-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}
