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
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Plus,
  Search,
  X,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import Link from "next/link";
import CategoryReponse from "@/lib/types/quiz";
import {
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
} from "@/lib/features/categories/categoriesSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import DeleteModal from "@/components/PopUp";

type QuizFilter = "all" | "with-quizzes" | "no-quizzes";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export default function CategoryTable() {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [quizFilter, setQuizFilter] = useState<QuizFilter>("all");

  const [selectedCategory, setSelectedCategory] =
    useState<CategoryReponse | null>(null);

  const {
    data: categories,
    isLoading,
    isError,
    isFetching,
  } = useGetCategoriesQuery({ page, size: pageSize });

  const [deleteCategory] = useDeleteCategoryMutation();
  const totalPages = categories?.totalPages ?? 1;
  const totalElements = categories?.totalElements ?? 0;
  const isFirst = page === 0;
  const isLast = page >= totalPages - 1;

  const handleConfirmDelete = async () => {
    await deleteCategory(selectedCategory?.id);
    setSelectedCategory(null);
  };

  const handleClearFilters = () => {
    setSearchInput("");
    setQuizFilter("all");
  };

  const handlePageSizeChange = (val: string) => {
    setPageSize(Number(val));
    setPage(0);
  };

  const goToPage = (p: number) => {
    setPage(Math.max(0, Math.min(totalPages - 1, p)));
  };

  const hasActiveFilters = searchInput !== "" || quizFilter !== "all";
  const filteredCategories = useMemo(() => {
    if (!categories?.content) return [];
    return categories.content.filter((cate) => {
      const matchesSearch =
        searchInput === "" ||
        cate.name.toLowerCase().includes(searchInput.toLowerCase()) ||
        cate.description?.toLowerCase().includes(searchInput.toLowerCase());

      const matchesQuizFilter =
        quizFilter === "all" ||
        (quizFilter === "with-quizzes" && cate.totalQuiz > 0) ||
        (quizFilter === "no-quizzes" && cate.totalQuiz === 0);

      return matchesSearch && matchesQuizFilter;
    });
  }, [categories?.content, searchInput, quizFilter]);

  // Page window: up to 5 buttons around current page
  const pageWindow = useMemo(() => {
    const delta = 2;
    const start = Math.max(0, page - delta);
    const end = Math.min(totalPages - 1, page + delta);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [page, totalPages]);

  if (isLoading)
    return <div className="p-8 text-center">Loading categories...</div>;
  if (isError)
    return (
      <div className="p-8 text-center text-red-500">Error loading data.</div>
    );

  return (
    <div className="w-full space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-black">
            Cateogry Management
          </h2>
          <p className="text-muted-foreground text-sm">
            Manage your curriculum, track points, and update quiz content.
          </p>
        </div>
        <Link href="/dashboard/categories/create">
          <Button className="flex gap-2">
            <Plus className="w-4 h-4" /> Create New Category
          </Button>
        </Link>
      </div>
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or description..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-8 pr-8"
          />
          {searchInput && (
            <button
              onClick={() => setSearchInput("")}
              className="absolute right-2.5 top-2.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={quizFilter}
            onValueChange={(v) => setQuizFilter(v as QuizFilter)}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by quizzes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="with-quizzes">With Quizzes</SelectItem>
              <SelectItem value="no-quizzes">No Quizzes</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearFilters}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" /> Clear filters
          </Button>
        )}

        <span className="text-sm text-muted-foreground ml-auto">
          {isFetching ? "Loading..." : `${totalElements} total categories`}
        </span>
      </div>
      {/* Table */}
      <div
        className={`rounded-md border bg-card transition-opacity ${
          isFetching ? "opacity-50 pointer-events-none" : ""
        }`}
      >
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Total Quizzes</TableHead>
              <TableHead>Image</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCategories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-10 text-muted-foreground"
                >
                  No categories match your filters.
                </TableCell>
              </TableRow>
            ) : (
              filteredCategories.map((cate) => (
                <TableRow
                  key={cate.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    #{cate.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{cate.name}</span>
                      <span className="text-xs text-muted-foreground line-clamp-1 max-w-[300px]">
                        {cate.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={cate.totalQuiz > 0 ? "default" : "secondary"}
                    >
                      {cate.totalQuiz} quiz{cate.totalQuiz !== 1 ? "zes" : ""}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Image
                      src={cate.imageUrl}
                      width={50}
                      height={50}
                      alt={cate.name}
                      className="rounded object-cover"
                    />
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
                        <Link href={`/dashboard/categories/${cate?.id}`}>
                          <DropdownMenuItem className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                        </Link>
                        <Link href={`/dashboard/categories/edit/${cate.id}`}>
                          <DropdownMenuItem className="cursor-pointer text-blue-600 focus:text-blue-600">
                            <Edit className="mr-2 h-4 w-4" /> Edit Category
                          </DropdownMenuItem>
                        </Link>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => setSelectedCategory(cate)}
                          className="cursor-pointer text-destructive focus:text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> Delete Category
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
        {/* Rows per page */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>Rows per page:</span>
          <Select value={String(pageSize)} onValueChange={handlePageSizeChange}>
            <SelectTrigger className="w-[70px] h-8">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <SelectItem key={size} value={String(size)}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <span className="text-sm text-muted-foreground">
          Page {page + 1} of {totalPages}
        </span>
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => goToPage(0)}
            disabled={isFirst || isFetching}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => goToPage(page - 1)}
            disabled={isFirst || isFetching}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {pageWindow.map((p) => (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="icon"
              className="h-8 w-8"
              onClick={() => goToPage(p)}
              disabled={isFetching}
            >
              {p + 1}
            </Button>
          ))}

          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => goToPage(page + 1)}
            disabled={isLast || isFetching}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => goToPage(totalPages - 1)}
            disabled={isLast || isFetching}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {selectedCategory && (
        <DeleteModal
          item={selectedCategory}
          onConfirm={handleConfirmDelete}
          onCancel={() => setSelectedCategory(null)}
          type="category"
        />
      )}
    </div>
  );
}
