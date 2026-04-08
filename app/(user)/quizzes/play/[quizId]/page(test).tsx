"use client";

import { useGetQuizByIdQuery } from "@/lib/features/quizzes/quizzesSlice";
import { useState, use } from "react"; // Added 'use' to handle params
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, ChevronRight, Loader2, Trophy } from "lucide-react";

interface Props {
  params: Promise<{ quizId: string }>;
}

export default function QuizPage({ params }: Props) {
  const resolvedParams = use(params);
  const quizId = resolvedParams.quizId;

  const { data: quiz, isLoading, error } = useGetQuizByIdQuery(Number(quizId));
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number[]>
  >({});
  const [showResult, setShowResult] = useState(false);

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-sky-500" />
        <p className="font-mono text-xs uppercase tracking-widest text-slate-500">
          Decrypting Quiz Data...
        </p>
      </div>
    );

  if (error || !quiz)
    return (
      <div className="p-20 text-center text-red-400">
        Error: Quiz data unavailable.
      </div>
    );

  const question = quiz.questions[currentQuestionIdx];
  const isLastQuestion = currentQuestionIdx === quiz.questions.length - 1;

  const handleSelect = (answerId: number) => {
    const currentSelection = selectedAnswers[question.id] || [];

    if (
      question.questionType === "SINGLE_CHOICE" ||
      question.questionType === "TRUE_FALSE"
    ) {
      setSelectedAnswers({ ...selectedAnswers, [question.id]: [answerId] });
    } else {
      const newSelection = currentSelection.includes(answerId)
        ? currentSelection.filter((id) => id !== answerId)
        : [...currentSelection, answerId];
      setSelectedAnswers({ ...selectedAnswers, [question.id]: newSelection });
    }
  };

  const nextQuestion = () => {
    if (isLastQuestion) {
      setShowResult(true);
    } else {
      setCurrentQuestionIdx((prev) => prev + 1);
    }
  };
  if (showResult) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-20 text-center">
        <div className="inline-flex p-4 rounded-full bg-sky-500/10 mb-6">
          <Trophy className="w-12 h-12 text-sky-400" />
        </div>
        <h1 className="text-4xl font-black text-white mb-2 uppercase italic">
          Evaluation Complete
        </h1>
        <p className="text-slate-500 font-mono text-sm mb-8 uppercase tracking-widest">
          Neural Sync Successful
        </p>
        <Button
          onClick={() => (window.location.href = "/quizzes")}
          className="bg-sky-600 hover:bg-sky-500 text-white px-10 py-6 rounded-2xl font-bold uppercase tracking-widest transition-all"
        >
          Return to Directory
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-10 space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <span className="text-[10px] font-mono text-sky-500 uppercase tracking-[0.2em]">
              Sector: {quiz.title}
            </span>
            <h2 className="text-white text-sm font-bold mt-1">
              Progress: {currentQuestionIdx + 1}{" "}
              <span className="text-slate-600">/ {quiz.questions.length}</span>
            </h2>
          </div>
          <span className="text-[10px] font-mono text-slate-500 uppercase">
            {question.difficulty} // {question.points} PTS
          </span>
        </div>
        <Progress
          value={((currentQuestionIdx + 1) / quiz.questions.length) * 100}
          className="h-1 bg-slate-800"
        />
      </div>
      <div className="bg-[#0d121f] border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-sky-500" />

        <p className="text-xl md:text-2xl font-bold text-white leading-relaxed mb-10">
          {question.text}
        </p>

        <div className="grid grid-cols-1 gap-3">
          {question.answers.map((a: any) => {
            const isSelected = selectedAnswers[question.id]?.includes(a.id);
            return (
              <button
                key={a.id}
                onClick={() => handleSelect(a.id)}
                className={`group relative flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 text-left ${
                  isSelected
                    ? "bg-sky-500/10 border-sky-500/50 text-sky-400"
                    : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700"
                }`}
              >
                <span className="text-sm font-medium">{a.text}</span>
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                    isSelected
                      ? "bg-sky-500 border-sky-500"
                      : "border-slate-700"
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="mt-8 flex justify-end">
        <Button
          onClick={nextQuestion}
          disabled={
            !selectedAnswers[question.id] ||
            selectedAnswers[question.id].length === 0
          }
          className="group bg-white text-black hover:bg-sky-400 hover:text-white px-8 py-6 rounded-2xl font-black uppercase tracking-widest transition-all"
        >
          {isLastQuestion ? "Submit Sequence" : "Next Protocol"}
          <ChevronRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </div>
  );
}
