"use client";

import { Controller, useFieldArray, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";

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

export default function QuestionCard({
  qIndex,
  control,
  setValue,
  errors,
  onRemove,
}: any) {
  const {
    fields: answerFields,
    append: appendAnswer,
    remove: removeAnswer,
  } = useFieldArray({ control, name: `questions.${qIndex}.answers` });

  const questionType = useWatch({
    control,
    name: `questions.${qIndex}.questionType`,
  });

  const difficulty = useWatch({
    control,
    name: `questions.${qIndex}.difficulty`,
  });

  const points = useWatch({
    control,
    name: `questions.${qIndex}.points`,
  });

  const answers =
    useWatch({ control, name: `questions.${qIndex}.answers` }) ?? [];

  const isSingleSelect =
    questionType === "SINGLE_CHOICE" || questionType === "TRUE_FALSE";

  const handleToggleCorrect = (aIndex: number) => {
    if (isSingleSelect) {
      answers.forEach((_: any, j: number) => {
        setValue(`questions.${qIndex}.answers.${j}.correct`, j === aIndex, {
          shouldValidate: true,
        });
      });
    } else {
      const current = answers[aIndex]?.correct ?? false;
      setValue(`questions.${qIndex}.answers.${aIndex}.correct`, !current, {
        shouldValidate: true,
      });
    }
  };

  const answersError =
    (errors.questions?.[qIndex]?.answers as any)?.message ??
    (errors.questions?.[qIndex]?.answers as any)?.root?.message;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 bg-gray-900 text-white rounded-md text-xs font-bold flex items-center justify-center">
            {qIndex + 1}
          </span>

          {difficulty && (
            <span
              className={`text-xs px-2 py-1 rounded border ${DIFFICULTY_BADGE[difficulty]}`}
            >
              {difficulty}
            </span>
          )}

          {questionType && (
            <span className="text-xs text-gray-500 border px-2 py-1 rounded">
              {TYPE_LABELS[questionType]}
            </span>
          )}

          <span className="text-xs text-gray-500 border px-2 py-1 rounded">
            {points ?? 0} pts
          </span>
        </div>

        <Button variant="ghost" size="icon" onClick={onRemove}>
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {/* BODY */}
      <div className="p-6 space-y-5">
        {/* Question */}
        <Controller
          control={control}
          name={`questions.${qIndex}.text`}
          render={({ field }) => (
            <Input placeholder="Enter your question..." {...field} />
          )}
        />

        {/* Type / Difficulty / Points */}
        <div className="grid grid-cols-3 gap-4">
          <Controller
            control={control}
            name={`questions.${qIndex}.questionType`}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SINGLE_CHOICE">Single Choice</SelectItem>
                  <SelectItem value="MULTIPLE_CHOICE">
                    Multiple Choice
                  </SelectItem>
                  <SelectItem value="TRUE_FALSE">True / False</SelectItem>
                </SelectContent>
              </Select>
            )}
          />

          <Controller
            control={control}
            name={`questions.${qIndex}.difficulty`}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value}>
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

          <Controller
            control={control}
            name={`questions.${qIndex}.points`}
            render={({ field }) => <Input type="number" {...field} />}
          />
        </div>

        <Separator />

        {/* Answers */}
        {answerFields.map((aField, aIndex) => {
          const isCorrect = answers[aIndex]?.correct ?? false;

          return (
            <div key={aField.id} className="flex gap-2">
              <button type="button" onClick={() => handleToggleCorrect(aIndex)}>
                {isCorrect ? "✔" : "○"}
              </button>

              <Controller
                control={control}
                name={`questions.${qIndex}.answers.${aIndex}.text`}
                render={({ field }) => (
                  <input {...field} className="flex-1 border p-2" />
                )}
              />

              <Button onClick={() => removeAnswer(aIndex)}>
                <Trash2 />
              </Button>
            </div>
          );
        })}

        <Button onClick={() => appendAnswer({ text: "", correct: false })}>
          <Plus /> Add Answer
        </Button>

        {answersError && <p className="text-red-500 text-sm">{answersError}</p>}
      </div>
    </div>
  );
}
