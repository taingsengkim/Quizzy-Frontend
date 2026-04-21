"use client";

import React, { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { CheckCircle2, Loader2, UploadCloud, X, ImageIcon } from "lucide-react";
import { useAddCategoryMutation } from "@/lib/features/categories/categoriesSlice";
import { useRouter } from "next/navigation";

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

async function uploadToImgBB(file: File): Promise<string> {
  const formData = new FormData();
  formData.append("image", file);

  const res = await fetch(
    `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMGBB_API_KEY}`,
    { method: "POST", body: formData },
  );

  if (!res.ok) throw new Error("Image upload failed");
  const data = await res.json();
  return data.data.url as string;
}

export default function CreateCategoryPage() {
  const [submitted, setSubmitted] = useState(false);
  const [addCategory, { isLoading }] = useAddCategoryMutation();
  const router = useRouter();

  // Image upload state
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", description: "", imageUrl: "" },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type & size (max 5MB)
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image must be under 5MB.");
      return;
    }

    setUploadError(null);
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    try {
      const url = await uploadToImgBB(file);
      setValue("imageUrl", url, { shouldValidate: true });
    } catch {
      setUploadError("Upload failed. Please try again.");
      setPreview(null);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    setValue("imageUrl", "");
    setUploadError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

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
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-10 text-center max-w-md w-full">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Category Created!
          </h2>
          <p className="text-gray-500 mb-6">
            &ldquo;{control._formValues.name}&rdquo; has been added
            successfully.
          </p>
          <Button
            onClick={() => {
              setSubmitted(false);
              setPreview(null);
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
    <div className="min-h-screen text-black p-6">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h1 className="text-xl font-bold mb-4 text-black">Create Category</h1>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Name */}
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

          {/* Description */}
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

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Image
            </label>

            {preview ? (
              // Preview state
              <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200 group">
                <img
                  src={preview}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 text-white animate-spin" />
                    <span className="text-white text-sm ml-2">
                      Uploading...
                    </span>
                  </div>
                )}
                {!uploading && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 w-7 h-7 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>
            ) : (
              // Drop zone
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-36 border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-xl flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-500 transition-colors bg-gray-50 hover:bg-gray-100"
              >
                <UploadCloud className="w-8 h-8" />
                <span className="text-sm font-medium">
                  Click to upload image
                </span>
                <span className="text-xs">PNG, JPG, GIF up to 5MB</span>
              </button>
            )}

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />

            {uploadError && (
              <p className="text-sm text-red-500 mt-1">{uploadError}</p>
            )}
            <FieldError message={errors.imageUrl?.message} />
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button type="submit" disabled={isLoading || uploading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Category"
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
  );
}
