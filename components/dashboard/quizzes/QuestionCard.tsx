"use client";

import { useState } from "react";
import {
  CheckCircle2,
  Circle,
  HelpCircle,
  Code2,
  Pencil,
  Trash2,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import CodeBlock from "@/components/quiz/code-display";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import QuestionModal from "./QuestionModal";

export interface Answer {
  id: number;
  text: string;
  correct: boolean;
}
export interface Question {
  id: number;
  text: string;
  hint?: string | null;
  code?: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  points: number;
  questionType: "SINGLE_CHOICE" | "MULTIPLE_CHOICE" | "TRUE_FALSE";
  answers: Answer[];
}

export interface QuestionCardProps {
  question: Question;
  index: number;
  quizId: string;
  onDelete: (questionId: number) => Promise<void>;
}

const difficultyColors: Record<string, string> = {
  EASY: "bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400",
  MEDIUM:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-400",
  HARD: "bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400",
};

export function QuestionCard({
  question,
  index,
  quizId,
  onDelete,
}: QuestionCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDelete(question.id);
    } finally {
      setIsDeleting(false);
    }
  };
  return (
    <div className="border rounded-xl p-6 bg-card shadow-sm space-y-4">
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-1 flex-1 min-w-0">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
            Question {index + 1}
          </span>
          <p className="text-lg font-semibold leading-tight">
            {question?.text}
          </p>

          {question?.hint && (
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
              <HelpCircle className="h-3 w-3 shrink-0" />
              {question?.hint}
            </p>
          )}

          {question?.code && (
            <div className="mt-2">
              <pre className="p-3  dark:bg-slate-900 rounded-md text-xs font-mono overflow-x-auto ">
                <CodeBlock code={question?.code} />
              </pre>
            </div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <Badge
            className={difficultyColors[question?.difficulty]}
            variant="outline"
          >
            {question?.difficulty}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {question?.points} pts
          </span>
          <div className="flex items-center gap-1 mt-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsEditOpen(true)}
            >
              <Pencil className="h-4 w-4" />
            </Button>

            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete this question?</DialogTitle>
                  <DialogDescription>
                    This will permanently remove "{question?.text}". This action
                    cannot be undone.
                  </DialogDescription>
                </DialogHeader>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteOpen(false)}
                  >
                    Cancel
                  </Button>

                  <Button
                    variant="destructive"
                    onClick={async () => {
                      await handleDelete();
                      setIsDeleteOpen(false);
                    }}
                  >
                    Delete
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        {question?.answers.map((ans) => (
          <div
            key={ans.id}
            className={`flex items-center p-3 rounded-lg border text-sm transition-all ${
              ans.correct
                ? "bg-green-50 border-green-200 text-green-800 dark:bg-green-950/30 dark:border-green-800 dark:text-green-400"
                : "bg-background border-input"
            }`}
          >
            {ans.correct ? (
              <CheckCircle2 className="mr-3 h-4 w-4 text-green-600 shrink-0" />
            ) : (
              <Circle className="mr-3 h-4 w-4 text-muted-foreground shrink-0" />
            )}
            {ans.text}
          </div>
        ))}
      </div>

      <QuestionModal
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        quizId={quizId}
        mode="edit"
        question={question}
      />
    </div>
  );
}
