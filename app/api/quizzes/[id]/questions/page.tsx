import { NextResponse } from "next/server";

export async function POST(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const quizId = params.id;
    const body = await request.json();
    const payload = {
      ...body,
      quizId: Number(quizId),
    };

    const response = await fetch(`http://localhost:8090/api/v1/questions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { message: errorData.message || "Backend error" },
        { status: response.status },
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("QUESTION_POST_ERROR:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 },
    );
  }
}
