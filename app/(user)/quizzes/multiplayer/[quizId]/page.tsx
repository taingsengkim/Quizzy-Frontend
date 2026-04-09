import MultiplayerQuizPage from "@/components/quiz/multi-player-quiz";

export default async function MultiPlayerPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  const { quizId } = await params;
  return <MultiplayerQuizPage quizId={quizId} />;
}
