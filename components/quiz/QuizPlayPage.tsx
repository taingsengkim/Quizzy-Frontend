"use client";

import React, { useEffect, useRef, useState } from "react";
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
  Clock,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import CodeBlock from "./code-display";
import { toast } from "sonner";

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

  const [hint, setHint] = useState<string | null>(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintUsedMap, setHintUsedMap] = useState<Record<number, number>>({});
  const [totalHintsUsed, setTotalHintsUsed] = useState(0);

  const [attemptId, setAttemptId] = useState<string | null>(null);

  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const quizStartedRef = useRef(false);
  useEffect(() => {
    if (!quiz || quizStartedRef.current) return;
    quizStartedRef.current = true;

    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [quiz]);

  // Stop timer when quiz is submitted (quizResultId set)
  useEffect(() => {
    if (quizResultId !== null && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [quizResultId]);

  // Stop timer if quiz has a time limit and it runs out
  const timeLimitSeconds = quiz ? quiz.duration * 60 : null;
  const timeIsUp =
    timeLimitSeconds !== null && elapsedSeconds >= timeLimitSeconds;
  const timeRemaining =
    timeLimitSeconds !== null
      ? Math.max(0, timeLimitSeconds - elapsedSeconds)
      : null;

  // Auto-submit when time runs out
  useEffect(() => {
    if (!timeIsUp || quizResultId !== null || !quiz) return;
    handleSubmitQuiz();
  }, [timeIsUp]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };
  const attemptStartedRef = React.useRef(false);
  useEffect(() => {
    if (attemptStartedRef.current) return;
    const startNewAttempt = async () => {
      try {
        const res = await fetch(`/api/quizzes/${quizId}/start-attempt`, {
          method: "POST",
        });
        const data = await res.json();
        setAttemptId(data.attemptId);
        attemptStartedRef.current = true;
      } catch (err) {
        console.error("Failed to start attempt", err);
      }
    };
    startNewAttempt();
  }, [quizId]);
  const hintRequestingRef = React.useRef(false);
  const handleGetHint = async () => {
    if (!quiz || !question) return;
    if (!attemptId) return toast.error("Attempt not ready yet!");
    if (hintRequestingRef.current) return;
    const usedOnThisQuestion = hintUsedMap[question.id] || 0;
    if (usedOnThisQuestion >= 1)
      return toast.warning("You've already used your hint for this question.");
    const totalHintsAllowed = quiz.questions.length * quiz.maxHintsPerQuestion;
    if (totalHintsUsed >= quiz.maxHintsPerQuestion)
      return toast.warning(
        `You've used all ${quiz.maxHintsPerQuestion} hints allowed for this quiz.`,
      );
    try {
      hintRequestingRef.current = true;
      setHintLoading(true);
      const res = await fetch(
        `/api/quizzes/${quizId}/questions/${question.id}/hint?attemptId=${attemptId}`,
      );
      const msg = await res.text();
      if (!res.ok) return toast.warning(msg);
      setHint(msg);
      setHintUsedMap((prev) => ({
        ...prev,
        [question.id]: usedOnThisQuestion + 1,
      }));
      setTotalHintsUsed((prev) => prev + 1);
    } finally {
      setHintLoading(false);
      hintRequestingRef.current = false;
    }
  };

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
        className={`flex items-center gap-1.5 px-3 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider ${config.color}`}
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
        <div className="max-w-md w-full p-10 border border-rose-500/20 bg-rose-500/5 roundedmd2rem] text-center backdrop-blur-xl">
          <X className="w-16 h-16 text-rose-500 mx-auto mb-6 opacity-50" />
          <h2 className="text-2xl font-black text-white mb-2 uppercase italic">
            Sync Terminated
          </h2>
          <p className="text-slate-400 text-sm mb-8">
            Data packet loss detected. Re-initialize connection?
          </p>
          <Link
            href="/quizzes/1"
            className="w-full bg-rose-600 hover:bg-rose-500 text-white rounded-md py-6 font-bold uppercase tracking-widest"
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
  const handleSubmitQuiz = async (
    overrideAnswers?: Record<number, number[]>,
  ) => {
    const answers = overrideAnswers ?? selectedAnswers;
    const payload = {
      quizId: Number(quizId),
      duration: elapsedSeconds, //  actual elapsed time in seconds
      answers: Object.entries(answers).map(([qId, aIds]) => ({
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
  };

  const handleNext = async () => {
    setHint(null);
    setHintLoading(false);

    if (currentIdx < quiz.questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      await handleSubmitQuiz();
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
            <div className="absolute inset-0 bg-emerald-500/10 blur-[100px] -z-10 rounded-md" />
            <Trophy className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
            <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter mb-2">
              Protocol <span className="text-emerald-400">Success</span>
            </h1>
            <p className="text-slate-200 font-mono text-xs uppercase tracking-[0.4em]">
              Final Accuracy Assessment
            </p>
          </div>
          <div className="flex justify-center gap-6 mb-20">
            <div className="bg-[#0d121f] border border-emerald-500/20 p-8 rounded-md min-w-[200px] text-center shadow-2xl shadow-emerald-500/5">
              <p className="text-[10px] font-mono text-slate-200 uppercase tracking-widest mb-2">
                Performance Score
              </p>
              <p className="text-5xl font-black text-white">
                {quizResult?.score}
                <span className="text-emerald-500">/</span>
                {quiz?.questions?.length}
              </p>
            </div>
            <div className="bg-[#0d121f] border border-sky-500/20 p-8 rounded-md min-w-[200px] text-center shadow-2xl shadow-sky-500/5">
              <p className="text-[10px] font-mono text-slate-200 uppercase tracking-widest mb-2">
                Time Taken
              </p>
              <p className="text-5xl font-black text-white font-mono">
                {formatTime(quizResult?.duration ?? elapsedSeconds)}
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
                className="bg-[#0d121f]/60 backdrop-blur-md border border-slate-800 p-8 roundedmd2rem] hover:border-slate-700 transition-colors"
              >
                <div className="flex justify-between items-start mb-6 gap-4">
                  <h3 className="text-xl font-bold text-white leading-snug">
                    {idx + 1}. {q.questionText}
                  </h3>
                  <div
                    className={`p-2 rounded-md border ${
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
                        className={`flex justify-between items-center px-5 py-4 rounded-md border font-medium ${
                          isSelected
                            ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-400"
                            : "bg-slate-900 border-slate-800 text-slate-200 italic"
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
                        className="flex justify-between items-center px-5 py-4 rounded-md border bg-rose-500/10 border-rose-500/40 text-rose-400 font-medium"
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
            className="mt-20 flex items-center justify-center gap-3 w-full bg-[#0d121f] border border-slate-800 hover:bg-slate-800 text-white h-16 rounded-md font-black uppercase tracking-widest transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Return to Command Hub
          </Link>
        </div>
      </div>
    );
  }

  const usedOnCurrentQuestion = hintUsedMap[question.id] || 0;
  const totalHintsAllowed = quiz.questions.length * quiz.maxHintsPerQuestion;
  const hintDisabled =
    hintLoading ||
    usedOnCurrentQuestion >= 1 ||
    totalHintsUsed >= quiz.maxHintsPerQuestion;

  const isWarning = timeRemaining !== null && timeRemaining <= 60;
  const isDanger = timeRemaining !== null && timeRemaining <= 30;

  return (
    <div className="min-h-screen bg-[#05080f] flex items-center justify-center pt-20  px-6">
      <div className="max-w-3xl w-full">
        <div className="mb-3 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-4">
            <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">
              Module <span className="text-sky-400">{currentIdx + 1}</span>
              <span className="text-slate-700 text-2xl ml-3">
                / {quiz.questions.length}
              </span>
            </h2>
          </div>
        </div>
        {timeIsUp && (
          <div className="mb-6 p-4 rounded-md border border-rose-500/40 bg-rose-500/10 text-rose-300 text-center font-bold tracking-wide">
            ⏰ Time's up! Submitting your answers...
          </div>
        )}
        <div className="relative group">
          <div className="relative bg-[#0d121f] border border-slate-800 p-5 md:p-8 roundedmd1rem] shadow-2xl">
            <div className="flex flex-wrap gap-3 items-start justify-between">
              <div className="flex gap-2">
                <div className="flex items-center gap-2 text-sky-500 font-mono text-[10px] uppercase tracking-tighter">
                  <Cpu className="w-3 h-3" /> {quiz.title}
                </div>
                {renderTypeBadge(question.questionType)}
                {question.difficulty && (
                  <div
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider
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
                  <div
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider text-violet-400 border-violet-400/20 bg-violet-400/5 
                  `}
                  >
                    {question.points} pts
                  </div>
                )}
              </div>
              <div className="flex flex-col items-end gap-3">
                {timeRemaining !== null && (
                  <div
                    className={`flex items-center gap-2 px-4 py-2 rounded-md border font-mono text-sm font-bold transition-all duration-300
                ${
                  isDanger
                    ? "border-rose-500/50 bg-rose-500/10 text-rose-400 animate-pulse"
                    : isWarning
                    ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                    : "border-slate-700 bg-slate-900/40 text-slate-300"
                }`}
                  >
                    <Clock className="w-4 h-4" />
                    {formatTime(timeRemaining)}
                  </div>
                )}
                {timeRemaining === null && (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-md border border-slate-700 bg-slate-900/40 font-mono text-sm text-slate-400">
                    <Clock className="w-4 h-4" />
                    {formatTime(elapsedSeconds)}
                  </div>
                )}
              </div>
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 leading-relaxed tracking-tight">
              {question.text}
            </h3>
            {question.code != null && question.code !== "" && (
              <CodeBlock code={question.code} />
            )}
            <div className="grid grid-cols-1 gap-4 mt-8">
              {question.answers.map((answer: any) => {
                const isSelected = selectedAnswers[question.id]?.includes(
                  answer.id,
                );
                return (
                  <button
                    key={answer.id}
                    onClick={() => handleSelection(answer.id)}
                    disabled={timeIsUp}
                    className={`group/btn relative w-full text-left p-2 rounded-md border transition-all duration-300 ${
                      isSelected
                        ? "bg-sky-500/10 border-sky-500 text-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.1)]"
                        : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-600 hover:bg-slate-900/60"
                    } ${timeIsUp ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex items-center justify-between relative z-10">
                      <span className="text-base font-semibold  tracking-wide">
                        {answer.text}
                      </span>
                      <div
                        className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${
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
        <div className="w-full my-5 space-y-2">
          <div className="flex justify-between  font-mono text-[10px] text-slate-200 uppercase tracking-widest">
            <span>Sync Progress</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-5 bg-slate-900 rounded-md border border-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-sky-600 to-sky-400 transition-all duration-700"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between gap-4">
          <div className="flex flex-col gap-2">
            {hint && (
              <div className="p-4 rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-300">
                💡 {hint}
              </div>
            )}
            {question.hint && question.hint.trim() !== "" && (
              <div className="flex items-center gap-3">
                <Button
                  onClick={handleGetHint}
                  disabled={hintDisabled || timeIsUp}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-bold disabled:opacity-30"
                >
                  {hintLoading ? "Loading..." : "💡 Show Hint"}
                </Button>
                <span className="text-xs text-slate-200 font-mono">
                  {totalHintsUsed}/{quiz.maxHintsPerQuestion} quiz hints used
                  {usedOnCurrentQuestion >= 1 && (
                    <span className="ml-2 text-amber-500/70">
                      · used on this question
                    </span>
                  )}
                </span>
              </div>
            )}
          </div>

          <Button
            onClick={handleNext}
            disabled={!selectedAnswers[question.id]?.length || timeIsUp}
            className="group min-w-[220px] h-10 bg-sky-600 hover:bg-sky-500 text-white rounded-md font-black uppercase tracking-[0.2em] shadow-xl shadow-sky-900/20 transition-all disabled:opacity-20 active:scale-95"
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
