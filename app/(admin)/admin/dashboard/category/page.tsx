"use client";

import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { CheckCircle2, Loader2 } from "lucide-react";
import { useAddCategoryMutation } from "@/lib/features/categories/categoriesSlice";

// --- Zod schema ---
const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name too long"),
  description: z.string().max(1000, "Description too long").optional(),
  imageUrl: z.string().url("Must be a valid URL").optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

// --- Field error component ---
function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-red-500 mt-1">{message}</p>;
}

export default function CategoryPage() {
  const [submitted, setSubmitted] = useState(false);
  const [addCategory, { isLoading }] = useAddCategoryMutation();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: "",
      description: "",
      imageUrl: "",
    },
  });

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      await addCategory(values).unwrap();
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Category Created!
          </h2>
          <p className="text-gray-500 mb-6">
            "{control._formValues.name}" has been added successfully.
          </p>
          <Button
            onClick={() => {
              setSubmitted(false);
              reset();
            }}
          >
            Add Another Category
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-black bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h1 className="text-xl font-bold mb-4 text-black">Create Category</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Name
            </label>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Input placeholder="Category name" {...field} />
              )}
            />
            <FieldError message={errors.name?.message} />
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
                  placeholder="Description (optional)"
                  rows={3}
                  {...field}
                />
              )}
            />
            <FieldError message={errors.description?.message} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Image URL
            </label>
            <Controller
              control={control}
              name="imageUrl"
              render={({ field }) => (
                <Input placeholder="https://example.com/image.png" {...field} />
              )}
            />
            <FieldError message={errors.imageUrl?.message} />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Category"
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
