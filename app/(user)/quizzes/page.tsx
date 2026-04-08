import QuizPageComponent from "@/components/quiz/quizzes-page";
import { Zap } from "lucide-react";

export default function QuizPage() {
  return (
    <div className=" max-w-6xl mx-auto  px-6 py-12">
      <br />
      <br />
      <br />
      <div className="mb-12">
        <div className="flex items-center  gap-2 mb-3">
          <Zap className="w-5 h-5 text-yellow-500" />
          <span className="text-xs font-mono  text-slate-500 tracking-widest uppercase">
            System / Categories
          </span>
        </div>
        <h1 className=" p-4 text-3xl md:text-4xl font-black text-white uppercase italic">
          Neural <span className="text-sky-400">Sectors</span>
        </h1>
      </div>
      <QuizPageComponent />
    </div>
  );
}
