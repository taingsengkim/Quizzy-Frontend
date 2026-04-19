import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
    const {id} = await params;
    console.log("Quiz Id HINT", id)
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/quizzes/${id}/start-attempt`,
    {
      method: "POST",
    }
  );

  const data = await res.json();

  return NextResponse.json(data);
}