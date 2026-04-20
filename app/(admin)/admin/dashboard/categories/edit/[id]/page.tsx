"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { ArrowLeft, CheckCircle2, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(255, "Name too long"),
  description: z.string().max(1000, "Description too long").optional(),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-sm text-red-500 mt-1">{message}</p>;
}

export default function EditCategoryPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [categoryName, setCategoryName] = useState("");

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", description: "", imageUrl: "" },
  });

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await fetch(`/api/categories`, { credentials: "include" });
        const categories = await res.json();
        const cat = categories?.content?.find((c: any) => String(c.id) === id);
        if (cat) {
          reset({
            name: cat.name ?? "",
            description: cat.description ?? "",
            imageUrl: cat.imageUrl ?? "",
          });
          setCategoryName(cat.name ?? "");
        }
      } catch {
        toast.error("Failed to load category");
      } finally {
        setLoading(false);
      }
    };
    fetchCategory();
  }, [id, reset]);

  const onSubmit = async (values: CategoryFormValues) => {
    setSaving(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            name: values.name,
            description: values.description || null,
            imageUrl: values.imageUrl || null,
          }),
        },
      );
      if (!res.ok) throw new Error();
      setCategoryName(values.name);
      setSubmitted(true);
    } catch {
      toast.error("Failed to update category");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Category Updated!
          </h2>
          <p className="text-gray-500 mb-6">
            &quot;{categoryName}&quot; has been updated successfully.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/dashboard/categories")}
            >
              Back to categories
            </Button>
            <Button onClick={() => setSubmitted(false)}>Keep editing</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-black p-6">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
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
                  <Input
                    placeholder="https://example.com/image.png"
                    {...field}
                  />
                )}
              />
              <FieldError message={errors.imageUrl?.message} />
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
