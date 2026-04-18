import CategoryQuizzesClient from "@/components/quiz/category-quizzes";
import { ca } from "zod/v4/locales";

export default async function CategoryQuizzesPage({
  params,
}: {
  params: Promise<{ categoryId: string }>;
}) {
  const { categoryId } = await params;
  return <CategoryQuizzesClient categoryId={Number(categoryId)} />;
}
