import { Quiz } from "@/app/(admin)/dashboard/categories/[id]/page";
import {
  ChevronDown,
  ChevronRight,
  Clock,
  Edit,
  Hash,
  Layers,
} from "lucide-react";
import { useState } from "react";
import QuestionCardQuizDetail from "./question-card";
import Link from "next/link";

export default function QuizCard({ quiz }: { quiz: Quiz }) {
  const [expanded, setExpanded] = useState(false);
  const totalPoints = quiz.questions.reduce((s, q) => s + q.points, 0);
  const diffCounts = quiz.questions.reduce((acc, q) => {
    acc[q.difficulty] = (acc[q.difficulty] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  function Stat({
    icon,
    label,
    value,
  }: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
  }) {
    return (
      <div className="flex items-center gap-1.5 text-gray-500">
        {icon}
        <span className="text-sm font-semibold text-gray-800">{value}</span>
        <span className="text-xs text-gray-400">{label}</span>
      </div>
    );
  }
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
  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex justify-between">
          <div>
            <p className="text-xs font-mono text-gray-300 mb-1">
              #{String(quiz.id).padStart(3, "0")}
            </p>
            <h3 className="text-base font-semibold text-gray-900 leading-snug">
              {quiz.title}
            </h3>
          </div>
          <Link
            href={`/dashboard/edit-quiz/${quiz.id}`}
            className="flex gap-2 cursor-pointer hover:bg-gray-300 items-center p-2 rounded-3xl transition hover:text-blue-400 "
          >
            <Edit />
            Edit
          </Link>
        </div>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
          {quiz.description}
        </p>

        <div className="flex flex-wrap items-center gap-4 mt-4">
          <Stat
            icon={<Hash className="w-3.5 h-3.5" />}
            label="questions"
            value={quiz.questions.length}
          />
          <Stat
            icon={<Layers className="w-3.5 h-3.5" />}
            label="total points"
            value={totalPoints}
          />
          <Stat
            icon={<Clock className="w-3.5 h-3.5" />}
            label="duration"
            value={`${quiz.duration} min`}
          />
          <div className="flex items-center gap-1.5 ml-auto">
            {(["EASY", "MEDIUM", "HARD"] as const).map((d) =>
              diffCounts[d] ? (
                <span
                  key={d}
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${difficultyConfig[d].cls}`}
                >
                  {diffCounts[d]} {difficultyConfig[d].label}
                </span>
              ) : null,
            )}
          </div>
        </div>
      </div>

      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-3 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium">
          {expanded ? "Hide" : "Show"} questions ({quiz.questions.length})
        </span>
        {expanded ? (
          <ChevronDown className="w-4 h-4" />
        ) : (
          <ChevronRight className="w-4 h-4" />
        )}
      </button>

      {expanded && (
        <div className="px-6 pb-6 space-y-2 border-t border-gray-100 pt-4">
          {quiz.questions.map((q, qi) => (
            <QuestionCardQuizDetail key={q.id} question={q} index={qi} />
          ))}
        </div>
      )}
    </div>
  );
}
