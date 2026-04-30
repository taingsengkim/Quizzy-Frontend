"use client";

import Link from "next/link";

type LeaderboardEntry = {
  rank: number;
  initials: string;
  username: string;
  score: number;
  color: string;
  textColor: string;
};

type UserStats = {
  quizzesTaken: number;
  quizzesThisWeek: number;
  accuracy: number;
  accuracyDelta: number;
  streakDays: number;
};

const DEFAULT_STATS: UserStats = {
  quizzesTaken: 248,
  quizzesThisWeek: 12,
  accuracy: 74,
  accuracyDelta: 3,
  streakDays: 7,
};
import { useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

import {
  Code2,
  Terminal,
  ArrowRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const DEFAULT_LEADERBOARD: LeaderboardEntry[] = [
  {
    rank: 1,
    initials: "AK",
    username: "alex_k",
    score: 9840,
    color: "bg-violet-500/20",
    textColor: "text-violet-400",
  },
  {
    rank: 2,
    initials: "JM",
    username: "jmdev",
    score: 8210,
    color: "bg-sky-500/15",
    textColor: "text-sky-400",
  },
  {
    rank: 3,
    initials: "SR",
    username: "sara_r",
    score: 7590,
    color: "bg-emerald-500/15",
    textColor: "text-emerald-400",
  },
  {
    rank: 4,
    initials: "YP",
    username: "yusuf_p",
    score: 6340,
    color: "bg-orange-500/10",
    textColor: "text-orange-400",
  },
];
const QUESTION = {
  lang: "JavaScript",
  text: "What does this snippet output to the console?",
  code: [
    { token: "console", cls: "text-sky-300" },
    { token: ".", cls: "text-slate-400" },
    { token: "log", cls: "text-emerald-400" },
    { token: "(", cls: "text-slate-400" },
    { token: "typeof", cls: "text-orange-400" },
    { token: " null", cls: "text-slate-300" },
    { token: ");", cls: "text-slate-400" },
  ],
  options: ["null", "undefined", "object", "string"],
  answer: 2,
  explanation:
    'typeof null === "object" is a famous JS quirk from Netscape days — the original type tag for null was 0, matching the object type tag.',
};
const TRENDING_TOPICS = [
  { label: "JavaScript", hot: true },
  { label: "React", hot: true },
  { label: "Data Structures", hot: true },
  { label: "Java", hot: false },
  { label: "CSS", hot: false },
  { label: "TypeScript", hot: false },
  { label: "Algorithms", hot: false },
  { label: "SQL", hot: false },
];

interface QuizSidebarProps {
  stats?: UserStats;
  leaderboard?: LeaderboardEntry[];
}

export default function QuizSidebar({
  stats = DEFAULT_STATS,
  leaderboard = DEFAULT_LEADERBOARD,
}: QuizSidebarProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);

  const pick = (i: number) => {
    if (revealed) return;
    setSelected(i);
    setTimeout(() => setRevealed(true), 300);
  };
  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-[#02040a] dark:text-slate-200 px-6 transition-colors duration-300">
      <div className="flex flex-col gap-4">
        <div className="gap-10 items-start">
          <div>
            <p className="text-[11px] text-sky-500 dark:text-sky-400 tracking-[0.22em] uppercase mb-2">
              // try a question
            </p>

            <h2 className="font-display text-3xl font-extrabold text-slate-900 dark:text-white mb-8">
              Can you answer this?
            </h2>

            <Card className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-sky-500/12 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <Badge
                  variant="outline"
                  className="font-mono text-xs text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-500/25 bg-blue-50 dark:bg-blue-500/5"
                >
                  <Code2 className="w-3 h-3 mr-1.5" />
                  {QUESTION.lang}
                </Badge>

                <span className="text-[10px] text-slate-500 dark:text-slate-600 font-mono">
                  Q#4481
                </span>
              </CardHeader>

              <CardContent className="space-y-5">
                <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                  {QUESTION.text}
                </p>
                <div className="relative bg-slate-100 dark:bg-[#020617] border border-slate-200 dark:border-sky-500/10 rounded-lg p-5 font-mono text-sm">
                  <div className="flex gap-1.5 mb-4">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-400/60" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400/60" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/60" />
                  </div>

                  <div className="flex items-center">
                    <Terminal className="w-3.5 h-3.5 text-slate-500 dark:text-slate-600 mr-2.5" />
                    {QUESTION.code.map((t, i) => (
                      <span key={i} className={t.cls}>
                        {t.token}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  {QUESTION.options.map((opt, i) => {
                    const isCorrect = i === QUESTION.answer;
                    const isSelected = i === selected;

                    let cls =
                      "w-full justify-start h-auto py-3 px-4 font-mono text-xs transition-all border ";

                    if (revealed) {
                      if (isCorrect)
                        cls +=
                          "border-emerald-500 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/8";
                      else if (isSelected)
                        cls +=
                          "border-rose-500 text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/8";
                      else
                        cls +=
                          "border-slate-200 dark:border-white/4 text-slate-400";
                    } else if (isSelected) {
                      cls +=
                        "border-sky-400 text-sky-600 dark:text-sky-300 bg-sky-50 dark:bg-sky-500/8";
                    } else {
                      cls +=
                        "border-slate-200 dark:border-white/8 text-slate-600 dark:text-slate-400 hover:border-sky-400";
                    }

                    return (
                      <Button
                        key={i}
                        variant="outline"
                        disabled={revealed}
                        onClick={() => pick(i)}
                        className={cls}
                      >
                        <span className="mr-3 w-4">
                          {String.fromCharCode(65 + i)}.
                        </span>
                        <span>{opt}</span>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <p className="text-[11px] text-sky-500 dark:text-sky-400 tracking-[0.22em] uppercase font-mono">
          // your stats
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-white/5 rounded-2xl p-4">
            <p className="text-[10px] text-slate-500 uppercase mb-1.5">
              Quizzes taken
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {stats.quizzesTaken}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-white/5 rounded-2xl p-4">
            <p className="text-[10px] text-slate-500 uppercase mb-1.5">
              Accuracy
            </p>
            <p className="text-3xl font-bold text-slate-900 dark:text-white">
              {stats.accuracy}%
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-orange-500/10 rounded-2xl p-4 flex items-center gap-4">
          <span className="text-3xl">🔥</span>
          <div>
            <p className="text-xl font-bold text-orange-500 dark:text-orange-400">
              {stats.streakDays}-day streak
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500">
              Keep going!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
