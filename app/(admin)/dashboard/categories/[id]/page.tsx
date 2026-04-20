"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Loader2,
  BookOpen,
  Clock,
  ChevronDown,
  ChevronRight,
  Hash,
  Layers,
  Lightbulb,
  Code2,
  CheckSquare,
  Circle,
  Check,
  X,
} from "lucide-react";
import QuizCard from "@/components/dashboard/categories/quiz-card";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface Answer {
  id: number;
  text: string;
  correct: boolean;
}

export interface Question {
  id: number;
  text: string;
  answers: Answer[];
  questionType: "SINGLE_CHOICE" | "MULTIPLE_CHOICE";
  points: number;
  code: string | null;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  hint: string | null;
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  duration: number;
  categoryId: number;
  questions: Question[];
}

export interface ApiResponse {
  content: Quiz[];
  totalElements: number;
  totalPages: number;
}

export default function CategoryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/categories/${id}`, {
          credentials: "include",
        });
        if (!res.ok) throw new Error();
        const data: ApiResponse = await res.json();
        setQuizzes(data.content ?? []);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const totalQuestions = quizzes.reduce((s, q) => s + q.questions.length, 0);
  const totalPoints = quizzes.reduce(
    (s, q) => s + q.questions.reduce((a, qq) => a + qq.points, 0),
    0,
  );
  const totalDuration = quizzes.reduce((s, q) => s + q.duration, 0);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-500">
          Failed to load category details.
        </p>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to categories
        </button>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Quizzes",
              value: quizzes.length,
              icon: <BookOpen className="w-4 h-4" />,
            },
            {
              label: "Questions",
              value: totalQuestions,
              icon: <Hash className="w-4 h-4" />,
            },
            {
              label: "Points",
              value: totalPoints,
              icon: <Layers className="w-4 h-4" />,
            },
            {
              label: "Total time",
              value: `${totalDuration}m`,
              icon: <Clock className="w-4 h-4" />,
            },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3 flex items-center gap-3"
            >
              <span className="text-gray-400">{s.icon}</span>
              <div>
                <p className="text-xl font-bold text-gray-900 leading-none">
                  {s.value}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
        {quizzes.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
            <BookOpen className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-gray-500">
              No quizzes in this category yet.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {quizzes.map((quiz) => (
              <QuizCard key={quiz.id} quiz={quiz} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
