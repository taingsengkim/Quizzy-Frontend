import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quizzes/${id}`);
  const data = await res.json();

  return NextResponse.json(data);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = req.cookies.get("better-auth.session_data")?.value;
  const body = await req.json();

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quizzes/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    return NextResponse.json(
      { message: "Failed to update quiz" },
      { status: res.status }
    );
  }

  const data = await res.json();
  return NextResponse.json(data);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/quizzes/${id}`,
    { method: "DELETE" }
  );

  if (!res.ok) {
    return NextResponse.json(
      { message: "Failed to delete quiz" },
      { status: res.status }
    );
  }

  return NextResponse.json({ message: "Quiz deleted successfully" }, { status: 200 });
}