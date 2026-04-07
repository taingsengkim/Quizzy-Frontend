import { NextRequest, NextResponse } from "next/server";

export async function GET(
 req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
    const { id } =  await params;

  console.log("ID:", id);

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/quizzes/categories/${id}`
  );

  const data = await res.json();

  return NextResponse.json(data);
}