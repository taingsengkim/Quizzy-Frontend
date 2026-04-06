"use client";

import { useAddQuizMutation } from "@/lib/features/quizzes/quizzesSlice";
import { CreateAnswer, CreateQuestion, CreateQuiz } from "@/lib/types/quiz";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";
import { CheckCircle2, Plus, Trash2, ArrowRight, Loader2 } from "lucide-react";

// ─── Zod Schema ────────────────────────────────────────────────────────────────

const answerSchema = z.object({
  text: z.string().min(1, "Answer text is required"),
  correct: z.boolean(),
});

const questionSchema = z
  .object({
    text: z.string().min(1, "Question text is required"),
    questionType: z.enum(["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE"]),
    points: z.coerce.number().min(1, "Points must be at least 1"),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
    answers: z.array(answerSchema).min(2, "At least 2 answers are required"),
  })
  .superRefine((data, ctx) => {
    const correctCount = data.answers.filter((a) => a.correct).length;

    if (
      data.questionType === "SINGLE_CHOICE" ||
      data.questionType === "TRUE_FALSE"
    ) {
      if (correctCount !== 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Exactly 1 correct answer is required",
          path: ["answers"],
        });
      }
    }

    if (data.questionType === "MULTIPLE_CHOICE") {
      if (correctCount < 1) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "At least 1 correct answer is required",
          path: ["answers"],
        });
      }
    }
  });

const quizSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  categoryId: z.coerce.number().min(1, "Category ID is required"),
  questions: z.array(questionSchema).min(1, "Add at least one question"),
});

type QuizFormValues = z.infer<typeof quizSchema>;

// ─── Helpers ───────────────────────────────────────────────────────────────────

const DIFFICULTY_BADGE: Record<string, string> = {
  EASY: "bg-green-100 text-green-700 border-green-200",
  MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-200",
  HARD: "bg-red-100 text-red-700 border-red-200",
};

const TYPE_LABELS: Record<string, string> = {
  SINGLE_CHOICE: "Single Choice",
  MULTIPLE_CHOICE: "Multiple Choice",
  TRUE_FALSE: "True / False",
};

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function CreateQuizPage() {
  const [submitted, setSubmitted] = useState(false);
  const [createQuiz, { isLoading }] = useAddQuizMutation();

  const form = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema),
    defaultValues: {
      title: "",
      description: "",
      duration: 30,
      categoryId: 1,
      questions: [],
    },
  });

  const {
    fields: questionFields,
    append: appendQuestion,
    remove: removeQuestion,
  } = useFieldArray({ control: form.control, name: "questions" });

  const watchedQuestions =
    useWatch({ control: form.control, name: "questions" }) ?? [];
  const totalPoints = watchedQuestions.reduce(
    (sum, q) => sum + (Number(q?.points) || 0),
    0,
  );

  const addQuestion = () => {
    appendQuestion({
      text: "",
      questionType: "SINGLE_CHOICE",
      points: 5,
      difficulty: "EASY",
      answers: [],
    });
  };

  const onSubmit = async (values: QuizFormValues) => {
    try {
      await createQuiz(values).unwrap();
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Quiz Created!
          </h2>
          <p className="text-gray-500 mb-6">
            "{form.getValues("title")}" has been published successfully.
          </p>
          <Button
            onClick={() => {
              setSubmitted(false);
              form.reset();
            }}
          >
            Create Another Quiz
          </Button>
        </div>
      </div>
    );
  }

  // ── Main form ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-gray-900 rounded-md flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <span className="font-bold text-gray-900 text-lg">QuizBuilder</span>
          </div>
          {questionFields.length > 0 && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="bg-gray-100 px-3 py-1 rounded-full">
                {questionFields.length} questions
              </span>
              <span className="bg-gray-100 px-3 py-1 rounded-full">
                {totalPoints} pts
              </span>
              <span className="bg-gray-100 px-3 py-1 rounded-full">
                {form.watch("duration")} min
              </span>
            </div>
          )}
        </div>
      </header>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
            {/* ── Quiz Details ──────────────────────────────────────────────── */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">
                Quiz Details
              </p>
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. Java Basics Quiz" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What will participants be tested on?"
                          rows={2}
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duration (minutes)</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="categoryId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category ID</FormLabel>
                        <FormControl>
                          <Input type="number" min={1} {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>

            {/* ── Questions header ──────────────────────────────────────────── */}
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">
                Questions
                {questionFields.length > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-400">
                    ({questionFields.length})
                  </span>
                )}
              </h2>
              <Button type="button" onClick={addQuestion} size="sm">
                <Plus className="w-4 h-4 mr-1.5" />
                Add Question
              </Button>
            </div>

            {/* Root-level questions error (e.g. "Add at least one question") */}
            {form.formState.errors.questions?.root?.message && (
              <p className="text-sm text-red-500">
                {form.formState.errors.questions.root.message}
              </p>
            )}
            {typeof form.formState.errors.questions?.message === "string" && (
              <p className="text-sm text-red-500">
                {form.formState.errors.questions.message}
              </p>
            )}

            {/* ── Empty state ───────────────────────────────────────────────── */}
            {questionFields.length === 0 && (
              <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-6 h-6 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">
                  No questions yet. Click "Add Question" to get started.
                </p>
              </div>
            )}

            {/* ── Question cards ────────────────────────────────────────────── */}
            {questionFields.map((qField, qIndex) => (
              <QuestionCard
                key={qField.id}
                qIndex={qIndex}
                form={form}
                onRemove={() => removeQuestion(qIndex)}
              />
            ))}

            {/* ── Submit bar ────────────────────────────────────────────────── */}
            {questionFields.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">
                    {form.watch("title") || "Untitled Quiz"}
                  </p>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {questionFields.length} question
                    {questionFields.length !== 1 ? "s" : ""} · {totalPoints}{" "}
                    total points · {form.watch("duration")} min
                  </p>
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      Publish Quiz
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </main>
        </form>
      </Form>
    </div>
  );
}

// ─── Question Card Sub-component ───────────────────────────────────────────────

function QuestionCard({
  qIndex,
  form,
  onRemove,
}: {
  qIndex: number;
  form: ReturnType<typeof useForm<QuizFormValues>>;
  onRemove: () => void;
}) {
  const {
    fields: answerFields,
    append: appendAnswer,
    remove: removeAnswer,
  } = useFieldArray({
    control: form.control,
    name: `questions.${qIndex}.answers`,
  });

  const questionType = useWatch({
    control: form.control,
    name: `questions.${qIndex}.questionType`,
  });
  const difficulty = useWatch({
    control: form.control,
    name: `questions.${qIndex}.difficulty`,
  });
  const points = useWatch({
    control: form.control,
    name: `questions.${qIndex}.points`,
  });
  const answers =
    useWatch({
      control: form.control,
      name: `questions.${qIndex}.answers`,
    }) ?? [];

  const isSingleSelect =
    questionType === "SINGLE_CHOICE" || questionType === "TRUE_FALSE";

  const toggleCorrect = (aIndex: number) => {
    if (isSingleSelect) {
      answers.forEach((_, j) => {
        form.setValue(
          `questions.${qIndex}.answers.${j}.correct`,
          j === aIndex,
          {
            shouldValidate: true,
          },
        );
      });
    } else {
      const current = form.getValues(
        `questions.${qIndex}.answers.${aIndex}.correct`,
      );
      form.setValue(`questions.${qIndex}.answers.${aIndex}.correct`, !current, {
        shouldValidate: true,
      });
    }
  };

  // answers-level error (from superRefine)
  const answersError =
    (form.formState.errors.questions?.[qIndex]?.answers as any)?.message ??
    (form.formState.errors.questions?.[qIndex]?.answers as any)?.root?.message;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 bg-gray-900 text-white rounded-md text-xs font-bold flex items-center justify-center">
            {qIndex + 1}
          </span>
          {difficulty && (
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full border ${DIFFICULTY_BADGE[difficulty]}`}
            >
              {difficulty}
            </span>
          )}
          {questionType && (
            <span className="text-xs text-gray-500 bg-white border border-gray-200 px-2.5 py-1 rounded-full">
              {TYPE_LABELS[questionType]}
            </span>
          )}
          <span className="text-xs text-gray-500 bg-white border border-gray-200 px-2.5 py-1 rounded-full">
            {points ?? 0} pts
          </span>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-gray-400 hover:text-red-500 h-8 w-8"
          onClick={onRemove}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-6 space-y-5">
        {/* Question text */}
        <FormField
          control={form.control}
          name={`questions.${qIndex}.text`}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Question</FormLabel>
              <FormControl>
                <Input placeholder="Enter your question..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Type / Difficulty / Points */}
        <div className="grid grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name={`questions.${qIndex}.questionType`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="SINGLE_CHOICE">Single Choice</SelectItem>
                    <SelectItem value="MULTIPLE_CHOICE">
                      Multiple Choice
                    </SelectItem>
                    <SelectItem value="TRUE_FALSE">True / False</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`questions.${qIndex}.difficulty`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulty</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="EASY">Easy</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HARD">Hard</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name={`questions.${qIndex}.points`}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Points</FormLabel>
                <FormControl>
                  <Input type="number" min={1} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        {/* Answers */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <FormLabel>Answers</FormLabel>
            <span className="text-xs text-gray-400">
              {questionType === "MULTIPLE_CHOICE"
                ? "Check all correct answers"
                : "Select the correct answer"}
            </span>
          </div>

          <div className="space-y-2">
            {answerFields.map((aField, aIndex) => {
              const isCorrect = answers[aIndex]?.correct ?? false;
              return (
                <div
                  key={aField.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                    isCorrect
                      ? "bg-green-50 border-green-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  {/* Correct toggle */}
                  <button
                    type="button"
                    onClick={() => toggleCorrect(aIndex)}
                    className={`flex-shrink-0 w-5 h-5 flex items-center justify-center border-2 transition-colors ${
                      isSingleSelect ? "rounded-full" : "rounded"
                    } ${
                      isCorrect
                        ? "bg-green-500 border-green-500 text-white"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    {isCorrect && (
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>

                  <FormField
                    control={form.control}
                    name={`questions.${qIndex}.answers.${aIndex}.text`}
                    render={({ field }) => (
                      <FormItem className="flex-1 space-y-0">
                        <FormControl>
                          <input
                            className={`w-full bg-transparent text-sm text-gray-900 placeholder-gray-400 focus:outline-none ${
                              isCorrect ? "font-medium" : ""
                            }`}
                            placeholder={`Answer option ${aIndex + 1}`}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {isCorrect && (
                    <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-0.5 rounded-full">
                      Correct
                    </span>
                  )}

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-gray-300 hover:text-red-400 flex-shrink-0"
                    onClick={() => removeAnswer(aIndex)}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Answers-level validation error */}
          {answersError && (
            <p className="text-sm text-red-500 mt-2">{answersError}</p>
          )}

          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mt-3 text-gray-500 px-0 hover:text-gray-900"
            onClick={() => appendAnswer({ text: "", correct: false })}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add answer option
          </Button>
        </div>
      </div>
    </div>
  );
}
