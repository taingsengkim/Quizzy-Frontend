import EditQuizPage from "@/components/dashboard/quizzes/EditQuizPage";

export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditQuizPage quizId={id} />;
}
