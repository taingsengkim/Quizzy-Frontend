"use client";

import React, { useState } from "react";
import {
  useGetQuizToPlayQuery,
  useSubmitQuizResultMutation,
} from "@/lib/features/quizzes/quizzesSlice";

import { Button } from "@/components/ui/button";
import {
  Check,
  ChevronRight,
  Loader2,
  Trophy,
  AlertCircle,
} from "lucide-react";

interface PlayQuizProps {
  quizId: string;
}

export default function PlayQuizComponent({ quizId }: PlayQuizProps) {
  const { data: quiz, isLoading, error } = useGetQuizToPlayQuery(quizId);

  const [submitQuizResult] = useSubmitQuizResultMutation();

  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, number[]>
  >({});
  const [isFinished, setIsFinished] = useState(false);

  if (isLoading)
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
        <p>Loading quiz...</p>
      </div>
    );

  if (error || !quiz)
    return (
      <div className="p-6 text-red-500">
        <AlertCircle />
        Failed to load quiz
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
        ? current.filter((id) => id !== answerId)
        : [...current, answerId];

      setSelectedAnswers({ ...selectedAnswers, [question.id]: updated });
    }
  };

  const handleNext = async () => {
    if (currentIdx < quiz.questions.length - 1) {
      setCurrentIdx((prev) => prev + 1);
    } else {
      const payload = {
        quizId: Number(quizId),
        duration: 0,
        answers: Object.entries(selectedAnswers).map(
          ([questionId, answerIds]) => ({
            questionId: Number(questionId),
            answerId: answerIds,
          }),
        ),
      };

      try {
        await submitQuizResult(payload).unwrap();
        console.log(payload);
        setIsFinished(true);
      } catch (err) {
        console.error("Submit failed", err);
      }
    }
  };

  if (isFinished) {
    return (
      <div className="text-center py-20 space-y-6">
        <Trophy className="w-16 h-16 mx-auto text-yellow-400" />
        <h1 className="text-3xl font-bold">Quiz Completed!</h1>
        <Button onClick={() => (window.location.href = "/quizzes")}>
          Back to quizzes
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-10 space-y-6">
      <div>
        <h2 className="font-bold">{quiz.title}</h2>
        <p>
          Question {currentIdx + 1} / {quiz.questions.length}
        </p>
        <div className="w-full bg-gray-200 h-2 mt-2">
          <div className="bg-sky-500 h-5" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="p-6 border rounded-xl">
        <h3 className="mb-4">{question.text}</h3>

        <div className="space-y-2">
          {question.answers.map((answer: any) => {
            const isSelected = selectedAnswers[question.id]?.includes(
              answer.id,
            );

            return (
              <button
                key={answer.id}
                onClick={() => handleSelection(answer.id)}
                className={`w-full p-4 border rounded-lg flex justify-between ${
                  isSelected ? "bg-sky-200" : ""
                }`}
              >
                {answer.text}
                {isSelected && <Check />}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleNext}
          disabled={
            !selectedAnswers[question.id] ||
            selectedAnswers[question.id].length === 0
          }
        >
          {currentIdx === quiz.questions.length - 1 ? "Finish" : "Next"}
          <ChevronRight className="ml-2 w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
