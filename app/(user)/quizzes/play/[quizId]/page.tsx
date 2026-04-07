"use client";

import { useGetQuizByIdQuery } from "@/lib/features/quizzes/quizzesSlice";
import { useState } from "react";

interface Props {
  params: { quizId: string };
}

export default function QuizPage({ params }: Props) {
  const { quizId } = params;
  const { data, isLoading } = useGetQuizByIdQuery(quizId);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<any>({});

  if (isLoading) return <p>Loading quiz...</p>;
  if (!data) return <p>No quiz found</p>;

  const question = data.questions[currentQuestion];

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="text-3xl font-bold text-white mb-4">{data.title}</h1>
      <h2 className="text-lg text-slate-300 mb-4">
        Question {currentQuestion + 1} / {data.questions.length}
      </h2>

      <p className="text-slate-200 mb-4">{question.text}</p>

      <div className="flex flex-col gap-2 mb-6">
        {question.answers.map((a: any) => (
          <button
            key={a.id}
            onClick={() => setAnswers({ ...answers, [question.id]: a.id })}
            className={`py-2 px-4 border rounded text-left ${
              answers[question.id] === a.id
                ? "bg-sky-500 text-white"
                : "bg-slate-800 text-slate-200"
            }`}
          >
            {a.text}
          </button>
        ))}
      </div>

      <button
        onClick={() => setCurrentQuestion((prev) => prev + 1)}
        disabled={currentQuestion + 1 >= data.questions.length}
        className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
      >
        Next
      </button>
    </div>
  );
}
