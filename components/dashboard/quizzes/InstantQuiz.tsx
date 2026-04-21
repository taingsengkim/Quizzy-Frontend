"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  Cpu,
  Trophy,
  ListChecks,
  Target,
  Layers,
  Zap,
  ArrowLeft,
  Loader2,
  RotateCcw,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import CodeBlock from "@/components/quiz/code-display";

type Answer = {
  id: number;
  text: string;
  correct: boolean;
};

type Question = {
  id: number;
  text: string;
  answers: Answer[];
  questionType: "SINGLE_CHOICE" | "MULTIPLE_CHOICE";
  points: number;
  code?: string | null;
  difficulty: string;
  hint?: string;
};

const DIFFICULTY_COLORS: Record<string, string> = {
  EASY: "text-emerald-400 border-emerald-400/20 bg-emerald-400/5",
  MEDIUM: "text-amber-400 border-amber-400/20 bg-amber-400/5",
  HARD: "text-rose-400 border-rose-400/20 bg-rose-400/5",
};

function renderTypeBadge(type: string) {
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
  };
  const config = types[type] || {
    label: type,
    icon: Layers,
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
}

export default function InstantQuizComponent() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [quiz, setQuiz] = useState<Question[]>([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number[]>
  >({});
  const [showHint, setShowHint] = useState(false);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [animating, setAnimating] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(
    null,
  );
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // We no longer pre-fetch — questions are fetched on startQuiz with the chosen difficulty
  useEffect(() => {
    setLoadingData(false);
  }, []);

  useEffect(() => {
    if (started && !finished) {
      timerRef.current = setInterval(
        () => setElapsedSeconds((p) => p + 1),
        1000,
      );
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [started, finished]);

  useEffect(() => {
    if (finished && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [finished]);

  const formatTime = (s: number) =>
    `${Math.floor(s / 60)
      .toString()
      .padStart(2, "0")}:${(s % 60).toString().padStart(2, "0")}`;

  const startQuiz = async () => {
    setLoadingData(true);
    try {
      const params = new URLSearchParams({ size: "5" });
      if (selectedDifficulty) params.set("difficulty", selectedDifficulty);
      const res = await fetch(`/api/questions/random?${params}`);
      const data: Question[] = await res.json();
      setQuiz(Array.isArray(data) ? data : []);
    } catch {
      setQuiz([]);
    } finally {
      setLoadingData(false);
    }
    setStarted(true);
    setCurrent(0);
    setScore(0);
    setSelectedAnswers({});
    setFinished(false);
    setElapsedSeconds(0);
    setShowHint(false);
  };
  const question = quiz[current];
  const progress = quiz.length > 0 ? ((current + 1) / quiz.length) * 100 : 0;

  const handleSelection = (answerId: number) => {
    if (!question) return;
    const cur = selectedAnswers[question.id] || [];
    if (question.questionType === "SINGLE_CHOICE") {
      setSelectedAnswers({ ...selectedAnswers, [question.id]: [answerId] });
    } else {
      const updated = cur.includes(answerId)
        ? cur.filter((id) => id !== answerId)
        : [...cur, answerId];
      setSelectedAnswers({ ...selectedAnswers, [question.id]: updated });
    }
  };

  const handleNext = () => {
    const sel = selectedAnswers[question.id] || [];
    const correctIds = question.answers
      .filter((a) => a.correct)
      .map((a) => a.id);
    const isCorrect =
      correctIds.length === sel.length &&
      correctIds.every((id) => sel.includes(id));
    if (isCorrect) setScore((prev) => prev + question.points);

    setAnimating(true);
    setShowHint(false);
    setTimeout(() => {
      setAnimating(false);
      if (current + 1 < quiz.length) setCurrent(current + 1);
      else setFinished(true);
    }, 250);
  };
  if (loadingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#05080f] gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-sky-500" />
        <span className="font-mono text-xs text-sky-500/50 animate-pulse tracking-widest">
          LOADING_QUESTIONS...
        </span>
      </div>
    );
  }
  if (!started) {
    const difficulties = [
      {
        value: null,
        label: "All",
        sub: "Mixed difficulty",
        color: "border-slate-600 text-slate-300 bg-slate-800/40",
        active:
          "border-sky-500 bg-sky-500/10 text-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.1)]",
      },
      {
        value: "EASY",
        label: "Easy",
        sub: "Beginner friendly",
        color: "border-slate-700 text-slate-400 bg-slate-900/40",
        active:
          "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-[0_0_20px_rgba(52,211,153,0.1)]",
      },
      {
        value: "MEDIUM",
        label: "Medium",
        sub: "Moderate challenge",
        color: "border-slate-700 text-slate-400 bg-slate-900/40",
        active:
          "border-amber-500 bg-amber-500/10 text-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.1)]",
      },
      {
        value: "HARD",
        label: "Hard",
        sub: "Expert level",
        color: "border-slate-700 text-slate-400 bg-slate-900/40",
        active:
          "border-rose-500 bg-rose-500/10 text-rose-400 shadow-[0_0_20px_rgba(239,68,68,0.1)]",
      },
    ];
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#05080f] px-6">
        <div className="max-w-md w-full p-10 border border-slate-800 bg-[#0d121f] rounded-xl text-center shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center mx-auto mb-6">
            <Zap className="w-8 h-8 text-sky-400" />
          </div>
          <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">
            Instant <span className="text-sky-400">Quiz</span>
          </h2>
          <p className="text-slate-400 font-mono text-xs uppercase tracking-widest mb-8">
            5 random questions · test your knowledge
          </p>
          <div className="mb-8 text-left">
            <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-3">
              Select Difficulty
            </p>
            <div className="grid grid-cols-2 gap-2">
              {difficulties.map((d) => {
                const isActive = selectedDifficulty === d.value;
                return (
                  <button
                    key={String(d.value)}
                    onClick={() => setSelectedDifficulty(d.value)}
                    className={`flex flex-col items-start p-3 rounded-md border transition-all duration-200 ${
                      isActive ? d.active : d.color + " hover:border-slate-500"
                    }`}
                  >
                    <span className="text-sm font-black uppercase tracking-wider">
                      {d.label}
                    </span>
                    <span className="text-[10px] font-mono opacity-60 mt-0.5">
                      {d.sub}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <Button
            onClick={startQuiz}
            className="w-full h-12 bg-sky-600 hover:bg-sky-500 text-white font-black uppercase tracking-[0.2em] rounded-md shadow-xl shadow-sky-900/20 transition-all active:scale-95"
          >
            Initialize Quiz
          </Button>
        </div>
      </div>
    );
  }
  if (finished) {
    const correctCount = quiz.filter((q) => {
      const sel = selectedAnswers[q.id] || [];
      const correctIds = q.answers.filter((a) => a.correct).map((a) => a.id);
      return (
        correctIds.length === sel.length &&
        correctIds.every((id) => sel.includes(id))
      );
    }).length;
    return (
      <div className="min-h-screen bg-[#05080f] flex flex-col items-center py-20 px-6">
        <div className="max-w-4xl w-full animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <div className="text-center mb-16 relative">
            <div className="absolute inset-0 bg-emerald-500/10 blur-[100px] -z-10 rounded-full" />
            <Trophy className="w-16 h-16 text-emerald-400 mx-auto mb-6" />
            <h1 className="text-5xl font-black text-white uppercase italic tracking-tighter mb-2">
              Protocol <span className="text-emerald-400">Complete</span>
            </h1>
            <p className="text-slate-400 font-mono text-xs uppercase tracking-[0.4em]">
              Final Accuracy Assessment
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 mb-20">
            <div className="bg-[#0d121f] border border-emerald-500/20 p-8 rounded-xl min-w-[180px] text-center shadow-2xl shadow-emerald-500/5">
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2">
                Score
              </p>
              <p className="text-5xl font-black text-white">
                {score}
                <span className="text-emerald-500 text-2xl">pts</span>
              </p>
            </div>
            <div className="bg-[#0d121f] border border-sky-500/20 p-8 rounded-xl min-w-[180px] text-center shadow-2xl shadow-sky-500/5">
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2">
                Correct
              </p>
              <p className="text-5xl font-black text-white">
                {correctCount}
                <span className="text-sky-500 text-2xl">/{quiz.length}</span>
              </p>
            </div>
            <div className="bg-[#0d121f] border border-violet-500/20 p-8 rounded-xl min-w-[180px] text-center shadow-2xl shadow-violet-500/5">
              <p className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-2">
                Time
              </p>
              <p className="text-5xl font-black text-white font-mono">
                {formatTime(elapsedSeconds)}
              </p>
            </div>
          </div>

          <div className="space-y-8">
            <h3 className="text-slate-400 font-mono text-[10px] uppercase tracking-widest flex items-center gap-4">
              <span className="h-px flex-1 bg-slate-800" /> SEQUENCE_LOG{" "}
              <span className="h-px flex-1 bg-slate-800" />
            </h3>
            {quiz.map((q, idx) => {
              const sel = selectedAnswers[q.id] || [];
              const correctIds = q.answers
                .filter((a) => a.correct)
                .map((a) => a.id);
              const isCorrect =
                correctIds.length === sel.length &&
                correctIds.every((id) => sel.includes(id));
              return (
                <div
                  key={q.id}
                  className="bg-[#0d121f]/60 backdrop-blur-md border border-slate-800 p-8 rounded-xl hover:border-slate-700 transition-colors"
                >
                  <div className="flex justify-between items-start mb-6 gap-4">
                    <h3 className="text-xl font-bold text-white leading-snug">
                      {idx + 1}. {q.text}
                    </h3>
                    <div
                      className={`p-2 rounded-md border shrink-0 ${
                        isCorrect
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                      }`}
                    >
                      {isCorrect ? (
                        <Check className="w-5 h-5" />
                      ) : (
                        <span className="w-5 h-5 flex items-center justify-center font-bold text-sm">
                          ✕
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    {q.answers.map((ans) => {
                      const userPicked = sel.includes(ans.id);
                      let cls =
                        "bg-slate-900 border-slate-800 text-slate-500 italic";
                      if (ans.correct && userPicked)
                        cls =
                          "bg-emerald-500/10 border-emerald-500/40 text-emerald-400";
                      else if (ans.correct && !userPicked)
                        cls =
                          "bg-emerald-500/5 border-emerald-500/20 text-emerald-600";
                      else if (!ans.correct && userPicked)
                        cls = "bg-rose-500/10 border-rose-500/40 text-rose-400";
                      return (
                        <div
                          key={ans.id}
                          className={`flex justify-between items-center px-5 py-4 rounded-md border font-medium text-sm ${cls}`}
                        >
                          <span>
                            {ans.text}
                            {ans.correct && !userPicked && (
                              <span className="ml-2 text-xs opacity-60">
                                (Correct Answer)
                              </span>
                            )}
                            {userPicked && !ans.correct && (
                              <span className="ml-2 text-xs opacity-60">
                                (Your Choice)
                              </span>
                            )}
                          </span>
                          {ans.correct && userPicked && (
                            <Check className="w-4 h-4 shrink-0" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-12 flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => {
                setStarted(false);
                setFinished(false);
              }}
              className="flex-1 flex items-center justify-center gap-3 h-16 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-black uppercase tracking-widest transition-all active:scale-95"
            >
              <RotateCcw className="w-4 h-4" /> Play Again
            </button>
            <Link
              href="/quizzes"
              className="flex-1 flex items-center justify-center gap-3 h-16 bg-[#0d121f] border border-slate-800 hover:bg-slate-800 text-white rounded-xl font-black uppercase tracking-widest transition-all"
            >
              <ArrowLeft className="w-4 h-4" /> Return to Command Hub
            </Link>
          </div>
        </div>
      </div>
    );
  }
  if (!question) return null;
  const sel = selectedAnswers[question.id] || [];

  return (
    <div className="min-h-screen bg-[#05080f] flex items-center justify-center pt-20 px-6">
      <div
        className="max-w-3xl w-full"
        style={{
          opacity: animating ? 0 : 1,
          transform: animating ? "translateX(-16px)" : "translateX(0)",
          transition: "opacity 0.25s, transform 0.25s",
        }}
      >
        <div className="mb-3 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">
            Module <span className="text-sky-400">{current + 1}</span>
            <span className="text-slate-700 text-2xl ml-3">
              / {quiz.length}
            </span>
          </h2>
        </div>
        <div className="relative bg-[#0d121f] border border-slate-800 p-5 md:p-8 rounded-xl shadow-2xl">
          <div className="flex flex-wrap gap-3 items-start justify-between mb-6">
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex items-center gap-2 text-sky-500 font-mono text-[10px] uppercase tracking-tighter">
                <Cpu className="w-3 h-3" /> Instant Quiz
              </div>
              {renderTypeBadge(question.questionType)}
              {question.difficulty && (
                <div
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider ${
                    DIFFICULTY_COLORS[question.difficulty.toUpperCase()] ||
                    "text-slate-400 border-slate-400/20 bg-slate-400/5"
                  }`}
                >
                  {question.difficulty}
                </div>
              )}
              {question.points && (
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-md border text-[10px] font-bold uppercase tracking-wider text-violet-400 border-violet-400/20 bg-violet-400/5">
                  {question.points} pts
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-md border border-slate-700 bg-slate-900/40 font-mono text-sm text-slate-400">
              <Clock className="w-4 h-4" />
              {formatTime(elapsedSeconds)}
            </div>
          </div>
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-6 leading-relaxed tracking-tight">
            {question.text}
          </h3>
          {question.code && question.code.trim() !== "" && (
            <CodeBlock code={question.code} />
          )}
          <div className="grid grid-cols-1 gap-4 mt-4">
            {question.answers.map((answer) => {
              const isSelected = sel.includes(answer.id);
              return (
                <button
                  key={answer.id}
                  onClick={() => handleSelection(answer.id)}
                  className={`w-full text-left p-4 rounded-md border transition-all duration-300 ${
                    isSelected
                      ? "bg-sky-500/10 border-sky-500 text-sky-400 shadow-[0_0_20px_rgba(56,189,248,0.1)]"
                      : "bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-600 hover:bg-slate-900/60"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-base font-semibold tracking-wide">
                      {answer.text}
                    </span>
                    <div
                      className={`w-6 h-6 rounded-md border flex items-center justify-center shrink-0 transition-all ${
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
        <div className="w-full my-5 space-y-2">
          <div className="flex justify-between font-mono text-[10px] text-slate-400 uppercase tracking-widest">
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
            {question.hint && question.hint.trim() !== "" && (
              <>
                <Button
                  onClick={() => setShowHint((v) => !v)}
                  className="bg-amber-500 hover:bg-amber-400 text-black font-bold"
                >
                  💡 {showHint ? "Hide Hint" : "Show Hint"}
                </Button>
                {showHint && (
                  <div className="p-4 rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-300 text-sm max-w-xs">
                    💡 {question.hint}
                  </div>
                )}
              </>
            )}
          </div>
          <Button
            onClick={handleNext}
            disabled={sel.length === 0}
            className="group min-w-[220px] h-10 bg-sky-600 hover:bg-sky-500 text-white rounded-md font-black uppercase tracking-[0.2em] shadow-xl shadow-sky-900/20 transition-all disabled:opacity-20 active:scale-95"
          >
            {current === quiz.length - 1
              ? "Finalize Sequence"
              : "Commit & Next"}
          </Button>
        </div>
      </div>
    </div>
  );
}
