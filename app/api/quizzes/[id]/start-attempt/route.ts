import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: number }> }
) {
    const {id} = await params;
    console.log("Quiz Id HINT", id)
  const res = await fetch(
    `http://localhost:8090/api/v1/quizzes/${id}/start-attempt`,
    {
      method: "POST",
    }
  );

  const data = await res.json();

  return NextResponse.json(data);
}