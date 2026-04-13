"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Loader2,
  ChevronLeft,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Save,
  Code2,
  HelpCircle,
} from "lucide-react";

import {
  useGetQuizByIdQuery,
  useUpdateQuizMutation,
  useAddQuestionToQuizMutation,
} from "@/lib/features/quizzes/quizzesSlice";
import { useGetCategoriesQuery } from "@/lib/features/categories/categoriesSlice";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// --- SCHEMAS ---

const quizSettingsSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  duration: z.coerce.number().min(1, "Must be at least 1 minute"),
  categoryId: z.number().min(1, "Please select a category"),
});

const questionSchema = z.object({
  text: z.string().min(1, "Question text is required"),
  questionType: z.enum(["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE"]),
  points: z.coerce.number().min(1),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  code: z.string().optional().nullable(),
  answers: z
    .array(
      z.object({
        text: z.string().min(1, "Answer text required"),
        correct: z.boolean(),
      }),
    )
    .min(2, "At least 2 answers required"),
});

type QuizSettingsValues = z.infer<typeof quizSettingsSchema>;
type QuestionFormValues = z.infer<typeof questionSchema>;

export default function EditQuizPage({ quizId }: { quizId: string }) {
  const router = useRouter();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // RTK Query hooks
  const { data: quiz, isLoading: isLoadingQuiz } = useGetQuizByIdQuery(quizId);
  const { data: categories } = useGetCategoriesQuery();
  const [updateQuiz, { isLoading: isUpdating }] = useUpdateQuizMutation();
  const [addQuestion, { isLoading: isAddingQuestion }] =
    useAddQuestionToQuizMutation();

  // 1. Quiz Settings Form
  const {
    control: quizControl,
    handleSubmit: handleQuizSubmit,
    reset: resetQuiz,
    formState: { errors: quizErrors },
  } = useForm<QuizSettingsValues>({
    resolver: zodResolver(quizSettingsSchema),
    defaultValues: { title: "", description: "", duration: 1, categoryId: 1 },
  });

  // 2. Add Question Form
  const {
    control: qControl,
    handleSubmit: handleQuestionSubmit,
    reset: resetQuestion,
    watch: watchQuestion,
    setValue: setQuestionValue,
  } = useForm<QuestionFormValues>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      text: "",
      questionType: "SINGLE_CHOICE",
      points: 5,
      difficulty: "EASY",
      code: "",
      answers: [
        { text: "", correct: false },
        { text: "", correct: false },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: qControl,
    name: "answers",
  });

  const selectedType = watchQuestion("questionType");

  // Sync Quiz data to form
  useEffect(() => {
    if (quiz) {
      resetQuiz({
        title: quiz.title ?? "",
        description: quiz.description ?? "",
        duration: quiz.duration ?? 1,
        categoryId: quiz.category?.id ?? quiz.categoryId ?? 1,
      });
    }
  }, [quiz, resetQuiz]);

  // Handle True/False auto-population
  useEffect(() => {
    if (selectedType === "TRUE_FALSE") {
      setQuestionValue("answers", [
        { text: "True", correct: false },
        { text: "False", correct: false },
      ]);
    }
  }, [selectedType, setQuestionValue]);

  const onUpdateQuiz = async (values: QuizSettingsValues) => {
    try {
      await updateQuiz({ id: Number(quizId), body: values }).unwrap();
    } catch (err) {
      console.error("Failed to update quiz settings", err);
    }
  };

  const onAddQuestion = async (values: QuestionFormValues) => {
    try {
      await addQuestion({
        quizId: quizId,
        ...values,
      }).unwrap();
      console.log("Values QUESTIONS ADD", values, quizId);
      setIsDialogOpen(false);
      resetQuestion();
    } catch (err) {
      console.error("Failed to add question", err);
    }
  };

  if (isLoadingQuiz) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-10">
      {/* HEADER */}
      <div className="flex items-center justify-between border-b pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Quiz</h1>
          <p className="text-muted-foreground">
            Manage settings and question bank.
          </p>
        </div>
        <Button variant="outline" onClick={() => router.back()}>
          <ChevronLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* LEFT: QUIZ SETTINGS */}
        <div className="lg:col-span-1">
          <form
            onSubmit={handleQuizSubmit(onUpdateQuiz)}
            className="space-y-6 bg-card border p-6 rounded-xl shadow-sm sticky top-8"
          >
            <h2 className="text-lg font-semibold">General Settings</h2>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Controller
                name="title"
                control={quizControl}
                render={({ field }) => <Input id="title" {...field} />}
              />
              {quizErrors.title && (
                <p className="text-xs text-destructive">
                  {quizErrors.title.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Controller
                name="categoryId"
                control={quizControl}
                render={({ field }) => (
                  <Select
                    value={String(field.value)}
                    onValueChange={(val) => field.onChange(Number(val))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories?.map((cat) => (
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
              <Label htmlFor="duration">Duration (Minutes)</Label>
              <Controller
                name="duration"
                control={quizControl}
                render={({ field }) => (
                  <Input id="duration" type="number" {...field} />
                )}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Controller
                name="description"
                control={quizControl}
                render={({ field }) => (
                  <Textarea
                    id="description"
                    className="min-h-[100px]"
                    {...field}
                  />
                )}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isUpdating}>
              {isUpdating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </form>
        </div>

        {/* RIGHT: QUESTIONS LIST */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">
              Questions ({quiz?.questions?.length || 0})
            </h2>

            {/* ADD QUESTION DIALOG */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" /> Add Question
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Create New Question</DialogTitle>
                </DialogHeader>

                <form
                  onSubmit={handleQuestionSubmit(onAddQuestion)}
                  className="space-y-6 pt-4"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Question Type</Label>
                      <Controller
                        name="questionType"
                        control={qControl}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="SINGLE_CHOICE">
                                Single Choice
                              </SelectItem>
                              <SelectItem value="MULTIPLE_CHOICE">
                                Multiple Choice
                              </SelectItem>
                              <SelectItem value="TRUE_FALSE">
                                True / False
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Difficulty</Label>
                      <Controller
                        name="difficulty"
                        control={qControl}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="EASY">Easy</SelectItem>
                              <SelectItem value="MEDIUM">Medium</SelectItem>
                              <SelectItem value="HARD">Hard</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Question Text</Label>
                    <Controller
                      name="text"
                      control={qControl}
                      render={({ field }) => (
                        <Textarea placeholder="What is..." {...field} />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                      <Code2 className="h-4 w-4" /> Code Snippet (Optional)
                    </Label>
                    <Controller
                      name="code"
                      control={qControl}
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          value={field.value ?? ""}
                          className="font-mono text-xs bg-slate-950 text-slate-50 min-h-[100px]"
                          placeholder="// paste code here..."
                        />
                      )}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Points</Label>
                    <Controller
                      name="points"
                      control={qControl}
                      render={({ field }) => <Input type="number" {...field} />}
                    />
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-base">Answers</Label>
                      {selectedType !== "TRUE_FALSE" && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => append({ text: "", correct: false })}
                        >
                          Add Option
                        </Button>
                      )}
                    </div>

                    <div className="space-y-3">
                      {fields.map((field, index) => (
                        <div key={field.id} className="flex items-center gap-3">
                          <Controller
                            name={`answers.${index}.correct`}
                            control={qControl}
                            render={({ field: checkField }) => (
                              <input
                                type={
                                  selectedType === "MULTIPLE_CHOICE"
                                    ? "checkbox"
                                    : "radio"
                                }
                                checked={checkField.value}
                                onChange={(e) => {
                                  if (selectedType !== "MULTIPLE_CHOICE") {
                                    fields.forEach((_, i) =>
                                      setQuestionValue(
                                        `answers.${i}.correct`,
                                        false,
                                      ),
                                    );
                                  }
                                  checkField.onChange(e.target.checked);
                                }}
                                className="h-5 w-5 accent-primary shrink-0"
                              />
                            )}
                          />
                          <Controller
                            name={`answers.${index}.text`}
                            control={qControl}
                            render={({ field: textField }) => (
                              <Input
                                {...textField}
                                readOnly={selectedType === "TRUE_FALSE"}
                                className={
                                  selectedType === "TRUE_FALSE"
                                    ? "bg-muted"
                                    : ""
                                }
                                placeholder={`Answer option ${index + 1}`}
                              />
                            )}
                          />
                          {selectedType !== "TRUE_FALSE" &&
                            fields.length > 2 && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => remove(index)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    disabled={isAddingQuestion}
                  >
                    {isAddingQuestion && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Question
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* QUESTIONS RENDERING */}
          <div className="space-y-4">
            {quiz?.questions?.map((q: any, idx: number) => (
              <div
                key={q.id}
                className="border rounded-xl p-6 bg-card shadow-sm space-y-4"
              >
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      Question {idx + 1}
                    </span>
                    <p className="text-lg font-semibold leading-tight">
                      {q.text}
                    </p>
                    {q.code && (
                      <pre className="mt-2 p-3 bg-slate-100 dark:bg-slate-900 rounded-md text-xs font-mono overflow-x-auto border">
                        <code>{q.code}</code>
                      </pre>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Badge variant="secondary">{q.difficulty}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {q.points} pts
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                  {q.answers.map((ans: any) => (
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
              </div>
            ))}

            {(!quiz?.questions || quiz.questions.length === 0) && (
              <div className="text-center py-20 border-2 border-dashed rounded-xl">
                <HelpCircle className="mx-auto h-12 w-12 text-muted-foreground/30" />
                <p className="mt-4 text-muted-foreground">
                  No questions found. Add your first one above!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
