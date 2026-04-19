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
    <div className="flex flex-col gap-4">
      <div className=" gap-10 items-start">
        {/* Quiz preview */}
        <div>
          <p className="text-[11px] text-sky-400 tracking-[0.22em] uppercase mb-2">
            // try a question
          </p>
          <h2 className="font-display text-3xl font-extrabold text-white mb-8">
            Can you answer this?
          </h2>

          <Card className="bg-slate-900/80 border border-sky-500/12 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <Badge
                variant="outline"
                className="font-mono-custom text-xs text-blue-400 border-blue-500/25 bg-blue-500/5"
              >
                <Code2 className="w-3 h-3 mr-1.5" />
                {QUESTION.lang}
              </Badge>
              <span className="text-[10px] text-slate-600 font-mono">
                Q#4481
              </span>
            </CardHeader>

            <CardContent className="space-y-5">
              <p className="text-sm text-slate-300 leading-relaxed">
                {QUESTION.text}
              </p>

              {/* Code block */}
              <div className="relative bg-[#020617] border border-sky-500/10 rounded-lg p-5 font-mono text-sm">
                <div className="flex gap-1.5 mb-4">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                </div>
                <div className="flex items-center gap-0">
                  <Terminal className="w-3.5 h-3.5 text-slate-600 mr-2.5" />
                  {QUESTION.code.map((t, i) => (
                    <span key={i} className={t.cls}>
                      {t.token}
                    </span>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div className="space-y-2">
                {QUESTION.options.map((opt, i) => {
                  const isCorrect = i === QUESTION.answer;
                  const isSelected = i === selected;

                  let cls =
                    "w-full justify-start h-auto py-3 px-4 font-mono-custom text-xs transition-all border ";

                  if (revealed) {
                    if (isCorrect)
                      cls +=
                        "border-emerald-500/50 text-emerald-400 bg-emerald-500/8 hover:bg-emerald-500/8";
                    else if (isSelected)
                      cls +=
                        "border-rose-500/50 text-rose-400 bg-rose-500/8 hover:bg-rose-500/8";
                    else
                      cls +=
                        "border-white/4 text-slate-600 bg-transparent hover:bg-transparent";
                  } else if (isSelected) {
                    cls += "border-sky-400/50 text-sky-300 bg-sky-500/8";
                  } else {
                    cls +=
                      "border-white/8 text-slate-400 bg-transparent hover:border-sky-500/40 hover:text-slate-200 hover:bg-sky-500/5";
                  }
                  return (
                    <Button
                      key={i}
                      variant="outline"
                      disabled={revealed}
                      onClick={() => pick(i)}
                      className={cls}
                    >
                      <span className="text-slate-600 mr-3 w-4 shrink-0">
                        {String.fromCharCode(65 + i)}.
                      </span>
                      <span>{opt}</span>
                      {revealed && isCorrect && (
                        <CheckCircle2 className="w-4 h-4 ml-auto text-emerald-400 shrink-0" />
                      )}
                      {revealed && isSelected && !isCorrect && (
                        <XCircle className="w-4 h-4 ml-auto text-rose-400 shrink-0" />
                      )}
                    </Button>
                  );
                })}
              </div>
              {revealed ? (
                <div className="animate-fade-up rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4 text-xs text-emerald-300 leading-relaxed">
                  💡 <strong>typeof null === &quot;object&quot;</strong> —{" "}
                  {QUESTION.explanation}
                </div>
              ) : (
                <p className="text-center text-[10px] text-slate-700 tracking-[0.18em] uppercase pt-1">
                  select an answer above
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      {/* Label */}
      <p className="text-[11px] text-sky-400 tracking-[0.22em] uppercase font-mono">
        // your stats
      </p>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900/70 border border-white/5 rounded-2xl p-4">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1.5">
            Quizzes taken
          </p>
          <p className="font-display font-extrabold text-3xl text-white leading-none">
            {stats.quizzesTaken}
          </p>
          <p className="text-[11px] text-sky-400 mt-1.5">
            ↑ {stats.quizzesThisWeek} this week
          </p>
        </div>

        <div className="bg-slate-900/70 border border-white/5 rounded-2xl p-4">
          <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1.5">
            Accuracy
          </p>
          <p className="font-display font-extrabold text-3xl text-white leading-none">
            {stats.accuracy}
            <span className="text-base text-slate-600 font-normal">%</span>
          </p>
          <p className="text-[11px] text-violet-400 mt-1.5">
            ↑ {stats.accuracyDelta}% vs last week
          </p>
        </div>
      </div>

      {/* Streak */}
      <div className="bg-slate-900/70 border border-orange-500/10 rounded-2xl p-4 flex items-center gap-4">
        <span className="text-3xl leading-none select-none">🔥</span>
        <div>
          <p className="font-display font-extrabold text-xl text-orange-400 leading-none">
            {stats.streakDays}-day streak
          </p>
          <p className="text-xs text-slate-500 mt-1">
            Keep going — you&apos;re on a roll!
          </p>
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-slate-900/70 border border-white/5 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-slate-200">
            Top players this week
          </p>
          <Link
            href="/leaderboard"
            className="text-[11px] text-sky-400 hover:text-sky-300 transition flex items-center gap-1"
          >
            view all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="flex flex-col divide-y divide-white/[0.03]">
          {leaderboard.map((entry) => (
            <div key={entry.rank} className="flex items-center gap-3 py-2.5">
              <span
                className={`font-mono text-[11px] w-5 shrink-0 ${
                  entry.rank <= 3 ? "text-amber-500" : "text-slate-600"
                }`}
              >
                {String(entry.rank).padStart(2, "0")}
              </span>
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${entry.color} ${entry.textColor}`}
              >
                {entry.initials}
              </div>
              <span className="text-sm text-slate-300 flex-1 font-mono">
                {entry.username}
              </span>
              <span className="text-xs text-sky-400 font-mono">
                {entry.score.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Trending topics */}
      <div className="bg-slate-900/70 border border-white/5 rounded-2xl p-4">
        <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-3">
          Trending topics
        </p>
        <div className="flex flex-wrap gap-2">
          {TRENDING_TOPICS.map((topic) => (
            <Link
              key={topic.label}
              href={`/quizzes?topic=${topic.label.toLowerCase()}`}
              className={`text-[11px] px-3 py-1.5 rounded-full border font-mono transition-all
                ${
                  topic.hot
                    ? "border-violet-500/30 text-violet-400 bg-violet-500/6 hover:bg-violet-500/12"
                    : "border-white/7 text-slate-500 hover:border-sky-500/30 hover:text-sky-400"
                }`}
            >
              {topic.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
