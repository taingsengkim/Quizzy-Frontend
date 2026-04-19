"use client";

import { useState } from "react";
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
  FileText,
  Plus,
} from "lucide-react";
import Link from "next/link";
import CategoryReponse, { QuizResponse } from "@/lib/types/quiz";
import {
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
} from "@/lib/features/categories/categoriesSlice";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import DeleteModal from "@/components/PopUp";
import { useDeleteQuizMutation } from "@/lib/features/quizzes/quizzesSlice";

export default function CategoryTable() {
  const {
    data: categories,
    isLoading,
    isError,
  } = useGetCategoriesQuery({
    page: 0,
    size: 10,
  });
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryReponse | null>(null);
  const [deleteCategory] = useDeleteCategoryMutation();
  const handleConfirmDelete = async () => {
    await deleteCategory(selectedCategory?.id);
    setSelectedCategory(null);
  };

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
            Quiz Management
          </h2>
          <p className="text-muted-foreground text-sm">
            Manage your curriculum, track points, and update quiz content.
          </p>
        </div>
        <Link href="/admin/dashboard/categories/create">
          <Button className="flex gap-2">
            <Plus className="w-4 h-4" /> Create New Category
          </Button>
        </Link>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Total Quizzes</TableHead>
              <TableHead>Image Url</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories?.content?.map((cate) => {
              return (
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
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        {cate.totalQuiz}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">
                        <Image
                          src={cate.imageUrl}
                          width={50}
                          height={50}
                          alt="cate.name"
                        />
                      </span>
                    </div>
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
                        <Link href={`/admin/dashboard/categories/${cate?.id}`}>
                          <DropdownMenuItem className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" /> View Details
                          </DropdownMenuItem>
                        </Link>
                        <Link
                          href={`/admin/dashboard/categories/edit/${cate.id}`}
                        >
                          <DropdownMenuItem className="cursor-pointer text-blue-600 focus:text-blue-600">
                            <Edit className="mr-2 h-4 w-4" /> Edit Cateogry
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
              );
            })}
          </TableBody>
        </Table>
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
