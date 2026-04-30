import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = req.cookies.get("access_token")?.value;

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/questions/random?${searchParams.toString()}`,
      {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    const text = await res.text();

    if (!res.ok) {
      return NextResponse.json(
        { error: text || "Backend error" },
        { status: res.status }
      );
    }

    return NextResponse.json(JSON.parse(text));

  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}