import MultiplayerQuizPage from "@/components/quiz/multi-player-quiz";
import NotFoundQuiz from "@/components/share-component/not-found-quiz";

export default async function MultiPlayerPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  const { quizId } = await params;

  const res = await fetch(`http://localhost:8090/api/v1/quizzes/${quizId}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    return <NotFoundQuiz />;
  }

  return <MultiplayerQuizPage quizId={quizId} />;
}
