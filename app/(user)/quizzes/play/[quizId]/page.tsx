"use client";

import { useGetQuizByIdQuery } from "@/lib/features/quizzes/quizzesSlice";
import { useState, use } from "react"; // Added 'use' to handle params
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Check, ChevronRight, Loader2, Trophy } from "lucide-react";
import PlayQuizComponent from "@/components/quiz/QuizPlayPage";

interface Props {
  params: Promise<{ quizId: string }>;
}

export default function QuizPage({ params }: Props) {
  const resolvedParams = use(params);
  const quizId = resolvedParams.quizId;

  return <PlayQuizComponent quizId={quizId} />;
}
