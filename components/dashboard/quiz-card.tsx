"use client";

import { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useDeleteQuizMutation,
  useGetQuizzesQuery,
} from "@/lib/features/quizzes/quizzesSlice";
import { useGetCategoriesQuery } from "@/lib/features/categories/categoriesSlice";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  FileText,
  Plus,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  Search,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import DeleteModal from "../PopUp";
import { QuizResponse } from "@/lib/types/quiz";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

interface Filters {
  categoryId: string;
  durationMin: string;
  durationMax: string;
  questionsMin: string;
  questionsMax: string;
}

const defaultFilters: Filters = {
  categoryId: "",
  durationMin: "",
  durationMax: "",
  questionsMin: "",
  questionsMax: "",
};

export function QuizAdminTable() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<"duration" | "questions" | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "">("");
  const [selectedQuiz, setSelectedQuiz] = useState<QuizResponse | null>(null);
  const [deleteQuiz] = useDeleteQuizMutation();

  const submitSearch = () => {
    setDebouncedSearch(searchInput);
    setPage(0);
  };

  const {
    data: quizData,
    isLoading,
    isFetching,
    isError,
  } = useGetQuizzesQuery({
    page,
    size: pageSize,
    search: debouncedSearch || undefined,
    categoryId: filters.categoryId ? Number(filters.categoryId) : undefined,
  });

  // Categories are only for the dropdown — fetch all, no search filter here
  const { data: categories } = useGetCategoriesQuery({
    page: 0,
    size: 100,
  });

  const totalPages = quizData?.totalPages ?? 1;
  const totalElements = quizData?.totalElements ?? 0;
  const isFirst = quizData?.first ?? true;
  const isLast = quizData?.last ?? true;

  const filtered = useMemo(() => {
    let list = (quizData?.content ?? []).map((quiz) => ({
      ...quiz,
      questionCount: quiz.questions.length,
      totalPoints: quiz.questions.reduce((sum, q) => sum + q.points, 0),
    }));

    // categoryId is handled server-side via the API query
    if (filters.durationMin) {
      list = list.filter((q) => q.duration >= Number(filters.durationMin));
    }
    if (filters.durationMax) {
      list = list.filter((q) => q.duration <= Number(filters.durationMax));
    }
    if (filters.questionsMin) {
      list = list.filter(
        (q) => q.questionCount >= Number(filters.questionsMin),
      );
    }
    if (filters.questionsMax) {
      list = list.filter(
        (q) => q.questionCount <= Number(filters.questionsMax),
      );
    }
    if (sortField && sortOrder) {
      list = [...list].sort((a, b) => {
        const va = sortField === "duration" ? a.duration : a.questionCount;
        const vb = sortField === "duration" ? b.duration : b.questionCount;
        return sortOrder === "asc" ? va - vb : vb - va;
      });
    }
    return list;
  }, [quizData, filters, sortField, sortOrder]);

  const resetPage = () => setPage(0);

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    resetPage();
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    setSearchInput("");
    setDebouncedSearch("");
    resetPage();
  };

  const toggleSort = (field: "duration" | "questions") => {
    if (sortField !== field) {
      setSortField(field);
      setSortOrder("asc");
    } else if (sortOrder === "asc") setSortOrder("desc");
    else {
      setSortField("");
      setSortOrder("");
    }
  };

  const handleConfirmDelete = () => {
    deleteQuiz(selectedQuiz?.id);
    setSelectedQuiz(null);
  };

  const activeFilterCount =
    Object.values(filters).filter((v) => v !== "").length +
    (searchInput ? 1 : 0);

  const SortIndicator = ({ field }: { field: string }) =>
    sortField !== field ? (
      <span className="ml-1 text-muted-foreground/40">↕</span>
    ) : (
      <span className="ml-1 text-primary">
        {sortOrder === "asc" ? "↑" : "↓"}
      </span>
    );

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
        <p className="text-sm text-muted-foreground">Loading quizzes...</p>
      </div>
    );
  if (isError)
    return (
      <div className="p-8 text-center text-red-500">Error loading data.</div>
    );

  return (
    <div className="w-full space-y-4 p-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Quiz Management</h2>
          <p className="text-muted-foreground text-sm">
            {totalElements} total quiz{totalElements !== 1 ? "zes" : ""}
            {isFetching && (
              <span className="ml-2 inline-flex items-center gap-1 text-primary">
                <Loader2 className="w-3 h-3 animate-spin" /> syncing...
              </span>
            )}
          </p>
        </div>
        <Link href="/dashboard/create-quiz">
          <Button className="flex gap-2">
            <Plus className="w-4 h-4" /> Create New Quiz
          </Button>
        </Link>
      </div>

      {/* ── Search bar ── */}
      <div className="flex items-center gap-2 max-w-md">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            className="pl-9 pr-9 h-9 text-sm"
            placeholder="Search by quiz name..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submitSearch()}
          />
          {searchInput && (
            <X
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground cursor-pointer hover:text-foreground"
              onClick={() => {
                setSearchInput("");
                setDebouncedSearch("");
                resetPage();
              }}
            />
          )}
        </div>
        <Button size="sm" className="h-9 px-4" onClick={submitSearch}>
          Search
        </Button>
      </div>

      {/* ── Filter toggle + active chips ── */}
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={showFilters ? "default" : "outline"}
          size="sm"
          className="flex gap-2"
          onClick={() => setShowFilters((v) => !v)}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {activeFilterCount > 0 && (
            <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {filters.categoryId && (
          <Badge variant="secondary" className="flex gap-1 items-center">
            Category:{" "}
            {categories?.content?.find(
              (c) => String(c.id) === filters.categoryId,
            )?.name ?? `#${filters.categoryId}`}
            <X
              className="w-3 h-3 cursor-pointer"
              onClick={() => updateFilter("categoryId", "")}
            />
          </Badge>
        )}
        {(filters.durationMin || filters.durationMax) && (
          <Badge variant="secondary" className="flex gap-1 items-center">
            Duration: {filters.durationMin || "0"}–{filters.durationMax || "∞"}{" "}
            mins
            <X
              className="w-3 h-3 cursor-pointer"
              onClick={() => {
                updateFilter("durationMin", "");
                updateFilter("durationMax", "");
              }}
            />
          </Badge>
        )}
        {(filters.questionsMin || filters.questionsMax) && (
          <Badge variant="secondary" className="flex gap-1 items-center">
            Questions: {filters.questionsMin || "0"}–
            {filters.questionsMax || "∞"}
            <X
              className="w-3 h-3 cursor-pointer"
              onClick={() => {
                updateFilter("questionsMin", "");
                updateFilter("questionsMax", "");
              }}
            />
          </Badge>
        )}

        {activeFilterCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground flex gap-1"
          >
            <X className="w-3 h-3" /> Clear all
          </Button>
        )}

        <span className="ml-auto text-sm text-muted-foreground">
          {filtered.length} quiz{filtered.length !== 1 ? "zes" : ""} on this
          page
        </span>
      </div>

      {/* ── Filter panel ── */}
      {showFilters && (
        <div className="rounded-lg border bg-muted/30 p-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Category
            </label>
            <Select
              value={filters.categoryId || "all"}
              onValueChange={(v) =>
                updateFilter("categoryId", v === "all" ? "" : v)
              }
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories?.content?.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Duration (mins)
            </label>
            <div className="flex gap-2">
              <Input
                className="h-9 text-sm"
                placeholder="Min"
                type="number"
                min={0}
                value={filters.durationMin}
                onChange={(e) => updateFilter("durationMin", e.target.value)}
              />
              <Input
                className="h-9 text-sm"
                placeholder="Max"
                type="number"
                min={0}
                value={filters.durationMax}
                onChange={(e) => updateFilter("durationMax", e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Questions
            </label>
            <div className="flex gap-2">
              <Input
                className="h-9 text-sm"
                placeholder="Min"
                type="number"
                min={0}
                value={filters.questionsMin}
                onChange={(e) => updateFilter("questionsMin", e.target.value)}
              />
              <Input
                className="h-9 text-sm"
                placeholder="Max"
                type="number"
                min={0}
                value={filters.questionsMax}
                onChange={(e) => updateFilter("questionsMax", e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Table ── */}
      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Quiz Details</TableHead>
              <TableHead>
                <button
                  className="flex items-center text-sm font-medium hover:text-foreground transition-colors"
                  onClick={() => toggleSort("questions")}
                >
                  Questions <SortIndicator field="questions" />
                </button>
              </TableHead>
              <TableHead>
                <button
                  className="flex items-center text-sm font-medium hover:text-foreground transition-colors"
                  onClick={() => toggleSort("duration")}
                >
                  Duration <SortIndicator field="duration" />
                </button>
              </TableHead>
              <TableHead>Total Points</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-12"
                >
                  No quizzes match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((quiz) => {
                const categoryName =
                  categories?.content?.find((c) => c.id === quiz.categoryId)
                    ?.name ?? `Category #${quiz.categoryId}`;
                return (
                  <TableRow
                    key={quiz.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      #{quiz.id}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-medium text-sm">
                          {quiz.title}
                        </span>
                        <span className="text-xs text-muted-foreground line-clamp-1 max-w-[300px]">
                          {quiz.description}
                        </span>
                        <Badge variant="secondary" className="w-fit text-xs">
                          {categoryName}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="flex w-fit gap-1 font-normal"
                      >
                        <FileText className="w-3 h-3" />
                        {quiz.questionCount} Qs
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {quiz.duration} mins
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-primary">
                        {quiz.totalPoints} pts
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <Link href={`/dashboard/edit-quiz/${quiz.id}`}>
                            <DropdownMenuItem className="cursor-pointer text-blue-600 focus:text-blue-600">
                              <Edit className="mr-2 h-4 w-4" /> Edit Quiz
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => setSelectedQuiz(quiz)}
                            className="cursor-pointer text-destructive focus:text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete Quiz
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Pagination ── */}
      <div className="flex items-center justify-between text-sm text-muted-foreground flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              setPageSize(Number(v));
              resetPage();
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-4">
          <span>
            Page <span className="font-medium text-foreground">{page + 1}</span>{" "}
            / {totalPages} · {totalElements} total
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              // disabled={isFirst || isFetching}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              // disabled={isLast || isFetching}
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {selectedQuiz && (
        <DeleteModal
          item={selectedQuiz}
          onConfirm={handleConfirmDelete}
          onCancel={() => setSelectedQuiz(null)}
          type="quiz"
        />
      )}
    </div>
  );
}
