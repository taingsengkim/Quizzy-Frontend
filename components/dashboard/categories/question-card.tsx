import { useState } from "react";
import { Question } from "../quizzes/QuestionCard";
import {
  Check,
  CheckSquare,
  ChevronDown,
  ChevronRight,
  Circle,
  Lightbulb,
  X,
} from "lucide-react";
import CodeBlock from "@/components/quiz/code-display";

export default function QuestionCardQuizDetail({
  question,
  index,
}: {
  question: Question;
  index: number;
}) {
  const difficultyConfig = {
    EASY: {
      label: "Easy",
      cls: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    MEDIUM: {
      label: "Medium",
      cls: "bg-amber-50 text-amber-700 border-amber-200",
    },
    HARD: { label: "Hard", cls: "bg-rose-50 text-rose-700 border-rose-200" },
  };
  const [open, setOpen] = useState(false);
  const correctCount = question.answers.filter((a) => a.correct).length;
  function DifficultyBadge({ level }: { level: Question["difficulty"] }) {
    const cfg = difficultyConfig[level] ?? difficultyConfig.EASY;
    return (
      <span
        className={`text-[10px] font-semibold tracking-wide uppercase px-2 py-0.5 rounded-full border ${cfg.cls}`}
      >
        {cfg.label}
      </span>
    );
  }

  function TypeBadge({ type }: { type: Question["questionType"] }) {
    const isMulti = type === "MULTIPLE_CHOICE";
    return (
      <span
        className={`inline-flex items-center gap-1 text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-full border ${
          isMulti
            ? "bg-violet-50 text-violet-700 border-violet-200"
            : "bg-sky-50 text-sky-700 border-sky-200"
        }`}
      >
        {isMulti ? (
          <CheckSquare className="w-2.5 h-2.5" />
        ) : (
          <Circle className="w-2.5 h-2.5" />
        )}
        {isMulti ? "Multi" : "Single"}
      </span>
    );
  }

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden bg-white transition-shadow hover:shadow-sm">
      {/* Header */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start gap-3 px-4 py-3 text-left"
      >
        <span className="flex-shrink-0 mt-0.5 w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-mono font-bold flex items-center justify-center">
          {index + 1}
        </span>
        <span className="flex-1 text-sm text-gray-800 font-medium leading-snug">
          {question.text}
        </span>
        <div className="flex-shrink-0 flex items-center gap-2 ml-2">
          <DifficultyBadge level={question.difficulty} />
          <TypeBadge type={question.questionType} />
          <span className="text-xs font-semibold text-gray-400">
            {question.points}pt
          </span>
          {open ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {open && (
        <div className="border-t border-gray-100 px-4 pb-4 pt-3 space-y-3 bg-gray-50/60">
          {question.code && <CodeBlock code={question.code} />}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                Answers
              </p>
              <p className="text-[10px] text-gray-400">
                <span className="text-emerald-600 font-semibold">
                  {correctCount}
                </span>{" "}
                correct
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {question.answers.map((a, ai) => (
                <div
                  key={a.id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm ${
                    a.correct
                      ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                      : "bg-white border-gray-100 text-gray-600"
                  }`}
                >
                  {a.correct ? (
                    <span className="flex-shrink-0 w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </span>
                  ) : (
                    <span className="flex-shrink-0 w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center">
                      <X className="w-2.5 h-2.5 text-gray-400" />
                    </span>
                  )}
                  <span className="text-xs font-mono text-gray-300 w-4">
                    {String.fromCharCode(65 + ai)}.
                  </span>
                  <span className={a.correct ? "font-medium" : ""}>
                    {a.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Hint */}
          {question.hint && (
            <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-100">
              <Lightbulb className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">{question.hint}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
