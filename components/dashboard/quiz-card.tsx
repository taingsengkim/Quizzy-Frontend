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
  Eye,
  FileText,
  Plus,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
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
  const { data: quizzes, isLoading, isError } = useGetQuizzesQuery();

  const [selectedQuiz, setSelectedQuiz] = useState<QuizResponse | null>(null);
  const [deleteQuiz] = useDeleteQuizMutation();

  const [page, setPage] = useState(1);
  const { data: categories } = useGetCategoriesQuery({
    page,
    size: 10,
  });
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [sortField, setSortField] = useState<"duration" | "questions" | "">("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | "">("");

  const handleConfirmDelete = () => {
    deleteQuiz(selectedQuiz?.id);
    setSelectedQuiz(null);
  };

  const updateFilter = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const clearFilters = () => {
    setFilters(defaultFilters);
    setPage(1);
  };

  const toggleSort = (field: "duration" | "questions") => {
    if (sortField !== field) {
      setSortField(field);
      setSortOrder("asc");
    } else if (sortOrder === "asc") {
      setSortOrder("desc");
    } else {
      setSortField("");
      setSortOrder("");
    }
  };

  const activeFilterCount = Object.values(filters).filter(
    (v) => v !== "",
  ).length;

  const filtered = useMemo(() => {
    if (!quizzes) return [];

    let result = quizzes?.content?.map((quiz) => ({
      ...quiz,
      questionCount: quiz.questions.length,
      totalPoints: quiz.questions.reduce((sum, q) => sum + q.points, 0),
    }));

    if (filters.categoryId !== "") {
      result = result.filter(
        (q) => q.categoryId === Number(filters.categoryId),
      );
    }
    if (filters.durationMin !== "") {
      result = result.filter((q) => q.duration >= Number(filters.durationMin));
    }
    if (filters.durationMax !== "") {
      result = result.filter((q) => q.duration <= Number(filters.durationMax));
    }
    if (filters.questionsMin !== "") {
      result = result.filter(
        (q) => q.questionCount >= Number(filters.questionsMin),
      );
    }
    if (filters.questionsMax !== "") {
      result = result.filter(
        (q) => q.questionCount <= Number(filters.questionsMax),
      );
    }

    if (sortField && sortOrder) {
      result = [...result].sort((a, b) => {
        const va = sortField === "duration" ? a.duration : a.questionCount;
        const vb = sortField === "duration" ? b.duration : b.questionCount;
        return sortOrder === "asc" ? va - vb : vb - va;
      });
    }

    return result;
  }, [quizzes, filters, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const SortIndicator = ({ field }: { field: string }) => {
    if (sortField !== field)
      return <span className="ml-1 text-muted-foreground/40">↕</span>;
    return (
      <span className="ml-1 text-primary">
        {sortOrder === "asc" ? "↑" : "↓"}
      </span>
    );
  };

  if (isLoading)
    return <div className="p-8 text-center">Loading quizzes...</div>;
  if (isError)
    return (
      <div className="p-8 text-center text-red-500">Error loading data.</div>
    );

  return (
    <div className="w-full space-y-4 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-black">
            Quiz Management
          </h2>
          <p className="text-muted-foreground text-sm">
            Manage your curriculum, track points, and update quiz content.
          </p>
        </div>
        <Link href="/admin/dashboard/create-quiz">
          <Button className="flex gap-2">
            <Plus className="w-4 h-4" /> Create New Quiz
          </Button>
        </Link>
      </div>

      {/* Filter Toggle Bar */}
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

        {/* Active filter chips */}
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
          {filtered.length} quiz{filtered.length !== 1 ? "zes" : ""} found
        </span>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="rounded-lg border bg-muted/30 p-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Category */}
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

          {/* Duration */}
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

          {/* Questions */}
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

      {/* Table */}
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
            {paginated.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center text-muted-foreground py-12"
                >
                  No quizzes match the current filters.
                </TableCell>
              </TableRow>
            ) : (
              paginated.map((quiz) => {
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
                          {/* <DropdownMenuItem className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem> */}
                          <Link href={`/admin/dashboard/edit-quiz/${quiz.id}`}>
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

      {/* Pagination */}
      <div className="flex items-center justify-between text-sm text-muted-foreground flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <Select
            value={String(pageSize)}
            onValueChange={(v) => {
              setPageSize(Number(v));
              setPage(1);
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
            {filtered.length === 0
              ? "0 results"
              : `${(page - 1) * pageSize + 1}–${Math.min(
                  page * pageSize,
                  filtered.length,
                )} of ${filtered.length}`}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
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
