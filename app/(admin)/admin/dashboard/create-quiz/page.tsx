"use client";

import { useAddQuizMutation } from "@/lib/features/quizzes/quizzesSlice";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { Loader2, ArrowRight } from "lucide-react";
import { useGetCategoriesQuery } from "@/lib/features/categories/categoriesSlice";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
const quizSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  categoryId: z.coerce.number().min(1, "Category is required"),
  questions: z.array(z.any()).optional(),
});

type QuizFormValues = z.infer<typeof quizSchema>;
export default function CreateQuizPage() {
  const router = useRouter();
  const [createQuiz, { isLoading }] = useAddQuizMutation();
  const [page, setPage] = useState(0);
  const { data: categories } = useGetCategoriesQuery({
    page,
    size: 10,
  });
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<QuizFormValues>({
    resolver: zodResolver(quizSchema) as any,
    defaultValues: {
      title: "",
      description: "",
      duration: 1,
      categoryId: 1,
      questions: [],
    },
  });

  const onSubmit = async (values: QuizFormValues) => {
    try {
      const res = await createQuiz({
        ...values,
        questions: [],
      }).unwrap();
      router.push(`/admin/dashboard/edit-quiz/${res.id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen  flex items-center justify-center p-6">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 w-full max-w-xl space-y-6"
      >
        <h2 className="text-2xl font-bold text-gray-900">Create New Quiz</h2>
        <div>
          <label className="text-sm font-medium text-gray-700">Title</label>
          <Controller
            name="title"
            control={control}
            render={({ field }) => (
              <Input placeholder="e.g. Java Basics Quiz" {...field} />
            )}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">
            Description
          </label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <Textarea placeholder="What will this quiz test?" {...field} />
            )}
          />
          {errors.description && (
            <p className="text-red-500 text-sm mt-1">
              {errors.description.message}
            </p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">
            Duration (minutes)
          </label>
          <Controller
            name="duration"
            control={control}
            render={({ field }) => (
              <Input
                type="number"
                min={1}
                value={field.value}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            )}
          />
          {errors.duration && (
            <p className="text-red-500 text-sm mt-1">
              {errors.duration.message}
            </p>
          )}
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700">Category</label>
          <Controller
            name="categoryId"
            control={control}
            render={({ field }) => (
              <Select
                value={String(field.value)}
                onValueChange={(val) => field.onChange(Number(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories?.content?.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.categoryId && (
            <p className="text-red-500 text-sm mt-1">
              {errors.categoryId.message}
            </p>
          )}
        </div>
        <div className="flex gap-10">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                Create Quiz
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
