"use client";

import { useEffect } from "react";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Loader2, HelpCircle, Code2, Trash2 } from "lucide-react";
export const questionSchema = z.object({
  text: z.string().min(1),
  hint: z.string().optional().nullable(),
  questionType: z.enum(["SINGLE_CHOICE", "MULTIPLE_CHOICE", "TRUE_FALSE"]),
  points: z.coerce.number().min(1),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]),
  code: z.string().optional().nullable(),
  answers: z
    .array(
      z.object({
        text: z.string().min(1),
        correct: z.boolean(),
      }),
    )
    .min(2)
    .refine((a) => a.some((x) => x.correct), {
      message: "At least 1 correct answer required",
    }),
});

export type QuestionFormValues = z.infer<typeof questionSchema>;
type Props = {
  defaultValues?: Partial<QuestionFormValues>;
  onSubmit: (values: QuestionFormValues) => Promise<void>;
  loading?: boolean;
  submitLabel: string;
};
export default function QuestionForm({
  defaultValues,
  onSubmit,
  loading,
  submitLabel,
}: Props) {
  const { control, handleSubmit, reset, watch, setValue } =
    useForm<QuestionFormValues>({
      resolver: zodResolver(questionSchema),
      defaultValues: {
        text: "",
        hint: "",
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
  useEffect(() => {
    if (!defaultValues) return;

    console.log(defaultValues);
    if (defaultValues) {
      reset({
        text: defaultValues.text ?? "",
        hint: defaultValues.hint ?? "",
        questionType: defaultValues.questionType ?? "SINGLE_CHOICE",
        points: defaultValues.points ?? 5,
        difficulty: defaultValues.difficulty ?? "EASY",
        code: defaultValues.code ?? "",
        answers:
          defaultValues?.answers?.length > 0
            ? defaultValues.answers
            : [
                { text: "", correct: false },
                { text: "", correct: false },
              ],
      });
      console.log(
        "DEFAULT VALUES QUESTION DIFFICULTY ",
        defaultValues.difficulty,
      );
    }
  }, [defaultValues, reset]);

  const { fields, append, remove } = useFieldArray({
    control,
    name: "answers",
  });

  const type = watch("questionType");
  const answers = watch("answers");
  const correctCount = answers?.filter((a) => a.correct).length ?? 0;

  useEffect(() => {
    if (type === "TRUE_FALSE") {
      setValue("answers", [
        { text: "True", correct: false },
        { text: "False", correct: false },
      ]);
    }
  }, [type]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 pt-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Type</Label>
          <Controller
            name="questionType"
            control={control}
            render={({ field }) => (
              <Select
                key={`type-${field.value}`}
                onValueChange={field.onChange}
                value={field.value}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SINGLE_CHOICE">Single</SelectItem>
                  <SelectItem value="MULTIPLE_CHOICE">Multiple</SelectItem>
                  <SelectItem value="TRUE_FALSE">True/False</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </div>

        <div>
          <Label>Difficulty</Label>{" "}
          <Controller
            name="difficulty"
            control={control}
            render={({ field }) => (
              <Select
                key={`type-${field.value}`}
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

      {/* TEXT */}
      <div>
        <Label>Question</Label>
        <Controller
          name="text"
          control={control}
          render={({ field }) => (
            <Textarea {...field} placeholder="Write question..." />
          )}
        />
      </div>

      <div>
        <Label className="flex gap-2 items-center">
          <HelpCircle className="h-4 w-4" /> Hint
        </Label>
        <Controller
          name="hint"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              value={field.value ?? ""}
              placeholder="Hint for question..."
            />
          )}
        />
      </div>
      <div>
        <Label className="flex gap-2 items-center">
          <Code2 className="h-4 w-4" /> Code
        </Label>
        <Controller
          name="code"
          control={control}
          render={({ field }) => (
            <Textarea
              {...field}
              value={field.value ?? ""}
              placeholder="Code example... ( Optional )"
            />
          )}
        />
      </div>
      <div>
        <Label>Points</Label>
        <Controller
          name="points"
          control={control}
          render={({ field }) => (
            <Input
              type="number"
              {...field}
              placeholder="Point for question..."
            />
          )}
        />
      </div>
      <Separator />
      <div className="space-y-3">
        <div className="flex justify-between">
          <Label>Answers</Label>

          {type !== "TRUE_FALSE" && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => append({ text: "", correct: false })}
            >
              Add
            </Button>
          )}
        </div>

        {fields.map((f, i) => (
          <div key={f.id} className="flex gap-3 items-center">
            <Controller
              name={`answers.${i}.correct`}
              control={control}
              render={({ field }) => (
                <input
                  type={type === "MULTIPLE_CHOICE" ? "checkbox" : "radio"}
                  checked={field.value}
                  placeholder="Answers..."
                  onChange={(e) => {
                    if (type !== "MULTIPLE_CHOICE") {
                      fields.forEach((_, idx) =>
                        setValue(`answers.${idx}.correct`, false),
                      );
                    }
                    field.onChange(e.target.checked);
                  }}
                />
              )}
            />

            <Controller
              name={`answers.${i}.text`}
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  readOnly={type === "TRUE_FALSE"}
                  placeholder="Answers..."
                />
              )}
            />

            {type !== "TRUE_FALSE" && fields.length > 2 && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(i)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}

        {correctCount === 0 && (
          <p className="text-red-500 text-sm">
            Select at least 1 correct answer
          </p>
        )}
      </div>
      <Button
        type="submit"
        className="w-full"
        disabled={loading || correctCount === 0}
      >
        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        {submitLabel}
      </Button>
    </form>
  );
}
