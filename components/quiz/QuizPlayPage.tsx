"use client";

import React, { useState } from "react";
import {
  useGetQuizToPlayQuery,
  useSubmitQuizResultMutation,
  useGetQuizResultByIdQuery,
} from "@/lib/features/quizzes/quizzesSlice";
import { Button } from "@/components/ui/button";
import {
  Check,
  X,
  Loader2,
  ArrowLeft,
  Cpu,
  Trophy,
  ListChecks,
  Target,
  Layers,
  Copy,
  CheckCheck,
  Terminal,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import CodeBlock from "./code-display";

interface PlayQuizProps {
  quizId: string;
}

export default function PlayQuizComponent({ quizId }: PlayQuizProps) {
  const { data: quiz, isLoading, error } = useGetQuizToPlayQuery(quizId);
  const [submitQuizResult] = useSubmitQuizResultMutation();
  const [quizResultId, setQuizResultId] = useState<number | null>(null);

  const { data: quizResult, isLoading: isResultLoading } =
    useGetQuizResultByIdQuery(quizResultId!, { skip: quizResultId === null });

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number[]>
  >({});

  const renderTypeBadge = (type: string) => {
    const types: Record<string, { label: string; icon: any; color: string }> = {
      SINGLE_CHOICE: {
        label: "Single Choice",
        icon: Target,
        color: "text-amber-400 border-amber-400/20 bg-amber-400/5",
      },
      MULTIPLE_CHOICE: {
        label: "Multiple Choice",
        icon: ListChecks,
        color: "text-sky-400 border-sky-400/20 bg-sky-400/5",
      },
      TRUE_FALSE: {
        label: "True / False",
        icon: Layers,
        color: "text-emerald-400 border-emerald-400/20 bg-emerald-400/5",
      },
    };
    const config = types[type] || {
      label: type,
      icon: Cpu,
      color: "text-slate-400 border-slate-400/20 bg-slate-400/5",
    };
    const Icon = config.icon;
    return (
      <div
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${config.color}`}
      >
        <Icon className="w-3 h-3" />
        {config.label}
      </div>
    );
  };

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#05080f] gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-sky-500" />
        <span className="font-mono text-xs text-sky-500/50 animate-pulse tracking-widest">
          ESTABLISHING_CONNECTION...
        </span>
      </div>
    );

  if (error || !quiz)
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#05080f] px-6">
        <div className="max-w-md w-full p-10 border border-rose-500/20 bg-rose-500/5 rounded-[2rem] text-center backdrop-blur-xl">
          <X className="w-16 h-16 text-rose-500 mx-auto mb-6 opacity-50" />
          <h2 className="text-2xl font-black text-white mb-2 uppercase italic">
            Sync Terminated
          </h2>
          <p className="text-slate-400 text-sm mb-8">
            Data packet loss detected. Re-initialize connection?
          </p>
          <Link
            href="/quizzes/1"
            className="w-full bg-rose-600 hover:bg-rose-500 text-white rounded-xl py-6 font-bold uppercase tracking-widest"
          >
            Retry Link
          </Link>
        </div>
      </div>
    );

  const question = quiz.questions[currentIdx];
  const progress = ((currentIdx + 1) / quiz.questions.length) * 100;

  const handleSelection = (answerId: number) => {
    const current = selectedAnswers[question.id] || [];
    if (
      question.questionType === "SINGLE_CHOICE" ||
      question.questionType === "TRUE_FALSE"
    ) {
      setSelectedAnswers({ ...selectedAnswers, [question.id]: [answerId] });
    } else {
      const updated = current.includes(answerId)
        ? current.filter((id: number) => id !== answerId)
        : [...current, answerId];
      setSelectedAnswers({ ...selectedAnswers, [question.id]: updated });
    }
  };

  const handleNext = async () => {
    if (currentIdx < quiz.questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      const payload = {
        quizId: Number(quizId),
        duration: 0,
        answers: Object.entries(selectedAnswers).map(([qId, aIds]) => ({
          questionId: Number(qId),
          answerId: aIds,
        })),
      };
      try {
        const result = await submitQuizResult(payload).unwrap();
        setQuizResultId(result.resultId);
      } catch (err) {
        console.error(err);
      }
    }
  };

  if (quizResultId !== null) {
    if (isResultLoading)
      return (
        <div className="flex items-center justify-center min-h-screen bg-[#05080f]">
          <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
        </div>
      );

    return (
      <div className="min-h-screen bg-[#05080f] flex flex-col items-center py-20 px-6">
        <div className="max-w-4xl w-full animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="text-center mb-16 relative">
            <div className="absolute inset-0 bg-emerald-500/10 blur-[100px] -z-10 rounded-full" />
            <Trophy className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
            <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter mb-2">
              Protocol <span className="text-emerald-400">Success</span>
            </h1>
            <p className="text-slate-500 font-mono text-xs uppercase tracking-[0.4em]">
              Final Accuracy Assessment
            </p>
          </div>

          <div className="flex justify-center gap-6 mb-20">
            <div className="bg-[#0d121f] border border-emerald-500/20 p-8 rounded-3xl min-w-[200px] text-center shadow-2xl shadow-emerald-500/5">
              <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-2">
                Performance Score
              </p>
              <p className="text-5xl font-black text-white">
                {quizResult?.score}
                <span className="text-emerald-500">/</span>
                {quizResult?.total}
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <h3 className="text-slate-400 font-mono text-[10px] uppercase tracking-widest flex items-center gap-4">
              <span className="h-px flex-1 bg-slate-800" /> SEQUENCE_LOG{" "}
              <span className="h-px flex-1 bg-slate-800" />
            </h3>
            {quizResult?.questions.map((q: any, idx: number) => (
              <div
                key={q.questionId}
                className="bg-[#0d121f]/60 backdrop-blur-md border border-slate-800 p-8 rounded-[2rem] hover:border-slate-700 transition-colors"
              >
                <div className="flex justify-between items-start mb-6 gap-4">
                  <h3 className="text-xl font-bold text-white leading-snug">
                    {idx + 1}. {q.questionText}
                  </h3>
                  <div
                    className={`p-2 rounded-xl border ${
                      q.userAnswers.every((val: any) =>
                        q.correctAnswers.includes(val),
                      ) && q.userAnswers.length === q.correctAnswers.length
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                        : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                    }`}
                  >
                    {q.userAnswers.every((val: any) =>
                      q.correctAnswers.includes(val),
                    ) && q.userAnswers.length === q.correctAnswers.length ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <X className="w-5 h-5" />
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-3">
                  {q.correctAnswers.map((correct: string) => {
                    const isSelected = q.userAnswers.includes(correct);
                    return (
                      <div
                        key={correct}
                        className={`flex justify-between items-center px-5 py-4 rounded-xl border font-medium ${
                          isSelected
                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                            : "bg-slate-900 border-slate-800 text-slate-500 italic"
                        }`}
                      >
                        <span>
                          {correct} {!isSelected && "(Correct Answer)"}
                        </span>
                        {isSelected && <Check className="w-4 h-4" />}
                      </div>
                    );
                  })}
                  {q.userAnswers
                    .filter((ua: string) => !q.correctAnswers.includes(ua))
                    .map((wrong: string) => (
                      <div
                        key={wrong}
                        className="flex justify-between items-center px-5 py-4 rounded-xl border bg-rose-500/10 border-rose-500/40 text-rose-400 font-medium"
                      >
                        <span>{wrong} (Your Choice)</span>
                        <X className="w-4 h-4" />
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/quizzes"
            className="mt-20 flex items-center justify-center gap-3 w-full bg-[#0d121f] border border-slate-800 hover:bg-slate-800 text-white h-16 rounded-2xl font-black uppercase tracking-widest transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Command Hub
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05080f] flex items-center justify-center py-20 px-6">
      <div className="max-w-3xl w-full">
        {/* header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2 text-sky-500 font-mono text-[10px] uppercase tracking-tighter">
                <Cpu className="w-3 h-3" /> {quiz.title}
              </div>
              {renderTypeBadge(question.questionType)}
              {question.difficulty && (
                <div
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider
                    ${
                      question.difficulty === "EASY"
                        ? "text-emerald-400 border-emerald-400/20 bg-emerald-400/5"
                        : ""
                    }
                    ${
                      question.difficulty === "MEDIUM"
                        ? "text-amber-400 border-amber-400/20 bg-amber-400/5"
                        : ""
                    }
                    ${
                      question.difficulty === "HARD"
                        ? "text-rose-400 border-rose-400/20 bg-rose-400/5"
                        : ""
                    }
                  `}
                >
                  {question.difficulty}
                </div>
              )}
              {question.points && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider text-violet-400 border-violet-400/20 bg-violet-400/5">
                  {question.points} pts
                </div>
              )}
            </div>
            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">
              Module <span className="text-sky-400">{currentIdx + 1}</span>
              <span className="text-slate-700 text-2xl ml-3">
                / {quiz.questions.length}
              </span>
            </h2>
          </div>

          <div className="w-full md:w-48 space-y-2">
            <div className="flex justify-between font-mono text-[10px] text-slate-500 uppercase tracking-widest">
              <span>Sync Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-slate-900 rounded-full border border-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-sky-600 to-sky-400 transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* question card */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-sky-500/20 to-transparent rounded-[2.5rem] blur opacity-25 group-hover:opacity-40 transition-opacity" />
          <div className="relative bg-[#0d121f] border border-slate-800 p-10 md:p-16 rounded-[2rem] shadow-2xl">
            <div className="absolute top-0 right-0 p-8 pointer-events-none">
              <div className="w-16 h-16 border-t-2 border-r-2 border-sky-500/20 rounded-tr-3xl" />
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 leading-relaxed tracking-tight">
              {question.text}
            </h3>

            {question.code != null && question.code !== "" && (
              <CodeBlock code={question.code} />
            )}

            {/* answers */}
            <div className="grid grid-cols-1 gap-4 mt-8">
              {question.answers.map((answer: any) => {
                const isSelected = selectedAnswers[question.id]?.includes(
                  answer.id,
                );
                return (
                  <button
                    key={answer.id}
                    onClick={() => handleSelection(answer.id)}
                    className={`group/btn relative w-full text-left p-6 rounded-2xl border transition-all duration-300 ${
                      isSelected
                        ? "bg-sky-500/10 border-sky-500 text-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.1)]"
                        : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-600 hover:bg-slate-900/60"
                    }`}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <span className="text-base font-semibold tracking-wide">
                        {answer.text}
                      </span>
                      <div
                        className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-sky-500 border-sky-500"
                            : "border-slate-700 bg-slate-950"
                        }`}
                      >
                        {isSelected && (
                          <Check className="w-4 h-4 text-white stroke-[3px]" />
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
        <div className="mt-12 flex justify-end">
          <Button
            onClick={handleNext}
            disabled={!selectedAnswers[question.id]?.length}
            className="group min-w-[220px] h-16 bg-sky-600 hover:bg-sky-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-sky-900/20 transition-all disabled:opacity-20 active:scale-95"
          >
            {currentIdx === quiz.questions.length - 1
              ? "Finalize Sequence"
              : "Commit & Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
