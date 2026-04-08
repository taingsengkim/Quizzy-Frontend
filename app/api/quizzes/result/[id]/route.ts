import { NextRequest, NextResponse } from "next/server";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params; 

  const token = req.cookies.get("better-auth.session_data")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/quizzes/result/${id}`,
      {
        headers: {
          Authorization: `Bearer ${token}`, // forward the token
          "Content-Type": "application/json",
        },
      },
    );

   if (!res.ok) {
      console.log("Backend response status:", res.status);
      return NextResponse.json(
        { error: "Failed to fetch quiz result" },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}