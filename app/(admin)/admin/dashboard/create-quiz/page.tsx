"use client";

import { useAddQuizMutation } from "@/lib/features/quizzes/quizzesSlice";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2, Plus, Trash2 } from "lucide-react";
import QuestionCard from "@/components/dashboard/add-quizzes/QuestionCard";
import { useGetCategoriesQuery } from "@/lib/features/categories/categoriesSlice";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const answerSchema = z.object({
  text: z.string().min(1, "Answer text is required"),
  correct: z.boolean(),
});
// In CreateQuizPage.tsx — update questionSchema to include optional code:

const questionSchema = z
  .object({
    text: z.string().min(1, "Question text is required"),
    questionType: z.enum(["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE"]),
    points: z.coerce.number().min(1, "Points must be at least 1"),
    difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
    code: z.string().nullable().optional(), // ← ADD THIS
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
    if (data.questionType === "MULTIPLE_CHOICE" && correctCount < 1) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least 1 correct answer is required",
        path: ["answers"],
      });
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

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-red-500 mt-1">{message}</p>;
}

export default function CreateQuizPage() {
  const [submitted, setSubmitted] = useState(false);
  const [createQuiz, { isLoading }] = useAddQuizMutation();

  const {
    control,
    handleSubmit,
    watch,
    getValues,
    setValue,
    reset,
    formState: { errors },
  } = useForm<QuizFormValues>({
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
  } = useFieldArray({ control, name: "questions" });

  const watchedQuestions = useWatch({ control, name: "questions" }) ?? [];
  const totalPoints = watchedQuestions.reduce(
    (sum, q) => sum + (Number(q?.points) || 0),
    0,
  );

  const { data: category } = useGetCategoriesQuery();

  const onSubmit = async (values: QuizFormValues) => {
    try {
      await createQuiz(values).unwrap();
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    }
  };
  if (submitted) {
    return (
      <div className=" bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Quiz Created!
          </h2>
          <p className="text-gray-500 mb-6">
            "{getValues("title")}" has been published successfully.
          </p>
          <Button
            onClick={() => {
              setSubmitted(false);
              reset();
            }}
          >
            Create Another Quiz
          </Button>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
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
                {watch("duration")} min
              </span>
            </div>
          )}
        </div>
      </header>

      <form onSubmit={handleSubmit(onSubmit)}>
        <main className="max-w-3xl mx-auto px-6 py-8 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">
              Quiz Details
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Title
                </label>
                <Controller
                  control={control}
                  name="title"
                  render={({ field }) => (
                    <Input placeholder="e.g. Java Basics Quiz" {...field} />
                  )}
                />
                <FieldError message={errors.title?.message} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Description
                </label>
                <Controller
                  control={control}
                  name="description"
                  render={({ field }) => (
                    <Textarea
                      placeholder="What will participants be tested on?"
                      rows={2}
                      className="resize-none"
                      {...field}
                    />
                  )}
                />
                <FieldError message={errors.description?.message} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Duration (minutes)
                  </label>
                  <Controller
                    control={control}
                    name="duration"
                    render={({ field }) => (
                      <Input type="number" min={1} {...field} />
                    )}
                  />
                  <FieldError message={errors.duration?.message} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Category
                  </label>
                  {/* <Controller
                    control={control}
                    name="categoryId"
                    render={({ field }) => (
                      <Input type="number" min={1} {...field} />
                    )}
                  /> */}
                  <Controller
                    control={control}
                    name={`categoryId`}
                    render={({ field }) => (
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {/* <SelectItem value="SINGLE_CHOICE">
                            Single Choice
                          </SelectItem>
                          <SelectItem value="MULTIPLE_CHOICE">
                            Multiple Choice
                          </SelectItem>
                          <SelectItem value="TRUE_FALSE">
                            True / False
                          </SelectItem> */}
                          {category?.map((c) => (
                            <SelectItem value={String(c.id)}>
                              {c.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />

                  <FieldError message={errors.categoryId?.message} />
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">
              Questions
              {questionFields.length > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-400">
                  ({questionFields.length})
                </span>
              )}
            </h2>
            <Button
              type="button"
              size="sm"
              onClick={() =>
                appendQuestion({
                  text: "",
                  questionType: "SINGLE_CHOICE",
                  points: 5,
                  difficulty: "EASY",
                  code: null,
                  answers: [],
                })
              }
            >
              <Plus className="w-4 h-4 mr-1.5" />
              Add Question
            </Button>
          </div>
          <FieldError
            message={
              errors.questions?.message ??
              (errors.questions?.root as any)?.message
            }
          />
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
          {questionFields.map((qField, qIndex) => (
            <QuestionCard
              key={qField.id}
              qIndex={qIndex}
              control={control}
              setValue={setValue}
              errors={errors}
              onRemove={() => removeQuestion(qIndex)}
            />
          ))}
          {questionFields.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">
                  {watch("title") || "Untitled Quiz"}
                </p>
                <p className="text-sm text-gray-400 mt-0.5">
                  {questionFields.length} question
                  {questionFields.length !== 1 ? "s" : ""} · {totalPoints} total
                  points · {watch("duration")} min
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
    </div>
  );
}
