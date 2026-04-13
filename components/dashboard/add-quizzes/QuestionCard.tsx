"use client";

import { Controller, useFieldArray, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Code2, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

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
  const [showCode, setShowCode] = useState(false);

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

  const handleRemoveCode = () => {
    setValue(`questions.${qIndex}.code`, null);
    setShowCode(false);
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

          {/* code indicator badge */}
          {showCode && (
            <span className="text-xs text-violet-600 bg-violet-50 border border-violet-200 px-2 py-1 rounded flex items-center gap-1">
              <Code2 className="w-3 h-3" />
              code
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Toggle code button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              if (showCode) {
                handleRemoveCode();
              } else {
                setShowCode(true);
              }
            }}
            className={`text-xs gap-1.5 h-8 px-3 ${
              showCode
                ? "text-violet-600 bg-violet-50 hover:bg-violet-100"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            {showCode ? "Remove Code" : "Add Code"}
          </Button>

          <Button variant="ghost" size="icon" onClick={onRemove}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* BODY */}
      <div className="p-6 space-y-5">
        {/* Question text */}
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

        {/* ── Code snippet block (optional) ── */}
        {showCode && (
          <div className="rounded-xl border border-violet-200 bg-violet-50/40 overflow-hidden">
            {/* mini title bar */}
            <div className="flex items-center justify-between px-4 py-2 bg-[#1e1e2e] border-b border-slate-700">
              <div className="flex items-center gap-2">
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-400/70" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                </div>
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest ml-1">
                  code snippet
                </span>
              </div>
              <button
                type="button"
                onClick={handleRemoveCode}
                className="text-slate-500 hover:text-rose-400 transition-colors"
                title="Remove code"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <Controller
              control={control}
              name={`questions.${qIndex}.code`}
              render={({ field }) => (
                <Textarea
                  {...field}
                  value={field.value ?? ""}
                  placeholder={
                    '// paste your code here\nSystem.out.println("Hello!");'
                  }
                  className="font-mono text-sm bg-[#1e1e2e] border-0 rounded-none resize-none min-h-[140px] placeholder:text-slate-600 focus-visible:ring-0 focus-visible:ring-offset-0"
                  spellCheck={false}
                />
              )}
            />
          </div>
        )}

        <Separator />

        {/* Answers */}
        {answerFields.map((aField, aIndex) => {
          const isCorrect = answers[aIndex]?.correct ?? false;

          return (
            <div key={aField.id} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleToggleCorrect(aIndex)}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                  isCorrect
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "border-gray-300 text-gray-300 hover:border-gray-400"
                }`}
              >
                {isCorrect && (
                  <svg
                    className="w-3 h-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={3}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </button>

              <Controller
                control={control}
                name={`questions.${qIndex}.answers.${aIndex}.text`}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder={`Answer ${aIndex + 1}`}
                    className={`flex-1 ${
                      isCorrect ? "border-emerald-300 bg-emerald-50/50" : ""
                    }`}
                  />
                )}
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeAnswer(aIndex)}
                className="text-gray-400 hover:text-red-500 flex-shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          );
        })}

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => appendAnswer({ text: "", correct: false })}
          className="w-full border-dashed"
        >
          <Plus className="w-4 h-4 mr-1.5" />
          Add Answer
        </Button>

        {answersError && <p className="text-red-500 text-sm">{answersError}</p>}
      </div>
    </div>
  );
}
