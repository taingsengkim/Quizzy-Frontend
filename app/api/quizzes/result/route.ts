import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Read token from the HTTP-only cookie
  const token = req.cookies.get("better-auth.session_data")?.value;
  
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/quizzes/result/history`,
      {
        headers: {
          Authorization: `Bearer ${token}`, // <-- forward the token
          "Content-Type": "application/json",
        },
      },
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: "Failed to fetch history" },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}