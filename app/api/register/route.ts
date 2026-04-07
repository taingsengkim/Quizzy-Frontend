import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const registerData = await req.json();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(registerData),
    });

    const data = await res.json();

    if (!res.ok) {
      return NextResponse.json(
        { message: data.message || "Register failed" },
        { status: res.status }
      );
    }

    //   auto login after register
    const response = NextResponse.json(data);
    if (data.accessToken) {
      response.cookies.set("better-auth.session_data", data.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60,
      });
    }

    return response;
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}