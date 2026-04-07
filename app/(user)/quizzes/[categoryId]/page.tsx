// app/quizzes/[categoryId]/page.tsx

import CategoryQuizzesClient from "@/components/quiz/category-quizzes";
import { ca } from "zod/v4/locales";

export default async function CategoryQuizzesPage({
  params,
}: {
  params: Promise<{ categoryId: number }>;
}) {
  const { categoryId } = await params;
  return <CategoryQuizzesClient categoryId={categoryId} />;
}
