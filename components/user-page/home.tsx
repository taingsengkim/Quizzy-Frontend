"use client";

import { useState, useEffect, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Zap,
  Trophy,
  Code2,
  ChevronRight,
  Terminal,
  Star,
  Users,
  BookOpen,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Globe,
} from "lucide-react";
import { useGetCategoriesQuery } from "@/lib/features/categories/categoriesSlice";
import Navbar from "../share-component/navbar";
import CategoriesSection from "./category-home";
import QuizSidebar from "./quiz-preview";
import Link from "next/link";

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

const LEADERBOARD = [
  {
    rank: 1,
    name: "0xAlice",
    score: 9840,
    badge: "🥇",
    color: "text-amber-400",
  },
  {
    rank: 2,
    name: "byteBob",
    score: 9210,
    badge: "🥈",
    color: "text-slate-300",
  },
  {
    rank: 3,
    name: "devCarla",
    score: 8775,
    badge: "🥉",
    color: "text-orange-400",
  },
  {
    rank: 4,
    name: "null_ptr",
    score: 8340,
    badge: "⚡",
    color: "text-slate-400",
  },
  {
    rank: 5,
    name: "recursion",
    score: 7990,
    badge: "🔥",
    color: "text-slate-400",
  },
];

const STATS = [
  {
    icon: <Users className="w-5 h-5 text-sky-400" />,
    val: "50K+",
    label: "devs ranked",
  },
  {
    icon: <BookOpen className="w-5 h-5 text-violet-400" />,
    val: "600+",
    label: "questions",
  },
  {
    icon: <Globe className="w-5 h-5 text-emerald-400" />,
    val: "12",
    label: "languages",
  },
];

function Typewriter({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    let i = 0;
    const t = setInterval(() => {
      if (i <= text.length) {
        setDisplayed(text.slice(0, i));
        i++;
      } else clearInterval(t);
    }, 42);
    return () => clearInterval(t);
  }, [text]);
  return (
    <span>
      {displayed}
      <span className="inline-block w-0.5 h-[1.1em] bg-sky-400 ml-0.5 align-text-bottom animate-[blink_1s_step-end_infinite]" />
    </span>
  );
}
export default function Home() {
  const [page, setPage] = useState(0);
  const { data: categories } = useGetCategoriesQuery({
    page,
    size: 10,
  });

  return (
    <TooltipProvider>
      <div className="font-mono-custom relative min-h-screen bg-[#080b14] text-slate-200 overflow-x-hidden">
        <div className="grid-bg fixed inset-0 pointer-events-none z-0" />

        <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 pt-40 pb-20">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <Badge
                variant="outline"
                className="font-mono-custom text-xs text-sky-400 border-sky-500/25 bg-sky-500/5"
              >
                &gt; programming quizzes
              </Badge>
            </div>

            <h1 className="font-display text-[clamp(56px,9vw,108px)] font-extrabold leading-[0.92] tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-sky-100 to-violet-300">
              QUIZZY
              <br />
              FOR
              <br />
              DEVS
            </h1>

            <p className="mt-8 text-sm text-slate-500 leading-relaxed max-w-md">
              <span className="text-sky-400">// </span>
              <Typewriter text="Test your code. Prove your rank." />
            </p>

            <div className="flex flex-wrap gap-4 mt-10">
              <Link href={"/quizzes/instant"}>
                {" "}
                <Button
                  size="lg"
                  className="font-mono-custom text-sm bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-[0_0_40px_rgba(99,102,241,.4)] hover:shadow-[0_0_60px_rgba(99,102,241,.6)] transition-all"
                >
                  <Zap className="w-4 h-4 mr-2" /> start challenge
                </Button>
              </Link>

              <Button
                size="lg"
                variant="outline"
                className="font-mono-custom text-sm border-sky-500/25 text-sky-400 hover:bg-sky-500/5 hover:text-sky-300 hover:border-sky-500/50 bg-transparent"
              >
                explore topics <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-4 mt-14 max-w-xl">
              {STATS.map((s, i) => (
                <Card
                  key={i}
                  className="bg-slate-900/70 border border-sky-500/10 hover:border-sky-500/30 transition-all hover:-translate-y-1 backdrop-blur-sm"
                >
                  <CardContent className="p-5">
                    <div className="mb-3">{s.icon}</div>
                    <div className="font-display text-2xl font-extrabold text-white">
                      {s.val}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1 tracking-widest uppercase">
                      {s.label}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        <CategoriesSection categories={categories} />

        <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 py-16">
          <QuizSidebar />
        </section>

        <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 py-16">
          <div className="relative rounded-2xl border border-indigo-500/20 bg-gradient-to-br from-blue-900/20 via-violet-900/15 to-transparent p-12 md:p-20 text-center overflow-hidden">
            <div className="absolute inset-x-0 -top-16 flex justify-center pointer-events-none">
              <div className="w-96 h-52 rounded-full bg-indigo-500/15 blur-3xl" />
            </div>
            <p className="text-[11px] text-sky-400 tracking-[0.22em] uppercase mb-5">
              // ready to compete?
            </p>
            <h2 className="font-display text-4xl md:text-6xl font-extrabold text-white leading-tight mb-5">
              Stop guessing.
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-violet-400">
                Start proving.
              </span>
            </h2>
            <p className="text-sm text-slate-500 max-w-md mx-auto mb-10">
              Join 50,000+ developers testing their knowledge daily. Climb the
              ranks. Show your skills.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="font-mono-custom text-sm bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 shadow-[0_0_50px_rgba(99,102,241,.5)] hover:shadow-[0_0_70px_rgba(99,102,241,.7)] transition-all px-10"
              >
                <Zap className="w-4 h-4 mr-2" /> play for free
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="font-mono-custom text-sm hover:text-white border-sky-500/25 text-sky-400 hover:bg-sky-500/5 hover:border-sky-400/40 bg-transparent"
              >
                <Star className="w-4 h-4 mr-2" /> view all categories
              </Button>
            </div>
          </div>
        </section>
      </div>
    </TooltipProvider>
  );
}
