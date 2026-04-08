"use client";

import { useGetQuizzesByCategoryQuery } from "@/lib/features/quizzes/quizzesSlice";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface Props {
  categoryId: number;
}

export default function CategoryQuizzesClient({ categoryId }: Props) {
  const { data: quizzes, isLoading } = useGetQuizzesByCategoryQuery(categoryId);
  const router = useRouter();

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-2 text-slate-500">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
        <p className="font-mono text-xs uppercase tracking-widest">
          Loading Quizzes...
        </p>
      </div>
    );
  }
  if (!quizzes || quizzes.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500 font-mono">
          No quizzes found in this sector.
        </p>
      </div>
    );
  }

  const handleClick = async (quizId: number) => {
    try {
      const res = await fetch("/api/auth/check");
      if (!res.ok) throw new Error("Not logged in");

      const data = await res.json();
      if (data.loggedIn) {
        router.push(`/quizzes/play/${quizId}`);
      } else {
        router.push("/login");
      }
    } catch {
      router.push("/login");
    }
  };
  return (
    <div className="max-w-6xl mx-auto px-6 py-20">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-white">Available Quizzes</h1>
        <p className="text-slate-500 text-sm mt-2">
          Select a module to begin your evaluation.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quizzes?.map((quiz: any) => (
          <Card
            key={quiz.id}
            className={`group border-slate-800 transition-all duration-300 overflow-hidden
  ${
    quiz.questions?.length === 0
      ? "bg-red-900 cursor-not-allowed opacity-70"
      : "bg-[#0f172a] cursor-pointer hover:bg-[#111827] hover:border-sky-500/50 hover:shadow-[0_0_20px_rgba(56,189,248,0.1)]"
  }`}
            onClick={() => {
              if (quiz.questions?.length === 0) return;
              handleClick(quiz?.id);
            }}
          >
            <CardContent
              className={`p-6 transition-colors ${
                quiz.questions?.length === 0
                  ? "bg-red-900"
                  : "bg-[#0f172a] group-hover:bg-[#111827]"
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 font-mono uppercase">
                  {quiz.duration} Mins
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {quiz.questions?.length || 0} Questions
                </span>
              </div>

              <h2 className="text-lg font-bold text-white group-hover:text-sky-400 transition-colors">
                {quiz.title}
              </h2>

              <p className="text-sm mt-2 text-slate-400 line-clamp-2 leading-relaxed">
                {quiz.description}
              </p>

              <div className="mt-6 flex items-center text-xs font-bold text-sky-500 uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">
                Start Quiz →
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
