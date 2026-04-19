import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string; questionId: string }> }
) {
  const { id, questionId } = await params;
  const { searchParams } = new URL(req.url);
  const attemptId = searchParams.get("attemptId");
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/quizzes/${id}/questions/${questionId}/hint?attemptId=${attemptId}`
  );
  const text = await res.text();

  return new NextResponse(text, {
    status: res.status,
  });
}