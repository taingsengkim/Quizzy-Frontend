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
      /* Update the main wrapper to handle theme transitions */
      <div className="relative min-h-screen transition-colors duration-300 bg-white text-slate-900 dark:bg-[#080b14] dark:text-slate-200 overflow-x-hidden font-mono-custom">
        {/* Grid background that adapts opacity */}
        <div className="fixed inset-0 pointer-events-none z-0 grid-bg opacity-30 dark:opacity-100" />

        <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 pt-20 pb-20">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <Badge
                variant="outline"
                className="font-mono-custom text-xs text-sky-600 border-sky-200 bg-sky-50 dark:text-sky-400 dark:border-sky-500/25 dark:bg-sky-500/5"
              >
                &gt; programming quizzes
              </Badge>
            </div>

            <h1 className="font-display text-[clamp(56px,9vw,108px)] font-extrabold leading-[0.92] tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-slate-900 via-slate-800 to-slate-600 dark:from-white dark:via-sky-100 dark:to-violet-300">
              QUIZZY
              <br />
              FOR
              <br />
              DEVS
            </h1>

            <p className="mt-8 text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-md">
              <span className="text-sky-600 dark:text-sky-400">// </span>
              <Typewriter text="Test your code. Prove your rank." />
            </p>

            <div className="flex flex-wrap gap-4 mt-10">
              <Link href={"/quizzes/instant"}>
                <Button
                  size="lg"
                  className="font-mono-custom text-sm bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white shadow-[0_0_40px_rgba(99,102,241,.3)] dark:shadow-[0_0_40px_rgba(99,102,241,.4)] transition-all border-none"
                >
                  <Zap className="w-4 h-4 mr-2" /> start challenge
                </Button>
              </Link>

              <Button
                size="lg"
                variant="outline"
                className="font-mono-custom text-sm border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-sky-500/25 dark:text-sky-400 dark:hover:bg-sky-500/5 dark:hover:text-sky-300 bg-transparent"
              >
                explore topics <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-3 gap-4 mt-14 max-w-xl">
              {STATS.map((s, i) => (
                <Card
                  key={i}
                  className="bg-slate-50/50 border-slate-200 dark:bg-slate-900/70 dark:border-sky-500/10 hover:border-sky-500/30 transition-all hover:-translate-y-1 backdrop-blur-sm shadow-sm dark:shadow-none"
                >
                  <CardContent className="p-5">
                    <div className="mb-3 text-sky-600 dark:text-sky-400">
                      {s.icon}
                    </div>
                    <div className="font-display text-2xl font-extrabold text-slate-900 dark:text-white">
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
        <section className="relative z-10 max-w-6xl mx-auto px-6 md:px-10 pb-13">
          <div
            className="relative rounded-2xl border 
               border-slate-200 dark:border-white/10
               bg-white dark:bg-[#0b1120]
               p-12 md:p-20 text-center overflow-hidden
               shadow-xl dark:shadow-[0_0_40px_rgba(56,189,248,0.08)]
               transition-all duration-300"
          >
            {/* Glow effect (only dark mode) */}
            <div className="absolute inset-0 hidden dark:block">
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-sky-500/10 blur-3xl rounded-full" />
              <div className="absolute bottom-[-80px] right-[-60px] w-[300px] h-[200px] bg-violet-500/10 blur-3xl rounded-full" />
            </div>

            <p className="text-[11px] text-sky-600 dark:text-sky-400 tracking-[0.22em] uppercase mb-5 font-mono">
              // ready to compete?
            </p>

            <h2
              className="font-display text-4xl md:text-6xl font-extrabold 
                 text-slate-900 dark:text-white leading-tight mb-5"
            >
              Stop guessing.
              <br />
              <span
                className="text-transparent bg-clip-text 
                   bg-gradient-to-r 
                   from-sky-600 to-violet-600 
                   dark:from-sky-400 dark:to-violet-400"
              >
                Start proving.
              </span>
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-10">
              Join 50,000+ developers testing their knowledge daily. Climb the
              ranks. Show your skills.
            </p>

            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="font-mono-custom text-sm 
                   bg-gradient-to-r from-sky-500 to-violet-500 
                   text-white px-10 border-none 
                   shadow-lg shadow-sky-500/20
                   hover:scale-105 hover:shadow-sky-500/30
                   transition-all duration-200"
              >
                <Zap className="w-4 h-4 mr-2" /> play for free
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="font-mono-custom text-sm 
                   border-slate-300 text-slate-700 hover:bg-slate-100
                   dark:border-sky-400/30 dark:text-sky-400 
                   dark:hover:bg-sky-500/10 dark:hover:text-white
                   backdrop-blur-sm
                   transition-all duration-200"
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
