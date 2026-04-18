export default function NotFoundQuiz() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d121f] text-white px-6">
      <div className="text-center max-w-md space-y-6">
        <h1 className="text-6xl font-bold text-sky-500">404</h1>

        <h2 className="text-2xl font-semibold">Quiz Not Found</h2>

        <p className="text-slate-400 text-sm">
          The quiz you are looking for does not exist or may have been removed.
        </p>

        <a
          href="/quizzes"
          className="inline-block px-6 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-400 text-black font-semibold hover:opacity-90 transition"
        >
          Go back to quizzes
        </a>
      </div>
    </div>
  );
}
