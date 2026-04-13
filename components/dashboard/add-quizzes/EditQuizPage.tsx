"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import {
  useGetQuizByIdQuery,
  useUpdateQuizMutation,
} from "@/lib/features/quizzes/quizzesSlice";

import { useGetCategoriesQuery } from "@/lib/features/categories/categoriesSlice";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const schema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  duration: z.coerce.number().min(1),
  categoryId: z.number().min(1),
});

type FormValues = z.infer<typeof schema>;

export default function EditQuizPage({ quizId }: { quizId: string }) {
  const router = useRouter();

  const { data: quiz } = useGetQuizByIdQuery(quizId);
  const { data: categories } = useGetCategoriesQuery();

  const [updateQuiz, { isLoading }] = useUpdateQuizMutation();

  const { control, handleSubmit, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      duration: 1,
      categoryId: 1,
    },
  });
  useEffect(() => {
    if (!quiz) return;
    reset({
      title: quiz.title ?? "",
      description: quiz.description ?? "",
      duration: quiz.duration ?? 1,
      categoryId: quiz.category?.id ?? quiz.categoryId ?? 1,
    });
  }, [quiz, reset]);

  const onSubmit = async (values: FormValues) => {
    await updateQuiz({
      id: quizId,
      body: values,
    }).unwrap();

    router.push(`/admin/quizzes/${quizId}/questions`);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 p-6">
      <h1 className="text-xl font-bold">Edit Quiz</h1>

      <Controller
        control={control}
        name="title"
        render={({ field }) => <Input {...field} />}
      />
      <Controller
        control={control}
        name="description"
        render={({ field }) => <Textarea {...field} />}
      />
      <Controller
        control={control}
        name="duration"
        render={({ field }) => <Input type="number" {...field} />}
      />
      <Controller
        control={control}
        name="categoryId"
        render={({ field }) => (
          <Select
            value={String(field.value)}
            onValueChange={(val) => field.onChange(Number(val))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>

            <SelectContent>
              {categories?.map((c) => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      />
      <Button type="submit" disabled={isLoading}>
        Save Quiz
      </Button>
    </form>
  );
}
