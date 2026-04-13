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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  useDeleteQuizMutation,
  useGetQuizzesQuery,
} from "@/lib/features/quizzes/quizzesSlice";
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  FileText,
  Plus,
} from "lucide-react";
import Link from "next/link";
import DeleteModal from "../PopUp";
import { QuizResponse } from "@/lib/types/quiz";

export function QuizAdminTable() {
  const { data: quizzes, isLoading, isError } = useGetQuizzesQuery();
  const [selectedQuiz, setSelectedQuiz] = useState<QuizResponse | null>(null);
  const [deleteQuiz] = useDeleteQuizMutation();

  const handleConfirmDelete = () => {
    deleteQuiz(selectedQuiz?.id);
    setSelectedQuiz(null);
  };

  if (isLoading)
    return <div className="p-8 text-center">Loading quizzes...</div>;
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
        <Link href="/admin/dashboard/create-quiz">
          <Button className="flex gap-2">
            <Plus className="w-4 h-4" /> Create New Quiz
          </Button>
        </Link>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead className="w-[80px]">ID</TableHead>
              <TableHead>Quiz Details</TableHead>
              <TableHead>Questions</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Total Points</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quizzes?.map((quiz) => {
              const totalPoints = quiz.questions.reduce(
                (sum, q) => sum + q.points,
                0,
              );
              return (
                <TableRow
                  key={quiz.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    #{quiz.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm">{quiz.title}</span>
                      <span className="text-xs text-muted-foreground line-clamp-1 max-w-[300px]">
                        {quiz.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="flex w-fit gap-1 font-normal"
                    >
                      <FileText className="w-3 h-3" />
                      {quiz.questions.length} Qs
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {quiz.duration} mins
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-primary">
                      {totalPoints} pts
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
                        <DropdownMenuItem className="cursor-pointer">
                          <Eye className="mr-2 h-4 w-4" /> View Details
                        </DropdownMenuItem>
                        {/* ── Edit now navigates to the edit page ── */}
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
            })}
          </TableBody>
        </Table>
      </div>

      {selectedQuiz && (
        <DeleteModal
          quiz={selectedQuiz}
          onConfirm={handleConfirmDelete}
          onCancel={() => setSelectedQuiz(null)}
        />
      )}
    </div>
  );
}
