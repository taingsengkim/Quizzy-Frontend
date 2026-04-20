"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Loader2,
  ChevronLeft,
  Plus,
  Save,
  Clock,
  BookOpen,
  LayoutGrid,
  FileQuestion,
  Settings2,
  Sparkles,
} from "lucide-react";
import {
  useGetQuizByIdQuery,
  useUpdateQuizMutation,
  useDeleteQuestionMutation,
} from "@/lib/features/quizzes/quizzesSlice";
import { useGetCategoriesQuery } from "@/lib/features/categories/categoriesSlice";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { QuestionCard } from "./QuestionCard";
import QuestionModal from "./QuestionModal";
import { toast } from "sonner";

const quizSettingsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  duration: z.coerce.number().min(1, "Must be at least 1 minute"),
  categoryId: z.number().min(1, "Please select a category"),
});

type QuizSettingsValues = z.infer<typeof quizSettingsSchema>;

export default function EditQuizPage({ quizId }: { quizId: string }) {
  const router = useRouter();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const { data: quiz, isLoading: isLoadingQuiz } = useGetQuizByIdQuery(quizId);
  const [page, setPage] = useState(0);

  const { data: categories } = useGetCategoriesQuery({
    page,
    size: 10,
  });
  const [updateQuiz, { isLoading: isUpdating }] = useUpdateQuizMutation();
  const [deleteQuestion] = useDeleteQuestionMutation();
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<QuizSettingsValues>({
    resolver: zodResolver(quizSettingsSchema) as any,
    defaultValues: { title: "", description: "", duration: 1, categoryId: 1 },
  });

  useEffect(() => {
    if (quiz) {
      reset({
        title: quiz.title ?? "",
        description: quiz.description ?? "",
        duration: quiz.duration ?? 1,
        categoryId: quiz.category?.id ?? quiz.categoryId ?? 1,
      });
    }
  }, [quiz, reset]);

  const onUpdateQuiz = async (values: QuizSettingsValues) => {
    try {
      await updateQuiz({ id: Number(quizId), body: values }).unwrap();
      toast.success("Quiz settings saved successfully");
    } catch (err) {
      toast.error("Failed to update quiz settings");
    }
  };

  const handleDeleteQuestion = async (questionId: number) => {
    try {
      await deleteQuestion({ quizId, questionId }).unwrap();
      toast.success("Question removed");
    } catch (err) {
      toast.error("Failed to delete question");
    }
  };

  if (isLoadingQuiz) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">
          Loading quiz workspace...
        </p>
      </div>
    );
  }

  const totalPoints =
    quiz?.questions?.reduce((acc: number, q: any) => acc + q.points, 0) || 0;

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/50 pb-20">
      <div className="sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex flex-col">
              <h1 className="text-sm font-semibold leading-none">
                {quiz?.title || "Untitled Quiz"}
              </h1>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
                Quiz Editor
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isDirty && (
              <span className="text-xs text-amber-600 font-medium mr-2 animate-pulse">
                Unsaved changes
              </span>
            )}
            <Button
              onClick={handleSubmit(onUpdateQuiz)}
              disabled={isUpdating || !isDirty}
              size="sm"
              className="shadow-sm"
            >
              {isUpdating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Config
            </Button>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Questions",
              value: quiz?.questions?.length || 0,
              icon: FileQuestion,
              color: "text-blue-500",
            },
            {
              label: "Total Points",
              value: totalPoints,
              icon: Sparkles,
              color: "text-amber-500",
            },
            {
              label: "Duration",
              value: `${quiz?.duration || 0}m`,
              icon: Clock,
              color: "text-emerald-500",
            },
            {
              label: "Category",
              value:
                categories?.content?.find((c) => c.id === quiz?.categoryId)
                  ?.name ?? "N/A",
              icon: LayoutGrid,
              color: "text-purple-500",
            },
          ].map((stat, i) => (
            <Card key={i} className="border-none shadow-sm">
              <CardContent className="p-4 flex items-center gap-4">
                <div
                  className={`p-2 rounded-lg bg-slate-100 dark:bg-slate-800 ${stat.color}`}
                >
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">
                    {stat.label}
                  </p>
                  <p className="text-lg font-bold">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-4 space-y-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle className="text-md flex items-center gap-2">
                  <Settings2 className="h-4 w-4 text-primary" />
                  General Configuration
                </CardTitle>
                <CardDescription>
                  Basic information and quiz rules
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="text-xs uppercase tracking-wider font-bold text-muted-foreground"
                  >
                    Title
                  </Label>
                  <Controller
                    name="title"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        className="bg-slate-50/50 border-slate-200 focus-visible:ring-primary"
                        placeholder="Enter quiz title..."
                      />
                    )}
                  />
                  {errors.title && (
                    <p className="text-[10px] text-destructive font-medium">
                      {errors.title.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider font-bold text-muted-foreground">
                    Category
                  </Label>
                  <Controller
                    name="categoryId"
                    control={control}
                    render={({ field }) => (
                      <Select
                        value={field.value ? String(field.value) : ""}
                        onValueChange={(val) => field.onChange(Number(val))}
                      >
                        <SelectTrigger className="bg-slate-50/50 border-slate-200">
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>

                        <SelectContent>
                          {categories?.content?.map((cat) => (
                            <SelectItem key={cat.id} value={String(cat.id)}>
                              {cat.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="duration"
                    className="text-xs uppercase tracking-wider font-bold text-muted-foreground"
                  >
                    Limit (Minutes)
                  </Label>
                  <Controller
                    name="duration"
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          {...field}
                          className="pl-9 bg-slate-50/50 border-slate-200"
                        />
                      </div>
                    )}
                  />
                </div>

                <div className="space-y-2">
                  <Label
                    htmlFor="description"
                    className="text-xs uppercase tracking-wider font-bold text-muted-foreground"
                  >
                    Description
                  </Label>
                  <Controller
                    name="description"
                    control={control}
                    render={({ field }) => (
                      <Textarea
                        className="min-h-[120px] bg-slate-50/50 border-slate-200 resize-none"
                        placeholder="What is this quiz about?"
                        {...field}
                      />
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </aside>
          <section className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-4 rounded-xl  ">
              <div>
                <h2 className="text-lg font-bold">Question Bank</h2>
                <p className="text-xs text-muted-foreground">
                  Manage your questions and answers
                </p>
              </div>
              <Button
                size="sm"
                className="rounded-full px-4"
                onClick={() => setIsAddOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </div>

            <div className="space-y-4  rounded-lg">
              {quiz?.questions?.map((q: any, idx: number) => (
                <div key={q.id} className="group relative ">
                  <QuestionCard
                    question={q}
                    index={idx}
                    quizId={quizId}
                    onDelete={handleDeleteQuestion}
                  />
                </div>
              ))}

              {(!quiz?.questions || quiz.questions.length === 0) && (
                <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-2xl bg-slate-50/50 border-slate-200">
                  <div className="h-16 w-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                    <BookOpen className="h-8 w-8 text-slate-300" />
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    No questions yet
                  </h3>
                  <p className="text-sm text-muted-foreground max-w-[250px] text-center mt-1">
                    Start building your quiz by adding your first
                    multiple-choice or true/false question.
                  </p>
                  <Button
                    variant="outline"
                    className="mt-6 rounded-full"
                    onClick={() => setIsAddOpen(true)}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Question
                  </Button>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
      <QuestionModal
        open={isAddOpen}
        onOpenChange={setIsAddOpen}
        quizId={quizId}
        mode="create"
      />
    </div>
  );
}
