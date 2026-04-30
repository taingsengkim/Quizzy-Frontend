import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("access_token")?.value;
    const body = await req.json();

    console.log("token:", token);
    console.log("body:", body);

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quizzes/result/submit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const text = await res.text(); 
    console.log("backend response:", text);

    if (!res.ok) {
      return NextResponse.json(
        { error: text || "Backend error" },
        { status: res.status }
      );
    }

    const data = JSON.parse(text); 
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("API ERROR:", error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}