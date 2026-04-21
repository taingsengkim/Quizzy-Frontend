import { NextRequest, NextResponse } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const {id} = await params; 
    console.log("QUIZ ID FROM ROUTE HANDLERS ", id)
  const token = req.cookies.get("better-auth.session_data")?.value;
    const body = await req.json();
    const payload = {
      ...body,
      quizId:id
    };
    
    console.log("FINAL PAYLOAD:", payload);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/questions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      }
    );

    return NextResponse.json(await response.json(), { status: 201 });
  } catch (error) {
    console.error("QUESTION_POST_ERROR:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}