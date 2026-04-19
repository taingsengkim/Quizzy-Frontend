"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NotFoundPage() {
  const router = useRouter();
  return (
    <main className="relative min-h-screen w-full flex flex-col items-center justify-center px-6 text-center  overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(99,102,241,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.05) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="inline-flex items-center gap-2 bg-violet-100 text-sky-500 text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-10">
        <span className="w-1.5 h-1.5 rounded-full bg-sky-500 inline-block" />
        Error 404
      </div>
      <div className="relative inline-block">
        <h1
          className="font-extrabold text-sky-700 leading-none"
          style={{
            fontFamily: "'Syne', sans-serif",
            fontSize: "clamp(80px, 18vw, 140px)",
            letterSpacing: "-4px",
          }}
        >
          404
        </h1>
        <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-12 h-[3px] bg-indigo-500 rounded-full" />
      </div>
      <h2
        className="mt-10 mb-3 text-2xl md:text-3xl font-bold text-sky-700"
        style={{ fontFamily: "'Syne', sans-serif" }}
      >
        Page not found
      </h2>
      <p className="text-gray-500 text-base leading-relaxed max-w-sm mb-10">
        The page you&apos;re looking for doesn&apos;t exist or may have been
        moved. Let&apos;s get you back on track.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <Link
          href="/"
          className="inline-flex items-center justify-center px-7 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
        >
          Back to home
        </Link>
        <Link
          href="/quizzes"
          className="inline-flex items-center justify-center px-7 py-3 bg-white hover:bg-indigo-50 text-indigo-700 text-sm font-medium rounded-xl border border-indigo-200 hover:border-indigo-400 transition-all duration-150 hover:-translate-y-0.5 active:scale-95"
        >
          Browse quizzes
        </Link>
      </div>
      <button
        onClick={() => router.back()}
        className="text-gray-400 hover:text-indigo-500 text-sm underline underline-offset-4 transition-colors"
      >
        Go back to previous page
      </button>
      <p className="absolute bottom-6 left-1/2 -translate-x-1/2 font-mono text-[11px] text-violet-300 tracking-wide whitespace-nowrap">
        QUIZZY_ERR_404 // SESSION_REMAINING: NULL
      </p>
    </main>
  );
}
