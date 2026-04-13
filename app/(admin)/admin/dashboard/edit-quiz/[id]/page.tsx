import EditQuizPage from "@/components/dashboard/add-quizzes/EditQuizPage";

export default async function EditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <EditQuizPage quizId={id} />;
}
