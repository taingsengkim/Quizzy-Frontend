import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const loginData = await req.json();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loginData),
    });

    if (!res.ok) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = await res.json();

    // Create a response
    const response = NextResponse.json(data);

    // Set access token in HTTP-only cookie
    response.cookies.set("better-auth.session_data", data.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1 hour
    });

    return response;

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}